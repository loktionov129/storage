# Specification for `squashHistory.js` Script

## Purpose

The script automates the squashing (merging) of Git commits by periods (year/month/day) with topic analysis based on Conventional Commits. It is designed to simplify Git repository history.

## Functional Requirements

### Main Functions

* Grouping commits by periods: year, month, or day.
* Analyzing commit topics based on Conventional Commits keywords.
* Creating meaningful squash commit messages.
* Performing interactive rebase for squashing.
* Generating a report on the operation.

### Input Parameters

| Parameter | Type | Required | Description |
|---------|---------|-------------|-------------|
| `--strategy` | `string` | Yes | Grouping strategy: `year`, `month`, or `day` |
| `--verbose` | flag | No | Detailed output of all Git operations |

### Output Data

* Modified Git repository history (squashed commits).
* Console report on the completed operation.

## Technical Requirements

### Dependencies

* Node.js (version 12+).
* Git (version 2.0+).

### Execution Environment

* Must be run in the root of a Git repository.
* Repository must be clean (no uncommitted changes).

### Error Handling

The script must handle the following scenarios:

* Running outside a Git repository → error and exit.
* Uncommitted changes present → error and exit.
* Invalid grouping strategy → error and exit.
* No commits to process → informational message.
* Errors during rebase → abort operation, clean up temporary files, informative message.

## Data Format

### Input (Git log)

Git log output format:
```
<hash> <date> <message>
```

Example:
```
a1b2c3d4 2023-10-01 14:30:00 +0300 feat: add new feature
```

### Output (Squash Message)

Squash commit message format:
```
squash: <count> commits for <period> (<topic>)
```
or without topic:
```
squash: <count> commits for <period>
```

Examples:
* `squash: 5 commits for 2023 (new features)`;
* `squash: 3 commits for 2023-10`.

## Configuration

### Supported Strategies

* `year` — grouping by years (e.g., `2023`);
* `month` — grouping by months (e.g., `2023-10`);
* `day` — grouping by days (e.g., `2023-10-01`).

### Topic Keywords

The script uses the `config.topicKeywords` dictionary to map keywords in commit messages to human‑readable topics. Supported:

* Standard Conventional Commits types (`feat`, `fix`, `docs`, etc.).
* Extended community types (`wip`, `security`, `i18n`, etc.).

## Execution Flow

1. Parse command‑line arguments.
2. Check environment (Git repository, clean state).
3. Retrieve commit history via `git log`.
4. Group commits by selected strategy.
5. Sort commits within groups by date (oldest to newest).
6. Prompt user for confirmation before starting squash.
7. For each period:
    * Determine dominant topic (if any).
    * Create squash message.
    * Perform squash via interactive rebase.
    * Log progress.
8. Generate final report.

## Security

* Confirmation before potentially dangerous operations (rebase).
* Escaping commit messages before using in Git commands.
* Cleaning up temporary files after completion or error.
* Using `GIT_SEQUENCE_EDITOR="true"` for cross‑platform compatibility.

## UX Features

* Progress indicator: `[1/5] Processing 2023...`.
* Detailed output when using the `--verbose` flag.
* Informative error messages.
* Final report with commit savings.

## Limitations

* Works only in local repositories.
* Requires a clean repository state.
* Does not support squashing merge commits.
* Does not handle commits without dates.

