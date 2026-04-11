# Use Cases for `squashHistory.js`

## 1. Basic Usage — Squashing by Year

**Goal:** Simplify repository history by squashing all commits from each year into single commits.

**Command:**
```bash
node squashHistory.js --strategy year
```

**Process:**
1. Script checks if running in a Git repository and if it’s clean.
2. Retrieves all commit history.
3. Groups commits by year.
4. Prompts for confirmation.
5. For each year:
    * Determines dominant topic.
    * Creates squash message.
    * Performs squash.
6. Generates final report.

**Output example:**
```
Found 150 commits to process
Grouped into 3 periods
Periods to process:
- 2021
- 2022
- 2023

Proceed with squash? (y/n): y

Starting squash process...
[1/3] Processing 2021 (45 commits)
✓ Successfully squashed 45 commits for 2021
[2/3] Processing 2022 (60 commits)
✓ Successfully squashed 60 commits for 2022
[3/3] Processing 2023 (45 commits)
✓ Successfully squashed 45 commits for 2023

==================================================
Commit merging completed.
Before: 150 commits
After: 3 commits
Reduced by: 147 commits
Processed periods:
- 2021
- 2022
- 2023
==================================================
```

## 2. Monthly Squashing with Verbose Output

**Goal:** Squash commits by month with detailed output for debugging.

**Command:**
```bash
node squashHistory.js --strategy month --verbose
```

**Use case:** When you need to see all Git commands being executed and detailed progress.

## 3. Daily Squashing for Detailed History

**Goal:** Maintain more granular history by squashing commits on a daily basis.

**Command:**
```bash
node squashHistory.js --strategy day
```

**Best for:** Projects with frequent small commits that want to keep some granularity in history.

## 4. Dry‑Run Simulation (Manual)

**Goal:** Preview what would happen without actually modifying history.

**Method:**
1. Run without `--verbose` to see summary.
2. Review periods to be processed.
3. Decide whether to proceed.

**Alternative:** Add a `--dry-run` flag in future versions.

## 5. Error Handling Scenarios

### Scenario 1: Not in Git repository

**Command:**
```bash
cd /some/folder
node squashHistory.js --strategy year
```

**Expected output:**
```
Error: Not in a Git repository.
```

### Scenario 2: Uncommitted changes

**Command:**
```bash
# After making changes without committing
node squashHistory.js --strategy year
```

**Expected output:**
```
Error: The repository has uncommitted changes. Exiting.
```

### Scenario 3: Invalid strategy

**Command:**
```bash
node squashHistory.js --strategy week
```

**Expected output:**
```
Error: Unknown strategy 'week'. Valid values: year, month, day.
```

## 6. Integration into Development Workflow

**Typical workflow:**
1. Complete feature development.
2. Test all changes.
3. Run squash script before merging to main branch.
4. Push cleaned history.

**Benefits:**
* Clean, readable Git history.
* Easier code review.
* Reduced repository size.
* Clear chronological organization.

## 7. Maintenance Use Case

**Goal:** Periodic cleanup of old development branches.

**Process:**
1. Checkout old feature branch.
2. Run squash with desired strategy.
3. Merge cleaned branch to main.
4. Delete old branch.

**Example:**
```bash
git checkout old‑feature‑branch
node squashHistory.js --strategy month
git checkout main
git merge old‑feature‑branch
git branch -d old‑feature‑branch
```

