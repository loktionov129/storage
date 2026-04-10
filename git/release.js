#!/usr/bin/env node
/**
 * Local release helper:
 * - Analyze Conventional Commits since the last tag.
 * - Suggest a SemVer version and generate a Markdown changelog.
 * - (Optionally) create/push vX.Y.Z tag.
 *
 * Run 
 *   node release.js
 *
 * Flags (backwards compatible):
 *   --version=1.2.3   Explicit SemVer (overrides auto-suggestion).
 *   --message="..."   Tag annotation message (default: "Release vX.Y.Z").
 *   --no-push         Do not push the tag to origin.
 *   --open-browser    Open the GitHub Releases page for the new tag.
 *   --dry-run         Do not create or push tags; just show what would happen.
 *   --force           Overwrite an existing tag locally (and on push if allowed).
 */

const { spawnSync } = require("child_process");
const readline = require("readline");

// Strict SemVer: no leading zeroes except for 0 itself.
const SEMVER_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

function log(msg) {
  console.log(`[release] ${msg}`);
}

function warn(msg) {
  console.warn(`[release] ${msg}`);
}

function die(msg, code = 1) {
  console.error(`[release] ERROR: ${msg}`);
  process.exit(code);
}

function git(args, opts = {}) {
  const r = spawnSync("git", args, {
    encoding: "utf8",
    ...opts,
  });
  return {
    status: r.status ?? 1,
    stdout: (r.stdout || "").trim(),
    stderr: (r.stderr || "").trim(),
  };
}

function parseArgs(argv) {
  const out = {
    version: null,
    message: null,
    push: true,
    openBrowser: false,
    dryRun: false,
    force: false,
  };
  for (const a of argv) {
    if (a === "--no-push") out.push = false;
    else if (a === "--open-browser") out.openBrowser = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--force") out.force = true;
    else if (a.startsWith("--version=")) out.version = a.slice("--version=".length);
    else if (a.startsWith("--message=")) out.message = a.slice("--message=".length);
  }
  return out;
}

function repoRoot() {
  const { status, stdout, stderr } = git(["rev-parse", "--show-toplevel"]);
  if (status !== 0) {
    die(
      `Not inside a Git repository (git rev-parse failed).\n` +
        `Hint: Run this script from the root of a cloned Git repo.\n` +
        (stderr || "").trim()
    );
  }
  return stdout;
}

function tagExists(tag) {
  const { status } = git(["rev-parse", `refs/tags/${tag}`]);
  return status === 0;
}

function remotePushUrl() {
  const { status, stdout } = git(["remote", "get-url", "--push", "origin"]);
  if (status !== 0) return null;
  return stdout;
}

/** Best-effort GitHub releases URL for owner/repo. */
function githubReleaseUrlFromRemote(tag) {
  const url = remotePushUrl();
  if (!url) return null;
  let m = url.match(/github\.com[:/]([^/]+)\/([^/.]+)/i);
  if (!m) return null;
  const owner = m[1];
  const repo = m[2].replace(/\.git$/i, "");
  return `https://github.com/${owner}/${repo}/releases/tag/${encodeURIComponent(tag)}`;
}

/** Best-effort GitHub compare URL for owner/repo. */
function githubCompareUrlFromRemote(fromTag, toTag) {
  const url = remotePushUrl();
  if (!url) return null;
  let m = url.match(/github\.com[:/]([^/]+)\/([^/.]+)/i);
  if (!m) return null;
  const owner = m[1];
  const repo = m[2].replace(/\.git$/i, "");
  return `https://github.com/${owner}/${repo}/compare/${encodeURIComponent(
    fromTag
  )}...${encodeURIComponent(toTag)}`;
}

function openUrl(url) {
  const { platform } = process;
  if (platform === "win32") {
    spawnSync("cmd", ["/c", "start", "", url], { stdio: "ignore", detached: true });
  } else if (platform === "darwin") {
    spawnSync("open", [url], { stdio: "ignore", detached: true });
  } else {
    spawnSync("xdg-open", [url], { stdio: "ignore", detached: true });
  }
}

