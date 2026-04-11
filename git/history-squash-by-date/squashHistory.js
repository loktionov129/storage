#!/usr/bin/env node

/**
 * Squashes Git history by calendar period (year / month / day) with optional
 * Conventional-Commits–style topic labels. See spec.md and use_cases.md.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');

const STRATEGIES = ['year', 'month', 'day'];

const TOPIC_KEYWORDS = {
  feat: 'new features',
  fix: 'bug fixes',
  docs: 'documentation updates',
  style: 'code style changes (formatting, missing semi-colons, etc.)',
  refactor: 'code refactoring',
  perf: 'performance improvements',
  test: 'adding or updating tests',
  build: 'build system or dependencies changes',
  ci: 'continuous integration configuration changes',
  chore: 'maintenance tasks',
  revert: 'reverted changes',
  wip: 'work in progress',
  security: 'security fixes',
  i18n: 'internationalization and localization',
  accessibility: 'accessibility improvements',
  deps: 'dependency updates',
  config: 'configuration changes',
  deploy: 'deployment configuration changes',
  ui: 'user interface changes',
  ux: 'user experience improvements',
  api: 'API changes',
  db: 'database schema changes',
  logging: 'logging improvements',
  monitoring: 'monitoring and observability changes'
};

const CC_TYPE_PATTERN = new RegExp(
  `^(${Object.keys(TOPIC_KEYWORDS).join('|')})(?:\\([^)]*\\))?!?:`,
  'i'
);

function parseArgs(argv) {
  const args = argv.slice(2);
  let strategy = null;
  let verbose = false;

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--strategy' && i + 1 < args.length) {
      strategy = args[i + 1];
      i += 1;
    } else if (args[i] === '--verbose') {
      verbose = true;
    }
  }

  return { strategy, verbose };
}

function logGit(verbose, args) {
  if (verbose) {
    console.error(`[git] ${['git', ...args].join(' ')}`);
  }
}

function runGit(args, options = {}) {
  const { verbose = false, env = {}, input = null, stdio } = options;
  logGit(verbose, args);

  const mergedEnv = { ...process.env, ...env };
  const result = spawnSync('git', args, {
    encoding: 'utf8',
    env: mergedEnv,
    input,
    stdio: stdio || (verbose ? 'inherit' : ['pipe', 'pipe', 'inherit']),
    maxBuffer: 50 * 1024 * 1024
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const err = new Error(
      (result.stderr && result.stderr.trim()) ||
        `git ${args[0]} failed with exit ${result.status}`
    );
    err.exitCode = result.status;
    err.stderr = result.stderr;
    throw err;
  }

  return {
    stdout: (result.stdout || '').trimEnd(),
    stderr: (result.stderr || '').trimEnd()
  };
}

function gitRevListCount(verbose) {
  const { stdout } = runGit(['rev-list', '--count', 'HEAD'], { verbose: false });
  const n = parseInt(stdout, 10);
  return Number.isFinite(n) ? n : 0;
}

function checkGitRepository(verbose) {
  try {
    runGit(['rev-parse', '--is-inside-work-tree'], { verbose });
  } catch {
    console.error('Error: Not in a Git repository.');
    process.exit(1);
  }
}

function checkCleanStatus(verbose) {
  const { stdout } = runGit(['status', '--porcelain'], { verbose });
  if (stdout.length > 0) {
    console.error('Error: The repository has uncommitted changes. Exiting.');
    process.exit(1);
  }
}

/**
 * Oldest-first commits: { hash, authorDate: string (%ai), subject }[]
 * Uses NUL-delimited records: <hash> <author date>\0<subject>\0
 */
