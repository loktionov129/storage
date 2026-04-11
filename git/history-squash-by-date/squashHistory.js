#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const config = {
  strategies: ['year', 'month', 'day'],
  topicKeywords: {
    // Core types from Conventional Commits specification
    feat: 'new features',
    fix: 'bug fixes',
    docs: 'documentation updates',
    style: 'code style changes (formatting, missing semi‑colons, etc.)',
    refactor: 'code refactoring',
    perf: 'performance improvements',
    test: 'adding or updating tests',
    build: 'build system or dependencies changes',
    ci: 'continuous integration configuration changes',
    chore: 'maintenance tasks',
    revert: 'reverted changes',

    // Extended types (common community additions)
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
  }
};

/**
 * Escapes double quotes in a commit message to prevent shell interpretation issues
 * when used in command-line operations.
 *
 * @param {string} message - The original commit message that may contain double quotes
 * @returns {string} The escaped commit message with double quotes replaced by \"
 *
 * @example
 * escapeCommitMessage('Fix "broken" feature') // returns 'Fix \"broken\" feature'
 */
function escapeCommitMessage(message) {
  return message.replace(/"/g, '\\"');
}

/**
 * Safely removes a temporary file if it exists.
 * Catches and logs any errors that occur during the deletion process
 * without throwing exceptions.
 *
 * @param {string} tempFile - The full path to the temporary file to be removed
 * @returns {void}
 * @example
 * cleanup('/tmp/rebase-commands-123');
 */
function cleanup(tempFile) {
  try {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  } catch (e) {
    console.warn('Cleanup failed:', e.message);
  }
}

/**
 * Prompts the user for confirmation via the command line.
 * Asks a yes/no question and resolves with a boolean based on user input.
 *
 * @param {string} message - The question or prompt to display to the user
 * @returns {Promise<boolean>} A promise that resolves to true if the user answers 'y' or 'yes',
 *          and false for any other response (including 'n' or empty input)
 * @example
 * const confirmed = await confirmAction('Proceed with squash?');
 * if (confirmed) {
 *   // perform squash operation
 * }
 */
function confirmAction(message) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${message} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Parses command‑line arguments for the --strategy and --verbose parameters
 * @returns {Object} Object with strategy and verbose flag
 */
function parseArgs() {
  const args = process.argv.slice(2);
  let strategy = null;
  let verbose = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--strategy' && i + 1 < args.length) {
      strategy = args[i + 1];
    } else if (args[i] === '--verbose') {
      verbose = true;
    }
  }

  return { strategy, verbose };
}

/**
 * Checks if the script is running in a Git repository
 * @throws {Error} If not in a Git repository
 */
function checkGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  } catch (error) {
    console.error('Error: Not in a Git repository.');
    process.exit(1);
  }
}

/**
 * Checks if there are uncommitted changes in the repository
 * @throws {Error} If uncommitted changes are detected
 */
function checkCleanStatus() {
  const status = execSync('git status --porcelain').toString().trim();
  if (status.length > 0) {
    console.error('Error: The repository has uncommitted changes. Exiting.');
    process.exit(1);
  }
}

/**
 * Retrieves commit history with dates and messages
 * @returns {string[]} Array of commit lines with hash, date, and message
 */
function getCommitHistory() {
  const logOutput = execSync(
    'git log --pretty=format:"%H %ai %s"',
    { encoding: 'utf8' }
  );
  return logOutput.split('\n').filter(line => line.trim().length > 0);
}

/**
 * Extracts date information from a commit line
 * @param {string} commitLine - A line from git log output
 * @returns {Object|null} Object with year, month, day or null if parsing failed
 */
function extractDate(commitLine) {
  const parts = commitLine.split(' ');
  if (parts.length < 3) return null;
  const dateStr = parts[1]; // вторая колонка — дата
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return {
    year: match[1],
    month: match[2],
    day: match[3]
  };
}

