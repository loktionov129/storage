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

/**
 * Maximal consecutive runs with the same period (root → tip order).
 */
function buildRuns(commits, strategy) {
  if (commits.length === 0) return [];

  const runs = [];
  let current = {
    period: periodKeyFromAuthorDate(commits[0].authorDate, strategy),
    commits: [commits[0]]
  };

  for (let k = 1; k < commits.length; k += 1) {
    const p = periodKeyFromAuthorDate(commits[k].authorDate, strategy);
    if (p === current.period) {
      current.commits.push(commits[k]);
    } else {
      runs.push(current);
      current = { period: p, commits: [commits[k]] };
    }
  }
  runs.push(current);
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
 * Returns { ontoArg, hashes } where ontoArg is either ['--root'] or rev of parent of first hash.
 */
function rebaseOntoAndRange(firstHash, verbose) {
  let isRoot = false;
  try {
    runGit(['rev-parse', `${firstHash}^`], { verbose: false, stdio: ['pipe', 'pipe', 'pipe'] });
  } catch {
    isRoot = true;
  }

  if (isRoot) {
    const { stdout } = runGit(['rev-list', '--reverse', 'HEAD'], {
      verbose: false,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const hashes = stdout.split('\n').filter(Boolean);
    return { ontoArgs: ['--root'], hashes };
  }

  const { stdout: parent } = runGit(['rev-parse', `${firstHash}^`], {
    verbose: false,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  const { stdout: rangeOut } = runGit(['rev-list', '--reverse', `${parent}..HEAD`], {
    verbose: false,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  const hashes = rangeOut.split('\n').filter(Boolean);
  return { ontoArgs: [parent], hashes };
}

function buildTodoLines(hashes, runSet, firstInRun) {
  return hashes.map((h) => {
    if (runSet.has(h)) {
      return h === firstInRun ? `pick ${h}` : `squash ${h}`;
    }
    return `pick ${h}`;
  });
}

function squashOneRun(run, verbose, tmpDir) {
  const { commits } = run;
  if (commits.length <= 1) return;

  const firstHash = commits[0].hash;
  const runSet = new Set(commits.map((c) => c.hash));
  const topic = determineTopic(commits);
  const message = createSquashMessage(commits.length, run.period, topic);

  const { ontoArgs, hashes } = rebaseOntoAndRange(firstHash, verbose);
  if (hashes.length === 0) {
    throw new Error('No commits in rebase range.');
  }

  const todoLines = buildTodoLines(hashes, runSet, firstHash);
  const todoBody = `${todoLines.join('\n')}\n`;
  const todoPath = writeTempFile(tmpDir, 'git-rebase-todo', todoBody);
  const msgPath = writeTempFile(tmpDir, 'squash-msg', `${message}\n`);

  const seqScript = writeCopyEditorScript(tmpDir, todoPath);
  const msgScript = writeCopyEditorScript(tmpDir, msgPath);
  const sequenceEditorCmd = editorCommand(seqScript);
  const messageEditorCmd = editorCommand(msgScript);

  try {
    runGit(['rebase', '-i', ...ontoArgs], {
      verbose,
      stdio: 'inherit',
      env: {
        GIT_SEQUENCE_EDITOR: sequenceEditorCmd,
        GIT_EDITOR: messageEditorCmd
      }
    });
  } finally {
    removeQuiet(todoPath);
    removeQuiet(msgPath);
    removeQuiet(seqScript);
    removeQuiet(msgScript);
  }
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

  let runs = buildRuns(commits, strategy);
  let periodLabels = uniquePeriodLabels(runs);
  const squishable = runs.filter((r) => r.commits.length > 1);

  if (squishable.length === 0) {
    console.log('No multi-commit periods to squash (each period has at most one commit).');
    process.exit(0);
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

  try {
    while (true) {
      commits = getCommitsOldestFirst(verbose);
      runs = buildRuns(commits, strategy);
      const next = runs.find((r) => r.commits.length > 1);
      if (!next) break;

      step += 1;
      console.log(`[${step}/${totalSquashSteps}] Processing ${next.period} (${next.commits.length} commits)`);

      try {
        squashOneRun(next, verbose, tmpDir);
      } catch (e) {
        console.error(`Error during squash for period ${next.period}:`, e.message || e);
        try {
          runGit(['rebase', '--abort'], { verbose: false, stdio: ['pipe', 'pipe', 'pipe'] });
        } catch {
          /* ignore */
        }
        process.exit(1);
      }

      console.log(`✓ Successfully squashed ${next.commits.length} commits for ${next.period}`);
    }

    const totalAfter = gitRevListCount(verbose);
    periodLabels = uniquePeriodLabels(buildRuns(getCommitsOldestFirst(verbose), strategy));

    console.log('\n' + '='.repeat(50));
    console.log('Commit merging completed.');
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