function getCommitsOldestFirst(verbose) {
  const { stdout } = runGit(
    ['log', '--reverse', '-z', '--pretty=format:%H %ai%x00%s%x00'],
    { verbose: false, stdio: ['pipe', 'pipe', 'pipe'] }
  );

  const commits = [];
  let i = 0;
  const buf = stdout;

  while (i < buf.length) {
    while (i < buf.length && buf.charCodeAt(i) === 0) {
      i += 1;
    }
    if (i >= buf.length) break;

    const nul1 = buf.indexOf('\0', i);
    if (nul1 === -1) break;

    const head = buf.slice(i, nul1);
    const space = head.indexOf(' ');
    if (space === -1) break;

    const hash = head.slice(0, space);
    const authorDate = head.slice(space + 1);
    if (!periodKeyFromAuthorDate(authorDate, 'day')) {
      i = nul1 + 1;
      continue;
    }

    const nul2 = buf.indexOf('\0', nul1 + 1);
    if (nul2 === -1) break;

    const subject = buf.slice(nul1 + 1, nul2);
    commits.push({ hash, authorDate, subject });
    i = nul2 + 1;
    while (i < buf.length && buf.charCodeAt(i) === 0) {
      i += 1;
    }
  }

  return commits;
}

/** Calendar bucket from `git log` %ai (local author date), not UTC. */
function periodKeyFromAuthorDate(authorDate, strategy) {
  const m = authorDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const [, y, mo, d] = m;
  if (strategy === 'year') return y;
  if (strategy === 'month') return `${y}-${mo}`;
  return `${y}-${mo}-${d}`;
}