/**
 * Groups commits by period according to the specified strategy
 * @param {string[]} commits - Array of commit lines
 * @param {string} strategy - Grouping strategy ('year', 'month', or 'day')
 * @returns {Object} Object with periods as keys and arrays of commits as values
 */
function groupCommitsByPeriod(commits, strategy) {
  const groups = {};

  commits.forEach(commit => {
    const dateInfo = extractDate(commit);
    if (!dateInfo) return;

    let periodKey;
    switch (strategy) {
      case 'year':
        periodKey = dateInfo.year;
        break;
      case 'month':
        periodKey = `${dateInfo.year}-${dateInfo.month}`;
        break;
      case 'day':
        periodKey = `${dateInfo.year}-${dateInfo.month}-${dateInfo.day}`;
        break;
    }

    if (!groups[periodKey]) groups[periodKey] = [];
    groups[periodKey].push(commit);
  });

  // Сортировка коммитов по дате внутри каждой группы (от старых к новым)
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => {
      const dateA = extractDate(a);
      const dateB = extractDate(b);
      return new Date(`${dateA.year}-${dateA.month}-${dateA.day}`) - new Date(`${dateB.year}-${dateB.month}-${dateB.day}`);
    });
  });

  return groups;
}

/**
 * Analyses commit messages to determine the most frequent topic
 * @param {string[]} commits - Array of commit lines
 * @returns {string|null} Human‑readable topic or null if no dominant topic found
 */
function determineTopic(commits) {
  const topicCounts = {};

  commits.forEach(commit => {
    const message = commit.toLowerCase();
    Object.keys(config.topicKeywords).forEach(keyword => {
      if (message.includes(keyword)) {
        topicCounts[keyword] = (topicCounts[keyword] || 0) + 1;
      }
    });
  });

  // Find the most frequent keyword
  let maxCount = 0;
  let dominantKeyword = null;

  Object.entries(topicCounts).forEach(([keyword, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantKeyword = keyword;
    }
  });

  return dominantKeyword ? config.topicKeywords[dominantKeyword] : null;
}

/**
 * Creates a squash commit message following the specified format
 * @param {number} count - Number of commits being squashed
 * @param {string} period - Period identifier (e.g., '2023', '2023-05', '2023-10-01')
 * @param {string|null} topic - Optional human‑readable topic
 * @returns {string} Formatted squash commit message
 */
function createSquashMessage(count, period, topic) {
  if (topic) {
    return `squash: ${count} commits for ${period} (${topic})`;
  }
  return `squash: ${count} commits for ${period}`;
}

/**
 * Performs interactive rebase to squash commits in a given period
 * @param {string[]} commits - Array of commit lines for the period
 * @param {string} period - Period identifier
 * @param {string} squashMessage - Message for the squashed commit
 * @param {boolean} verbose - Verbose output flag
 */
function performSquash(commits, period, squashMessage, verbose) {
  if (commits.length <= 1) {
    if (verbose) console.log(`Skipping ${period}: only ${commits.length} commit(s)`);
    return; // Nothing to squash
  }

  console.log(`Processing period: ${period} (${commits.length} commits)`);

  // Get the oldest commit hash (first in the sorted group)
  const oldestCommit = commits[0].split(' ')[0];

  try {
    // Create a temporary file with rebase commands
    const rebaseCommands = commits
      .map((commit, index) => {
        const hash = commit.split(' ')[0];
        return index === 0 ? `pick ${hash}` : `squash ${hash}`;
      })
      .join('\n');

    const tempFile = path.join(process.cwd(), '.git', 'rebase-commands');
    fs.writeFileSync(tempFile, rebaseCommands);

    // Cross‑platform way: use env option to set GIT_SEQUENCE_EDITOR
    execSync('git rebase -i ' + oldestCommit + '^', {
      stdio: verbose ? 'inherit' : ['pipe', 'pipe', 'inherit'],
      env: {
        ...process.env,
        GIT_SEQUENCE_EDITOR: 'true'
      }
    });

    // Amend the commit message with the squash message
    const safeMessage = escapeCommitMessage(squashMessage);
    execSync(`git commit --amend -m "${safeMessage}"`, {
      stdio: verbose ? 'inherit' : ['pipe', 'pipe', 'inherit']
    });

    // Clean up: remove the temporary file
    cleanup(tempFile);

    console.log(`✓ Successfully squashed ${commits.length} commits for ${period}`);
  } catch (error) {
    console.error(`Error during squash for period ${period}:`, error.message);
    // Attempt to clean up the temporary file if it exists
    const tempFile = path.join(process.cwd(), '.git', 'rebase-commands');
    cleanup(tempFile);
    // Abort the rebase if it's in progress
    try {
      execSync('git rebase --abort', { stdio: 'ignore' });
    } catch (abortError) {
      // Ignore if abort fails (e.g., no rebase in progress)
    }
    process.exit(1);
  }
}

