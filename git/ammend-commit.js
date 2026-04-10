#!/usr/bin/env node
/**
 * Git filter-branch helpers: normalize Made-with / Co-Authored-By trailers and
 * optionally enforce author/committer via env-filter.
 *
 * Uses msg-filter-env / env-filter-env with MGM_* env vars (Git for Windows sh).
 *
 * Safety: never runs git push, git fetch, or other remote commands; only mutates
 * the checked-out local branch in the same repo as process.cwd().
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);

function git(repo, ...gitArgs) {
  const r = spawnSync("git", ["-C", repo, ...gitArgs], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) {
    const e = new Error((r.stderr || "").trim() || `git exited ${r.status}`);
    e.status = r.status;
    throw e;
  }
  return (r.stdout || "").trim();
}

/** `git filter-branch` refuses to run if the worktree or index differs from HEAD. */
function assertCleanWorktreeForFilterBranch(repo) {
  const r = spawnSync("git", ["-C", repo, "status", "--porcelain"], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) {
    console.error((r.stderr || "").trim() || `git status exited ${r.status}`);
    process.exit(1);
  }
  const lines = (r.stdout || "")
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0);
  const dirty = lines.filter((l) => {
    if (l.startsWith("##")) return false;
    if (l.startsWith("??")) return false; // untracked only — git filter-branch still allows this
    return true;
  });
  if (dirty.length > 0) {
    console.error(
      "Cannot rewrite history: staged or unstaged changes to tracked files (git filter-branch requirement).",
    );
    console.error("Commit, stash, or discard those changes, then rerun. Example: git stash push -m \"pre-amend-commit\"");
    process.exit(1);
  }
}

function resolveFullSha(repo, rev) {
  return git(repo, "rev-parse", "--verify", rev);
}

function defaultBaseRef(repo) {
  for (const name of ["origin/main", "origin/master", "main", "master"]) {
    try {
      return resolveFullSha(repo, name);
    } catch {
      /* try next */
    }
  }
  console.error(
    "Could not resolve a base branch (tried origin/main, origin/master, main, master). Pass --base explicitly.",
  );
  process.exit(1);
}

function mergeBase(repo, base, head) {
  return git(repo, "merge-base", base, head);
}

function repoRoot(repoPath) {
  return path.resolve(git(repoPath, "rev-parse", "--show-toplevel"));
}

function sameGitRoot(a, b) {
  const x = path.resolve(a);
  const y = path.resolve(b);
  if (process.platform === "win32") return x.toLowerCase() === y.toLowerCase();
  return x === y;
}

/** Local branch short name, or empty if detached HEAD. */
function currentBranchShortName(repo) {
  try {
    return git(repo, "branch", "--show-current");
  } catch {
    return "";
  }
}

/** True if `ancestor` is an ancestor of `descendantTip` (tips may be refs or SHAs). */
function isAncestorOf(repo, ancestorSha, descendantTip) {
  const a = resolveFullSha(repo, ancestorSha);
  const m = mergeBase(repo, a, descendantTip);
  return m === a;
}

function stripTrailerBlock(msg) {
  const m = msg.replace(/\n+$/, "");
  const low = m.toLowerCase();
  const key = "\n\nmade-with:";
  const i = low.lastIndexOf(key);
  if (i === -1) return m.trimEnd();
  return m.slice(0, i).trimEnd();
}

function formatMessage(body, madeWith, coAuthoredBy) {
  let b = stripTrailerBlock(body);
  if (b && !b.endsWith("\n")) b += "\n";
  return `${b}\n\nMade-with: ${madeWith}\n\nCo-Authored-By: ${coAuthoredBy}\n`;
}

function shQuote(s) {
  if (/^[a-zA-Z0-9_./:@+-]+$/.test(s)) return s;
  return "'" + s.replace(/'/g, "'\"'\"'") + "'";
}