function promptLine(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Discover the last SemVer-style tag (vX.Y.Z). This keeps scope small and predictable.
function getLastTag() {
  const { status, stdout } = git(["describe", "--tags", "--abbrev=0"]);
  if (status !== 0 || !stdout) return null;
  return stdout.trim();
}

// Read git log since the given tag (or from the beginning if no tag).
function getConventionalCommits(fromTag) {
  const range = fromTag ? `${fromTag}..HEAD` : "HEAD";
  const format = ["%H", "%s", "%b", "==END=="].join("%n");
  const { status, stdout, stderr } = git(["log", "--reverse", `--pretty=format:${format}`, range]);
  if (status !== 0) {
    die(`Failed to read git log for range "${range}".\n${stderr || stdout}`);
  }
  if (!stdout.trim()) {
    return [];
  }

  const blocks = stdout.split("\n==END==").map((b) => b.trim()).filter(Boolean);
  const commits = [];
  for (const block of blocks) {
    const lines = block.split("\n");
    if (lines.length === 0) continue;
    const hash = lines[0];
    const subject = lines[1] || "";
    const body = lines.slice(2).join("\n");
    commits.push({ hash, subject, body });
  }
  return commits;
}

// Parse Conventional Commit style messages and classify them.
function analyzeCommits(commits) {
  const types = {
    feat: [],
    fix: [],
    perf: [],
    refactor: [],
    docs: [],
    chore: [],
    build: [],
    ci: [],
    revert: [],
    security: [],
    other: [],
  };
  const breakingChanges = [];

  const typeRe =
    /^(feat|fix|perf|refactor|docs|chore|build|ci|revert|security)(\([^)]*\))?(!)?: (.+)$/;

  for (const c of commits) {
    const header = c.subject || "";
    let m = header.match(typeRe);
    let type = "other";
    let isBreaking = false;
    let description = header;

    if (m) {
      type = m[1];
      isBreaking = !!m[3];
      description = m[4];
    }

    // Detect BREAKING CHANGE in footer/body.
    const body = c.body || "";
    const hasBreakingFooter = /^BREAKING CHANGE:/m.test(body);
    if (hasBreakingFooter) {
      isBreaking = true;
    }

    // Collect issue references from body.
    const issues = [];
    const issueRe = /\b(?:(Closes|Fixes|Refs?)\s+#(\d+))/gi;
    let im;
    while ((im = issueRe.exec(body))) {
      issues.push({ verb: im[1], number: im[2] });
    }

    const entry = {
      hash: c.hash,
      header,
      description,
      body,
      issues,
      breaking: isBreaking,
      type,
    };

    if (isBreaking) {
      breakingChanges.push(entry);
    }

    if (!types[type]) {
      types.other.push(entry);
    } else {
      types[type].push(entry);
    }
  }

  return { types, breakingChanges };
}

// Determine the next SemVer given base version and commit analysis.
function suggestVersion(explicitVersion, lastTag, analysis) {
  if (explicitVersion) {
    const clean = explicitVersion.replace(/^v/i, "");
    if (!SEMVER_RE.test(clean)) {
      die(
        `Invalid SemVer "${explicitVersion}". Expected format MAJOR.MINOR.PATCH with no leading zeroes.`
      );
    }
    return clean;
  }

  const base = lastTag ? lastTag.replace(/^v/i, "") : "0.0.0";
  if (!SEMVER_RE.test(base)) {
    die(`Existing tag "${lastTag}" is not a clean SemVer vX.Y.Z.`);
  }

  const [major, minor, patch] = base.split(".").map((n) => parseInt(n, 10));
  const hasBreaking = analysis.breakingChanges.length > 0;
  const hasFeat = analysis.types.feat && analysis.types.feat.length > 0;

  let next = [major, minor, patch];
  if (hasBreaking) {
    next = [major + 1, 0, 0];
  } else if (hasFeat) {
    next = [major, minor + 1, 0];
  } else {
    next = [major, minor, patch + 1];
  }

  return next.join(".");
}

// Simple word-wrap helper to keep lines <=72 chars where practical.
function wrapLine(text, width) {
  if (!text) return [""];
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";
  for (const w of words) {
    if (!current.length) {
      current = w;
    } else if ((current + " " + w).length <= width) {
      current += " " + w;
    } else {
      lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Build a Markdown changelog from analyzed commits.
function buildChangelog({ version, date, fromTag, analysis }) {
  const lines = [];

  lines.push(`## v${version} - ${date}`);
  lines.push("");

  const sections = [
    {
      title: "Breaking Changes",
      entries: analysis.breakingChanges,
    },
    {
      title: "Features",
      entries: analysis.types.feat || [],
    },
    {
      title: "Bug Fixes",
      entries: analysis.types.fix || [],
    },
    {
      title: "Other Changes",
      entries: []
        .concat(analysis.types.perf || [])
        .concat(analysis.types.refactor || [])
        .concat(analysis.types.docs || [])
        .concat(analysis.types.chore || [])
        .concat(analysis.types.build || [])
        .concat(analysis.types.ci || [])
        .concat(analysis.types.revert || [])
        .concat(analysis.types.security || [])
        .concat(analysis.types.other || []),
    },
  ];

  for (const section of sections) {
    if (!section.entries || section.entries.length === 0) continue;
    lines.push(`### ${section.title}`);
    lines.push("");
    for (const e of section.entries) {
      const short = e.hash.slice(0, 7);
      let suffix = ` (${short})`;
      if (e.issues && e.issues.length) {
        const parts = e.issues.map((i) => `${i.verb} #${i.number}`);
        suffix += ` (${parts.join(", ")})`;
      }
      const bulletText = `- ${e.description}${suffix}`;
      const wrapped = wrapLine(bulletText, 72);
      lines.push(...wrapped);
    }
    lines.push("");
  }

  if (fromTag) {
    const compare = githubCompareUrlFromRemote(fromTag, `v${version}`);
    if (compare) {
      lines.push(`[Full Changelog]: ${compare}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const cwd = repoRoot();
  process.chdir(cwd);
  log(`Repository: ${cwd}`);

  const lastTag = getLastTag();
  if (lastTag) {
    log(`Last tag: ${lastTag}`);
  } else {
    log("No existing tags found; analyzing full history.");
  }

  const commits = getConventionalCommits(lastTag);
  if (!commits.length) {
    die(
      "No commits since the last tag to include in this release.\n" +
        "Hint: Make changes and commit them before cutting a new release."
    );
  }

  const analysis = analyzeCommits(commits);
  const suggestedVersion = suggestVersion(args.version, lastTag, analysis);

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const changelog = buildChangelog({
    version: suggestedVersion,
    date: dateStr,
    fromTag: lastTag,
    analysis,
  });

  const tag = `v${suggestedVersion}`;
  const msg = args.message || `Release ${tag}`;

  const runTag = ["tag", "-a", tag, "-m", msg];
  const runPush = ["push", "origin", tag];

  log(`Proposed version: ${tag}${args.version ? " (from --version)" : ""}`);
  log("Changelog preview:");
  console.log(changelog);

  log("Planned commands:");
  log(`  git ${runTag.join(" ")}`);
  if (args.push) {
    log(`  git ${runPush.join(" ")}`);
  } else {
    log("  (no push due to --no-push)");
  }
  if (args.force) {
    warn("Tag overwrite enabled (--force). Existing tag will be replaced if present.");
  }

  if (args.dryRun) {
    log("Dry run: no git tag/push commands will be executed.");
    if (args.force && tagExists(tag)) {
      warn(`Dry run: tag "${tag}" already exists and would be overwritten with --force.`);
    }
    return;
  }

  let proceed = true;
  if (process.stdin.isTTY) {
    const answer = await promptLine('Create this release? [y/N] ');
    proceed = /^y(es)?$/i.test(answer);
  } else {
    log("Non-interactive STDIN detected; proceeding without confirmation.");
  }

  if (!proceed) {
    log("Release creation aborted by user.");
    return;
  }

  if (tagExists(tag)) {
    if (!args.force) {
      die(
        `Tag "${tag}" already exists locally.\n` +
          `Hint: Use --force to overwrite it, or choose a new version.`,
        2
      );
    }
    warn(`Tag "${tag}" already exists locally and will be overwritten due to --force.`);
    const del = git(["tag", "-d", tag]);
    if (del.status !== 0) {
      die(`Failed to delete existing tag "${tag}":\n${del.stderr || del.stdout}`);
    }
  }

  log(`Creating annotated tag ${tag}…`);
  const t = git(runTag);
  if (t.status !== 0) {
    die(
      `git tag failed.\n` +
        `Hint: Check that your version is valid SemVer and your repo is clean enough.\n` +
        (t.stderr || t.stdout)
    );
  }

  if (!args.push) {
    log(`Tag created locally. Push when ready: git push origin ${tag}`);
    return;
  }

  log("Pushing tag to origin…");
  const p = git(runPush);
  if (p.status !== 0) {
    warn(`git push failed. Remove local tag if needed: git tag -d ${tag}`);
    die(
      `Push rejected.\n` +
        `Hint: Verify your Git remote permissions and that origin exists.\n` +
        (p.stderr || p.stdout || "git push failed")
    );
  }
  log(`Pushed ${tag} to origin.`);

  if (args.openBrowser) {
    const rel = githubReleaseUrlFromRemote(tag);
    if (rel) {
      log(`Opening ${rel}`);
      openUrl(rel);
    } else {
      warn("Could not parse GitHub URL from origin; open Releases manually.");
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
