#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * List of valid strategies for commit grouping
 * @type {string[]}
 */
const STRATEGIES = ['year', 'month', 'day'];

/**
 * Mapping of Conventional Commits keywords to human‑readable topics
 * @type {Object<string, string>}
 */
const TOPIC_KEYWORDS = {
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
};

/**
 * Parses command‑line arguments for the --strategy parameter
 * @returns {string|null} The strategy value or null if not found
 */
function parseArgs() {
  const args = process.argv.slice(2);
  let strategy = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--strategy' && i + 1 < args.length) {
      strategy = args[i + 1];
      break;
    }
  }

  return strategy;
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
  const dateMatch = commitLine.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!dateMatch) return null;
  return {
    year: dateMatch[1],
    month: dateMatch[2],
    day: dateMatch[3]
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
    Object.keys(TOPIC_KEYWORDS).forEach(keyword => {
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

  return dominantKeyword ? TOPIC_KEYWORDS[dominantKeyword] : null;
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
 */
function performSquash(commits, period, squashMessage) {
  if (commits.length <= 1) return; // Nothing to squash

  console.log(`Processing period: ${period} (${commits.length} commits)`);

  // Get the oldest commit hash (first in the group)
  const oldestCommit = commits[commits.length - 1].split(' ')[0];

  // Start interactive rebase from the commit before the oldest one
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

    // Set the editor to use our commands and perform interactive rebase
    execSync(`GIT_SEQUENCE_EDITOR="cat ${tempFile} >" git rebase -i ${oldestCommit}^`, {
      stdio: 'inherit'
    });

    // Amend the commit message with the squash message
    execSync(`git commit --amend -m "${squashMessage}"`, { stdio: 'inherit' });

    // Clean up: remove the temporary file
    fs.unlinkSync(tempFile);
  } catch (error) {
    console.error(`Error during squash for period ${period}:`, error.message);
    // Attempt to clean up the temporary file if it exists
    try {
      const tempFile = path.join(process.cwd(), '.git', 'rebase-commands');
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary file:', cleanupError.message);
    }
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
 */
function squashHistory(strategy) {
  // Validate strategy
  if (!STRATEGIES.includes(strategy)) {
    console.error(`Error: Unknown strategy '${strategy}'. Valid values: year, month, day.`);
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

  // Process each period
  processedPeriods.forEach(period => {
    const periodCommits = groupedCommits[period];
    const topic = determineTopic(periodCommits);
    const squashMessage = createSquashMessage(periodCommits.length, period, topic);
    performSquash(periodCommits, period, squashMessage);
  });

  // Generate report
  const totalAfter = processedPeriods.length;
  console.log('\nCommit merging completed.');
  console.log(`Before: ${totalBefore} commits`);
  console.log(`After: ${totalAfter} commits`);
  console.log('Processed periods:');
  processedPeriods.forEach(period => console.log(`- ${period}`));
}

// Execute the script if run directly
if (require.main === module) {
  const strategy = parseArgs();
  if (!strategy) {
    console.error('Error: Strategy parameter is required. Usage: node squashHistory.js --strategy <year|month|day>');
    process.exit(1);
  }
  squashHistory(strategy);
}

module.exports = squashHistory;