function filterCmd(nodeBin, scriptPath, sub) {
  const n = nodeBin.replace(/\\/g, "/");
  const sp = scriptPath.replace(/\\/g, "/");
  return `${shQuote(n)} ${shQuote(sp)} ${sub}`;
}

function readStdinUtf8() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function cmdMsgFilter(madeWith, coAuthoredBy, onlyCommit) {
  const raw = readStdinUtf8();
  if (onlyCommit) {
    const current = process.env.GIT_COMMIT || "";
    if (current !== onlyCommit) {
      process.stdout.write(raw);
      return;
    }
  }
  process.stdout.write(formatMessage(raw, madeWith, coAuthoredBy));
}

function cmdMsgFilterEnv() {
  const raw = readStdinUtf8();
  const madeWith = process.env.MGM_MADE_WITH;
  const co = process.env.MGM_CO_AUTHORED_BY;
  const only = process.env.MGM_ONLY_COMMIT || "";
  if (!madeWith || co === undefined) {
    console.error("msg-filter-env requires MGM_MADE_WITH and MGM_CO_AUTHORED_BY");
    process.exit(1);
  }
  if (only) {
    const current = process.env.GIT_COMMIT || "";
    if (current !== only) {
      process.stdout.write(raw);
      return;
    }
  }
  process.stdout.write(formatMessage(raw, madeWith, co));
}

function cmdEnvFilterPrint(authorName, authorEmail, committerName, committerEmail, onlyCommit) {
  const current = process.env.GIT_COMMIT || "";
  if (onlyCommit && current !== onlyCommit) return;
  process.stdout.write(
    `export GIT_AUTHOR_NAME=${shQuote(authorName)}\n` +
      `export GIT_AUTHOR_EMAIL=${shQuote(authorEmail)}\n` +
      `export GIT_COMMITTER_NAME=${shQuote(committerName)}\n` +
      `export GIT_COMMITTER_EMAIL=${shQuote(committerEmail)}\n`,
  );
}

function cmdEnvFilterEnv() {
  const only = process.env.MGM_ONLY_COMMIT || "";
  if (only) {
    const current = process.env.GIT_COMMIT || "";
    if (current !== only) return;
  }
  const an = process.env.MGM_AUTHOR_NAME;
  const ae = process.env.MGM_AUTHOR_EMAIL;
  const cn = process.env.MGM_COMMITTER_NAME;
  const ce = process.env.MGM_COMMITTER_EMAIL;
  if (!an || !ae || !cn || !ce) {
    console.error("env-filter-env requires MGM_AUTHOR_* and MGM_COMMITTER_*");
    process.exit(1);
  }
  process.stdout.write(
    `export GIT_AUTHOR_NAME=${shQuote(an)}\n` +
      `export GIT_AUTHOR_EMAIL=${shQuote(ae)}\n` +
      `export GIT_COMMITTER_NAME=${shQuote(cn)}\n` +
      `export GIT_COMMITTER_EMAIL=${shQuote(ce)}\n`,
  );
}

function buildFilterEnv(
  madeWith,
  coAuthoredBy,
  authorName,
  authorEmail,
  committerName,
  committerEmail,
  onlyCommit,
  messageOnly,
) {
  const e = { ...process.env };
  e.MGM_MADE_WITH = madeWith;
  e.MGM_CO_AUTHORED_BY = coAuthoredBy;
  if (onlyCommit) e.MGM_ONLY_COMMIT = onlyCommit;
  else delete e.MGM_ONLY_COMMIT;
  if (!messageOnly) {
    e.MGM_AUTHOR_NAME = authorName;
    e.MGM_AUTHOR_EMAIL = authorEmail;
    e.MGM_COMMITTER_NAME = committerName;
    e.MGM_COMMITTER_EMAIL = committerEmail;
  }
  if (e.FILTER_BRANCH_SQUELCH_WARNING === undefined) e.FILTER_BRANCH_SQUELCH_WARNING = "1";
  return e;
}