function getMergeCommitSet(verbose) {
  const { stdout } = runGit(['rev-list', '--min-parents=2', 'HEAD'], {
    verbose: false,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  return new Set(stdout.split('\n').filter(Boolean));
}

/**
 * Maximal consecutive runs with the same period (root → tip order).
 * Merge commits are never grouped with neighbors: each merge is its own run of length 1
 * (interactive rebase cannot squash merges; plain `pick` is invalid for them without
 * `--rebase-merges`, which we use when executing the rebase).
 */
function buildRuns(commits, strategy, mergeSet) {
  if (commits.length === 0) return [];

  const runs = [];
  let current = null;

  function flush() {
    if (current && current.commits.length > 0) {
      runs.push(current);
    }
    current = null;
  }

  for (const c of commits) {
    if (mergeSet.has(c.hash)) {
      flush();
      const p = periodKeyFromAuthorDate(c.authorDate, strategy);
      runs.push({ period: p, commits: [c] });
      continue;
    }

    const p = periodKeyFromAuthorDate(c.authorDate, strategy);
    if (current === null) {
      current = { period: p, commits: [c] };
    } else if (p === current.period) {
      current.commits.push(c);
    } else {
      flush();
      current = { period: p, commits: [c] };
    }
  }
  flush();
  return runs;
}

function determineTopic(commits) {
  const counts = Object.create(null);

  for (const c of commits) {
    const m = CC_TYPE_PATTERN.exec(c.subject.trim());
    if (!m) continue;
    const type = m[1].toLowerCase();
    if (!TOPIC_KEYWORDS[type]) continue;
    counts[type] = (counts[type] || 0) + 1;
  }

  let best = null;
  let bestN = 0;
  for (const [type, n] of Object.entries(counts)) {
    if (n > bestN) {
      bestN = n;
      best = type;
    }
  }

  return best ? TOPIC_KEYWORDS[best] : null;
}

function createSquashMessage(count, period, topic) {
  if (topic) {
    return `squash: ${count} commits for ${period} (${topic})`;
  }
  return `squash: ${count} commits for ${period}`;
}

function writeTempFile(dir, prefix, content, ext = '.tmp') {
  const name = `${prefix}-${process.pid}-${Math.random().toString(36).slice(2)}${ext}`;
  const full = path.join(dir, name);
  fs.writeFileSync(full, content, 'utf8');
  return full;
}

/** Paths for Git’s shell on Windows (Git Bash) tolerate forward slashes. */
function gitShellPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function editorCommand(scriptPath) {
  const node = gitShellPath(process.execPath);
  const scr = gitShellPath(scriptPath);
  return `"${node}" "${scr}"`;
}

function writeCopyEditorScript(tmpDir, sourcePath) {
  const body = `'use strict';
const fs = require('fs');
const src = ${JSON.stringify(sourcePath)};
const dst = process.argv[process.argv.length - 1];
fs.copyFileSync(src, dst);
`;
  return writeTempFile(tmpDir, 'editor', body, '.js');
}

function removeQuiet(p) {
  try {
    if (p && fs.existsSync(p)) fs.unlinkSync(p);
  } catch {
    /* ignore */
  }
}

/**
 * Rebase onto args for `git rebase -i --rebase-merges`: either `--root` or `<parent>`.
 */
function rebaseOntoArgs(firstHash, verbose) {
  let isRoot = false;
  try {
    runGit(['rev-parse', `${firstHash}^`], { verbose: false, stdio: ['pipe', 'pipe', 'pipe'] });
  } catch {
    isRoot = true;
  }

  if (isRoot) {
    return { ontoArgs: ['--root'] };
  }

  const { stdout: parent } = runGit(['rev-parse', `${firstHash}^`], {
    verbose: false,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  const { stdout: cnt } = runGit(['rev-list', '--count', `${parent}..HEAD`], {
    verbose: false,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  const n = parseInt(cnt, 10);
  if (!Number.isFinite(n) || n === 0) {
    throw new Error('No commits to rebase (empty revision range).');
  }
  return { ontoArgs: [parent] };
}

/**
 * Writes a GIT_SEQUENCE_EDITOR script that edits Git’s generated todo (with merges)
 * by turning selected `pick` lines into `squash`.
 * Each `pick` hash is resolved with `git rev-parse` so shared abbrev prefixes (e.g. root vs
 * child) never turn the wrong line into `squash` — which would hit “cannot fixup root commit”.
 */
function getRootHashesSet(verbose) {
  const { stdout } = runGit(['rev-list', '--max-parents=0', 'HEAD'], {
    verbose: false,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  return new Set(
    stdout
      .split('\n')
      .filter(Boolean)
      .map((h) => h.trim().toLowerCase())
  );
}

/**
 * Sequence editor: prefers a *contiguous* block of `pick` lines matching this run (same order as
 * `git log --reverse`). With `--rebase-merges`, those lines are often split by `label` / `merge` /
 * `reset`, so no contiguous match exists. Then we fall back to legacy per-hash `pick`→`squash`
 * (any matching line in the todo), which matches older script behavior; the main loop’s no-op
 * guard catches cases where Git does not actually drop commits.
 * When a contiguous block exists but the pick base is not first in file order, we reorder that
 * block so the chosen base is `pick` and the rest are `squash` in original file order.
 */
function writeSequenceTransformScript(tmpDir, orderedFullHashes, pickFullHash, rootHashesLc) {
  const ordered = orderedFullHashes.map((h) => h.toLowerCase());
  const pickIx = ordered.indexOf(pickFullHash.toLowerCase());
  if (pickIx < 0) {
    throw new Error('Pick hash is not in this run commit list.');
  }
  const roots = (rootHashesLc || []).map((h) => String(h).toLowerCase());
  const cfg = { ordered, pickIx, roots };
  const body = `'use strict';
const fs = require('fs');
const { spawnSync } = require('child_process');
const cfg = ${JSON.stringify(cfg)};
const dest = process.argv[process.argv.length - 1];
const ordered = cfg.ordered;
const pickIx = cfg.pickIx;
const rootSet = new Set(cfg.roots || []);

function resolveCommit(token) {
  const r = spawnSync('git', ['rev-parse', '--verify', token + '^{commit}'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  if (r.status !== 0) return null;
  return (r.stdout || '').trim().toLowerCase();
}

const text = fs.readFileSync(dest, 'utf8');
const lines = text.split(/\\r?\\n/);

const pickRe = /^(pick)\\s+([0-9a-f]+)\\b(.*)$/i;
const picks = [];
for (let i = 0; i < lines.length; i += 1) {
  const m = pickRe.exec(lines[i]);
  if (!m) continue;
  const full = resolveCommit(m[2]);
  if (full) picks.push({ i, abbrev: m[2], rest: m[3], full });
}

if (ordered.length <= 1) {
  fs.writeFileSync(dest, text);
  process.exit(0);
}

let start = -1;
for (let j = 0; j <= picks.length - ordered.length; j += 1) {
  let ok = true;
  for (let k = 0; k < ordered.length; k += 1) {
    if (picks[j + k].full !== ordered[k]) {
      ok = false;
      break;
    }
    if (k > 0) {
      const prev = picks[j + k - 1].i;
      const cur = picks[j + k].i;
      let betweenOk = true;
      for (let b = prev + 1; b < cur; b += 1) {
        const s = (lines[b] || '').trim();
        if (s === '' || s.startsWith('#')) continue;
        betweenOk = false;
        break;
      }
      if (!betweenOk) {
        ok = false;
        break;
      }
    }
  }
  if (ok) {
    start = j;
    break;
  }
}

if (start < 0) {
  console.error(
    '[squash-history sequence editor] No contiguous pick block (common with --rebase-merges). ' +
      'Falling back to legacy per-hash pick→squash (may fold into the wrong parent for some merges).'
  );
  const firstLc = ordered[pickIx];
  const squashSet = new Set(ordered.filter((_, i) => i !== pickIx));
  const out = lines.map((line) => {
    const m = pickRe.exec(line);
    if (!m) return line;
    const full = resolveCommit(m[2]);
    if (!full || full === firstLc || !squashSet.has(full)) return line;
    if (rootSet.has(full)) return line;
    return 'squash ' + m[2] + m[3];
  });
  fs.writeFileSync(dest, out.join('\\n'));
} else {
  const n = ordered.length;
  const p = pickIx;
  const squashIdx = [];
  for (let k = 0; k < n; k += 1) {
    if (k !== p) squashIdx.push(k);
  }

  const blockStart = picks[start].i;
  const blockEnd = picks[start + n - 1].i;
  const newBlock = ['pick ' + picks[start + p].abbrev + picks[start + p].rest];
  for (const k of squashIdx) {
    const e = picks[start + k];
    const cmd = rootSet.has(e.full) ? 'pick' : 'squash';
    newBlock.push(cmd + ' ' + e.abbrev + e.rest);
  }
  const merged = lines.slice(0, blockStart).concat(newBlock, lines.slice(blockEnd + 1));
  fs.writeFileSync(dest, merged.join('\\n'));
}
`;
  return writeTempFile(tmpDir, 'seq-transform', body, '.js');
}

function isAncestorOf(ancestor, descendant, verbose) {
  if (ancestor === descendant) return true;
  try {
    runGit(['merge-base', '--is-ancestor', ancestor, descendant], {
      verbose: false,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Chooses the `pick` commit and the rest as `squash` targets. Repo root(s) must never be
 * squashed. Sibling commits (neither is ancestor of the other) are resolved via rev-list order.
 */
function resolvePickAndSquashHashes(run, verbose) {
  const { commits } = run;
  if (commits.length <= 1) {
    return { firstHash: commits[0] ? commits[0].hash : null, squashTargets: [] };
  }

  const roots = getRootHashesSet(verbose);
  const rootsInRun = commits.filter((c) => roots.has(c.hash.toLowerCase()));
  if (rootsInRun.length > 0) {
    let pick = rootsInRun[0];
    if (rootsInRun.length > 1) {
      const { stdout: order } = runGit(['rev-list', '--reverse', 'HEAD'], {
        verbose: false,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      const rset = new Set(rootsInRun.map((r) => r.hash.toLowerCase()));
      for (const line of order.split('\n')) {
        const h = line.trim().toLowerCase();
        if (rset.has(h)) {
          pick = rootsInRun.find((r) => r.hash.toLowerCase() === h) || pick;
          break;
        }
      }
    }
    const firstHash = pick.hash;
    const squashTargets = commits
      .filter((d) => d.hash.toLowerCase() !== firstHash.toLowerCase())
      .map((d) => d.hash);
    if (verbose) {
      console.error(`[squash] pick base ${firstHash.slice(0, 7)} (repository root in this run)`);
    }
    return { firstHash, squashTargets };
  }

  for (const c of commits) {
    const isOldest = commits.every(
      (d) =>
        d.hash.toLowerCase() === c.hash.toLowerCase() || isAncestorOf(c.hash, d.hash, verbose)
    );
    if (isOldest) {
      const squashTargets = commits
        .filter((d) => d.hash.toLowerCase() !== c.hash.toLowerCase())
        .map((d) => d.hash);
      if (verbose && commits[0].hash.toLowerCase() !== c.hash.toLowerCase()) {
        console.error(
          `[squash] pick base ${c.hash.slice(0, 7)} (ancestor of all in run), not log-first ${commits[0].hash.slice(0, 7)}`
        );
      }
      return { firstHash: c.hash, squashTargets };
    }
  }

  const { stdout: order } = runGit(['rev-list', '--reverse', 'HEAD'], {
    verbose: false,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  const inRun = new Set(commits.map((c) => c.hash.toLowerCase()));
  let firstFromTopo = null;
  for (const line of order.split('\n')) {
    const h = line.trim().toLowerCase();
    if (inRun.has(h)) {
      firstFromTopo = commits.find((c) => c.hash.toLowerCase() === h);
      break;
    }
  }
  if (firstFromTopo) {
    const firstHash = firstFromTopo.hash;
    const squashTargets = commits
      .filter((d) => d.hash.toLowerCase() !== firstHash.toLowerCase())
      .map((d) => d.hash);
    if (verbose) {
      console.error(
        `[squash] pick base ${firstHash.slice(0, 7)} (first in rev-list among run; siblings / no single ancestor)`
      );
    }
    return { firstHash, squashTargets };
  }

  const firstHash = commits[0].hash;
  const squashTargets = commits.slice(1).map((c) => c.hash);
  if (verbose) {
    console.error('[squash] warning: fallback to log order for pick');
  }
  return { firstHash, squashTargets };
}

/**
 * @returns {boolean} true if an interactive rebase was started and finished; false if this run was skipped
 */
function squashOneRun(run, verbose, tmpDir) {
  const { commits } = run;
  if (commits.length <= 1) return false;

  const { firstHash, squashTargets } = resolvePickAndSquashHashes(run, verbose);
  if (!firstHash || squashTargets.length === 0) return false;

  const roots = getRootHashesSet(verbose);
  if (squashTargets.some((t) => roots.has(t.toLowerCase()))) {
    console.warn(
      `[squash] Skipping ${run.period}: Git cannot squash a second repository root (max-parents=0). ` +
        'This often happens when the same calendar period produced two parallel squash commits under --rebase-merges. ' +
        'Merge those commits into one line of history (or use a linear clone), then re-run this script.'
    );
    return false;
  }

  const orderedFullHashes = commits.map((c) => c.hash);
  const rootList = [...roots].map((h) => h.toLowerCase());

  const topic = determineTopic(commits);
  const message = createSquashMessage(commits.length, run.period, topic);

  const { ontoArgs } = rebaseOntoArgs(firstHash, verbose);

  const msgPath = writeTempFile(tmpDir, 'squash-msg', `${message}\n`);
  const seqScript = writeSequenceTransformScript(tmpDir, orderedFullHashes, firstHash, rootList);
  const msgScript = writeCopyEditorScript(tmpDir, msgPath);
  const sequenceEditorCmd = editorCommand(seqScript);
  const messageEditorCmd = editorCommand(msgScript);

  try {
    runGit(['rebase', '-i', '--rebase-merges', ...ontoArgs], {
      verbose,
      stdio: 'inherit',
      env: {
        GIT_SEQUENCE_EDITOR: sequenceEditorCmd,
        GIT_EDITOR: messageEditorCmd
      }
    });
  } finally {
    removeQuiet(msgPath);
    removeQuiet(seqScript);
    removeQuiet(msgScript);
  }
  return true;
}

function squishableRunKey(run) {
  return `${run.period}\0${run.commits.map((c) => c.hash).join('\0')}`;
}

async function confirmAction(message) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${message} (y/n): `, (answer) => {
      rl.close();
      const a = (answer || '').trim().toLowerCase();
      resolve(a === 'y' || a === 'yes');
    });
  });
}

function uniquePeriodLabels(runs) {
  const seen = new Set();
  const out = [];
  for (const r of runs) {
    if (!seen.has(r.period)) {
      seen.add(r.period);
      out.push(r.period);
    }
  }
  return out.sort();
}

async function squashHistory(strategy, verbose) {
  if (!STRATEGIES.includes(strategy)) {
    console.error(
      `Error: Unknown strategy '${strategy}'. Valid values: ${STRATEGIES.join(', ')}.`
    );
    process.exit(1);
  }

  checkGitRepository(verbose);
  checkCleanStatus(verbose);

  const totalBefore = gitRevListCount(verbose);
  if (totalBefore === 0) {
    console.log('No commits found in the repository.');
    process.exit(0);
  }

  let commits = getCommitsOldestFirst(verbose);
  if (commits.length === 0) {
    console.log('No commits found in the repository.');
    process.exit(0);
  }

  let mergeSet = getMergeCommitSet(verbose);
  let runs = buildRuns(commits, strategy, mergeSet);
  let periodLabels = uniquePeriodLabels(runs);
  const squishable = runs.filter((r) => r.commits.length > 1);

  if (squishable.length === 0) {
    console.log('No multi-commit periods to squash (each period has at most one commit).');
    process.exit(0);
  }

  if (mergeSet.size > 0) {
    console.log(
      `Note: ${mergeSet.size} merge commit(s) in history — rebases use --rebase-merges; merges are not squashed.`
    );
  }

  console.log(`\nFound ${commits.length} commits to process`);
  console.log(`Grouped into ${periodLabels.length} period label(s); ${squishable.length} segment(s) to squash`);
  console.log('Periods (calendar labels):');
  periodLabels.forEach((p) => console.log(`- ${p}`));

  const confirmed = await confirmAction('Proceed with squash?');
  if (!confirmed) {
    console.log('Operation cancelled by user.');
    process.exit(0);
  }

  console.log('\nStarting squash process...');

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'squash-history-'));
  const totalSquashSteps = squishable.length;
  let step = 0;
  const skippedRunKeys = new Set();
  let skippedSegmentCount = 0;

  try {
    while (true) {
      commits = getCommitsOldestFirst(verbose);
      mergeSet = getMergeCommitSet(verbose);
      runs = buildRuns(commits, strategy, mergeSet);
      const next = runs.find(
        (r) => r.commits.length > 1 && !skippedRunKeys.has(squishableRunKey(r))
      );
      if (!next) break;

      step += 1;
      console.log(`[${step}/${totalSquashSteps}] Processing ${next.period} (${next.commits.length} commits)`);

      const commitsBefore = gitRevListCount(verbose);
      let didRebase = false;
      try {
        didRebase = squashOneRun(next, verbose, tmpDir);
      } catch (e) {
        console.error(`Error during squash for period ${next.period}:`, e.message || e);
        try {
          runGit(['rebase', '--abort'], { verbose: false, stdio: ['pipe', 'pipe', 'pipe'] });
        } catch {
          /* ignore */
        }
        process.exit(1);
      }

      if (!didRebase) {
        skippedRunKeys.add(squishableRunKey(next));
        skippedSegmentCount += 1;
        console.log(`⊘ Left ${next.commits.length} commit(s) for ${next.period} unchanged (skipped).`);
        continue;
      }

      const commitsAfter = gitRevListCount(verbose);
      if (commitsAfter >= commitsBefore) {
        console.error(
          `Squash step did not reduce history (${commitsBefore} → ${commitsAfter} commits). ` +
            'Stopping to avoid an infinite loop. If you were mid-rebase, run: git rebase --abort'
        );
        process.exit(1);
      }

      console.log(`✓ Successfully squashed ${next.commits.length} commits for ${next.period}`);
    }

    const totalAfter = gitRevListCount(verbose);
    periodLabels = uniquePeriodLabels(
      buildRuns(getCommitsOldestFirst(verbose), strategy, getMergeCommitSet(verbose))
    );

    console.log('\n' + '='.repeat(50));
    console.log('Commit merging completed.');
    if (skippedSegmentCount > 0) {
      console.log(
        `Note: ${skippedSegmentCount} segment(s) were skipped (often two roots for one calendar period after a merge-preserving squash).`
      );
    }
    console.log(`Before: ${totalBefore} commits`);
    console.log(`After: ${totalAfter} commits`);
    console.log(`Reduced by: ${totalBefore - totalAfter} commits`);
    console.log('Processed periods:');
    periodLabels.forEach((p) => console.log(`- ${p}`));
    console.log('='.repeat(50));
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

function main() {
  const { strategy, verbose } = parseArgs(process.argv);

  if (!strategy) {
    console.error(
      'Error: Strategy parameter is required. Usage: node squashHistory.js --strategy <year|month|day> [--verbose]'
    );
    console.error(`Available strategies: ${STRATEGIES.join(', ')}`);
    process.exit(1);
  }

  squashHistory(strategy, verbose).catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
}

if (require.main === module) {
  main();
}