/**
 * Main function to orchestrate the squash process
 * @param {string} strategy - Grouping strategy ('year', 'month', or 'day')
 * @param {boolean} verbose - Verbose output flag
 */
async function squashHistory(strategy, verbose) {
  // Validate strategy
  if (!config.strategies.includes(strategy)) {
    console.error(`Error: Unknown strategy '${strategy}'. Valid values: ${config.strategies.join(', ')}.`);
    process.exit(1);
  }

  // Pre-checks
  checkGitRepository();
  checkCleanStatus();

  // Get commit history
  const commits = getCommitHistory();
  const totalBefore = commits.length;

  if (totalBefore === 0) {
    console.log('No commits found in the repository.');
    process.exit(0);
  }

  // Group commits by period
  const groupedCommits = groupCommitsByPeriod(commits, strategy);
  const processedPeriods = Object.keys(groupedCommits).sort();

  if (processedPeriods.length === 0) {
    console.log('No periods found for grouping with strategy: ' + strategy);
    process.exit(0);
  }

  // Show summary before proceeding
  console.log(`\nFound ${totalBefore} commits to process`);
  console.log(`Grouped into ${processedPeriods.length} periods`);
  console.log('Periods to process:');
  processedPeriods.forEach(period => console.log(`- ${period}`));

  // Confirm action
  const confirmed = await confirmAction('Proceed with squash?');
  if (!confirmed) {
    console.log('Operation cancelled by user.');
    process.exit(0);
  }

  console.log('\nStarting squash process...');

  // Process each period with progress indication
  for (let i = 0; i < processedPeriods.length; i++) {
    const period = processedPeriods[i];
    const periodCommits = groupedCommits[period];
    const topic = determineTopic(periodCommits);
    const squashMessage = createSquashMessage(periodCommits.length, period, topic);

    console.log(`[${i + 1}/${processedPeriods.length}] `);
    performSquash(periodCommits, period, squashMessage, verbose);
  }

  // Generate final report
  const totalAfter = processedPeriods.length;
  console.log('\n' + '='.repeat(50));
  console.log('Commit merging completed.');
  console.log(`Before: ${totalBefore} commits`);
  console.log(`After: ${totalAfter} commits`);
  console.log(`Reduced by: ${totalBefore - totalAfter} commits`);
  console.log('Processed periods:');
  processedPeriods.forEach(period => console.log(`- ${period}`));
  console.log('='.repeat(50));
}

// Execute the script if run directly
if (require.main === module) {
  const { strategy, verbose } = parseArgs();

  if (!strategy) {
    console.error('Error: Strategy parameter is required. Usage: node squashHistory.js --strategy <year|month|day> [--verbose]');
    console.error('Available strategies: ' + config.strategies.join(', '));
    process.exit(1);
  }

  // Run the main function
  squashHistory(strategy, verbose).catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}