function runFilterBranch(
  repo,
  revList,
  scriptPath,
  madeWith,
  coAuthoredBy,
  authorName,
  authorEmail,
  committerName,
  committerEmail,
  onlyCommit,
  messageOnly,
) {
  const nodeBin = process.execPath;
  const sp = path.normalize(scriptPath);
  const msgFilterCmd = filterCmd(nodeBin, sp, "msg-filter-env");
  const childEnv = buildFilterEnv(
    madeWith,
    coAuthoredBy,
    authorName,
    authorEmail,
    committerName,
    committerEmail,
    onlyCommit,
    messageOnly,
  );

  const final = [
    "git",
    "-C",
    repo,
    "filter-branch",
    "-f",
    "--msg-filter",
    msgFilterCmd,
    "--tag-name-filter",
    "cat",
    "--",
    revList,
  ];

  if (!messageOnly) {
    const envFilterSh = `eval "$(${filterCmd(nodeBin, sp, "env-filter-env")})"`;
    const i = final.indexOf("-f") + 1;
    final.splice(i, 0, "--env-filter", envFilterSh);
  }

  console.error("+", final.join(" "));
  const r = spawnSync(final[0], final.slice(1), {
    env: childEnv,
    stdio: "inherit",
    windowsHide: true,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function parseRunArgs(argv) {
  const o = {
    repo: ".",
    head: null,
    mode: null,
    base: null,
    commit: null,
    madeWith: null,
    coAuthoredBy: null,
    authorName: "",
    authorEmail: "",
    committerName: "",
    committerEmail: "",
    messageOnly: false,
    fullBranch: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--message-only") {
      o.messageOnly = true;
      continue;
    }
    if (a === "--full-branch") {
      o.fullBranch = true;
      continue;
    }
    if (!a.startsWith("--")) {
      console.error(`Unexpected argument: ${a}`);
      process.exit(1);
    }
    const key = a.slice(2);
    const val = argv[++i];
    if (val === undefined || val.startsWith("--")) {
      console.error(`Missing value for --${key}`);
      process.exit(1);
    }
    switch (key) {
      case "repo":
        o.repo = val;
        break;
      case "head":
        o.head = val;
        break;
      case "mode":
        o.mode = val;
        break;
      case "base":
        o.base = val;
        break;
      case "commit":
        o.commit = val;
        break;
      case "made-with":
        o.madeWith = val;
        break;
      case "co-authored-by":
        o.coAuthoredBy = val;
        break;
      case "author-name":
        o.authorName = val;
        break;
      case "author-email":
        o.authorEmail = val;
        break;
      case "committer-name":
        o.committerName = val;
        break;
      case "committer-email":
        o.committerEmail = val;
        break;
      default:
        console.error(`Unknown option: --${key}`);
        process.exit(1);
    }
  }
  return o;
}

function cmdRun(argv) {
  const args = parseRunArgs(argv);
  let repoArgResolved;
  try {
    repoArgResolved = path.resolve(args.repo);
    git(repoArgResolved, "rev-parse", "-q", "--git-dir");
  } catch {
    console.error("Not a Git repository (or invalid --repo).");
    process.exit(1);
  }

  let cwdRoot;
  try {
    cwdRoot = repoRoot(process.cwd());
  } catch {
    console.error("Current working directory is not inside a Git repository.");
    process.exit(1);
  }

  const repoRootDir = repoRoot(repoArgResolved);
  if (!sameGitRoot(cwdRoot, repoRootDir)) {
    console.error(
      "Refusing: run from inside the target repository and point --repo at that same work tree (default: .). " +
        `cwd Git root: ${cwdRoot}; --repo Git root: ${repoRootDir}`,
    );
    process.exit(1);
  }

  const repo = repoRootDir;
  const scriptPath = path.resolve(__filename);

  const currentBranch = currentBranchShortName(repo);
  if (!currentBranch) {
    console.error(
      "Detached HEAD: checkout a local branch first. This tool only rewrites the currently checked-out branch.",
    );
    process.exit(1);
  }

  const headOpt = args.head;
  if (headOpt != null && headOpt !== currentBranch && headOpt !== "HEAD") {
    console.error(
      `Refusing: --head must be the checked-out branch (${currentBranch}) or HEAD, not ${JSON.stringify(headOpt)}. Other local branches are not modified.`,
    );
    process.exit(1);
  }
  if (headOpt === "HEAD") {
    const tip = resolveFullSha(repo, "HEAD");
    const brTip = resolveFullSha(repo, currentBranch);
    if (tip !== brTip) {
      console.error("HEAD does not match the tip of the current branch; refusing.");
      process.exit(1);
    }
  }

  const headRefSym = currentBranch;

  let revList;
  let onlyCommit = null;

  if (args.mode === "all") {
    if (args.fullBranch) {
      revList = headRefSym;
      console.error(
        `Note: --full-branch — rewriting every commit reachable from ${headRefSym} (not just merge-base..HEAD). ` +
          `Refs like main that still point at old SHAs are unchanged until you update them.`,
      );
    } else {
      const baseRef = args.base || defaultBaseRef(repo);
      const baseSha = resolveFullSha(repo, baseRef);
      const headSha = resolveFullSha(repo, headRefSym);
      const mb = mergeBase(repo, baseSha, headSha);
      revList = `${mb}..${headRefSym}`;
      // When the branch tip equals merge-base(base, HEAD), `mb..HEAD` is empty (no commits "only"
      // on this branch vs base). Users still expect --mode all to rewrite commits reachable from
      // the checked-out branch tip — use the branch ref alone so filter-branch walks full ancestry.
      let nExclusive = 0;
      try {
        nExclusive = Number.parseInt(git(repo, "rev-list", "--count", revList), 10);
      } catch {
        nExclusive = 0;
      }
      if (!Number.isFinite(nExclusive) || nExclusive <= 0) {
        const baseLabel = args.base ?? "default upstream (origin/main, main, …)";
        console.error(
          `Note: empty range ${mb.slice(0, 7)}..${headRefSym} vs merge-base with ${baseLabel} — ` +
            `rewriting all commits reachable from ${headRefSym}. ` +
            `Other refs that pointed at the same commits are not moved; only this branch updates.`,
        );
        revList = headRefSym;
      }
    }
  } else if (args.mode === "single") {
    if (!args.commit) {
      console.error("mode=single requires --commit");
      process.exit(1);
    }
    const commit = resolveFullSha(repo, args.commit);
    if (!isAncestorOf(repo, commit, headRefSym)) {
      console.error(
        "Refusing: --commit must be an ancestor of the current branch tip (commit must lie on this branch’s history).",
      );
      process.exit(1);
    }
    revList = `${commit}^..${headRefSym}`;
    onlyCommit = commit;
  } else {
    console.error("--mode must be all or single");
    process.exit(1);
  }

  if (args.fullBranch && args.mode !== "all") {
    console.error("--full-branch is only valid with --mode all");
    process.exit(1);
  }

  if (!args.madeWith || args.coAuthoredBy === null || args.coAuthoredBy === undefined) {
    console.error("--made-with and --co-authored-by are required");
    process.exit(1);
  }

  if (!args.messageOnly) {
    const missing = [];
    if (!args.authorName) missing.push("--author-name");
    if (!args.authorEmail) missing.push("--author-email");
    if (!args.committerName) missing.push("--committer-name");
    if (!args.committerEmail) missing.push("--committer-email");
    if (missing.length) {
      console.error(`without --message-only, these are required: ${missing.join(", ")}`);
      process.exit(1);
    }
  }

  let n = 0;
  try {
    n = Number.parseInt(git(repo, "rev-list", "--count", revList), 10);
  } catch {
    n = 0;
  }
  if (!Number.isFinite(n) || n <= 0) {
    console.error(
      `No commits in range ${JSON.stringify(revList)}; nothing to rewrite. ` +
        `Try --mode single --commit <hash>, or --base pointing to an ancestor of your branch tip.`,
    );
    process.exit(1);
  }

  assertCleanWorktreeForFilterBranch(repo);

  runFilterBranch(
    repo,
    revList,
    scriptPath,
    args.madeWith,
    args.coAuthoredBy,
    args.authorName,
    args.authorEmail,
    args.committerName,
    args.committerEmail,
    onlyCommit,
    args.messageOnly,
  );
}

function printRunHelp() {
  console.log(`Usage: node amend_commit_meta.mjs run [options]

Local-only: same Git root as cwd; only the checked-out local branch is rewritten.
No git push/fetch/remotes are run.

Options:
  --repo <path>              Must resolve to the same repo as cwd (default: .)
  --head <ref>               Optional; must be HEAD or the current branch name
  --mode all|single          Revision scope
  --full-branch              With mode=all: rewrite every commit reachable from the branch tip
                             (full history). Default without this flag: merge-base(base,HEAD)..HEAD
                             only (commits not already on the integration base).
  --base <ref>               For mode=all (read-only; default: origin/main, main, …). Ignored if
                             --full-branch. If the exclusive range is empty, full ancestry is used.
  --commit <hash>            For mode=single; must be on current branch history
  --made-with <text>
  --co-authored-by <text>
  --author-name / --author-email / --committer-name / --committer-email
                             Required unless --message-only
  --message-only             Rewrite messages only; keep author/committer
`);
}

function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];

  if (cmd === "-h" || cmd === "--help") {
    console.log(`Usage: node amend_commit_meta.mjs <command> ...

Commands:
  run              Run git filter-branch (see: node ... run --help)
  msg-filter       <madeWith> <coAuthoredBy> [--only-commit <sha>]
  msg-filter-env   Read MGM_* env; stdin = commit message
  env-filter-print <authorName> <authorEmail> <committerName> <committerEmail> [--only-commit <sha>]
  env-filter-env   Read MGM_AUTHOR_* / MGM_COMMITTER_* / optional MGM_ONLY_COMMIT
`);
    process.exit(0);
  }

  if (!cmd) {
    console.error("Missing command. Try: node amend_commit_meta.mjs --help");
    process.exit(1);
  }

  if (cmd === "run") {
    const rest = argv.slice(1);
    if (rest[0] === "-h" || rest[0] === "--help") {
      printRunHelp();
      process.exit(0);
    }
    cmdRun(rest);
    return;
  }

  if (cmd === "msg-filter-env") {
    cmdMsgFilterEnv();
    return;
  }

  if (cmd === "env-filter-env") {
    cmdEnvFilterEnv();
    return;
  }

  if (cmd === "msg-filter") {
    const madeWith = argv[1];
    const co = argv[2];
    if (!madeWith || !co) {
      console.error("Usage: msg-filter <madeWith> <coAuthoredBy> [--only-commit <sha>]");
      process.exit(1);
    }
    let only = null;
    if (argv[3] === "--only-commit") only = argv[4];
    cmdMsgFilter(madeWith, co, only);
    return;
  }

  if (cmd === "env-filter-print") {
    const [an, ae, cn, ce] = argv.slice(1, 5);
    if (!an || !ae || !cn || !ce) {
      console.error(
        "Usage: env-filter-print <authorName> <authorEmail> <committerName> <committerEmail> [--only-commit <sha>]",
      );
      process.exit(1);
    }
    let only = null;
    const i = argv.indexOf("--only-commit");
    if (i !== -1 && argv[i + 1]) only = argv[i + 1];
    cmdEnvFilterPrint(an, ae, cn, ce, only);
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  process.exit(1);
}

main();
