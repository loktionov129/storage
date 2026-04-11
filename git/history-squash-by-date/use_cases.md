# Use cases: `squashHistory.js`

## 1. One commit per calendar year (typical “10 years → 10 commits”)

**Goal:** Collapse a long history so each author-year becomes exactly **one** commit with the **tree** that the last commit of that year had in the script’s log order.

**Command:**

```bash
node squashHistory.js --strategy year
```

**Process:**

1. Verifies Git repo and clean working tree.
2. Reads commits oldest-first (`git log --reverse`, author dates).
3. For each distinct author-year, picks the **last** commit in that walk for that year as the **tree** source.
4. Prints a **plan** (year → short hash, fold count) and asks for confirmation.
5. Builds a **linear** chain with `git commit-tree` (one commit per year), moves the **current branch** to the new tip, `git reset --hard`.
6. Prints a short report (`Before` / `After` commit counts).

**Notes:**

* Merge commits disappear from history (flattened).
* Requires a **named branch** (not detached `HEAD`).
* **`--allow-legacy-fallback`** and **`--strict-directory-renames`** only apply to month/day; if passed with `year`, the script may print a short notice and ignores them for the rewrite.

**Example output (shape):**

```text
Note: 7 merge commit(s) in the current history will be removed — year strategy produces one linear commit per author-year (tree snapshot).

Found 500 commits in log walk; 10 distinct author-year(s).
Planned commits (one tree snapshot per year, oldest → newest):
  2017  ← abc1234  (51 source commit(s) in that year)
  ...
  2026  ← def7890  (73 source commit(s) in that year)

Replace the current branch with 10 commit(s) (one per year above)? (y/n): y

==================================================
Year snapshot rewrite completed (one commit per author-year).
Before: 500 commits
After: 10 commits
Branch: refs/heads/main
Years:
- 2017
...
- 2026
==================================================
```

## 2. Squash by month (interactive rebase, merges preserved)

**Goal:** One squash commit per calendar month for **non-merge** runs, while keeping merge commits in the rebase topology.

**Command:**

```bash
node squashHistory.js --strategy month
```

**Optional:**

```bash
node squashHistory.js --strategy month --verbose
```

Use **`--verbose`** to print each `git` invocation (stderr) and more live output.

**When segments are skipped:** If `--rebase-merges` splits the todo so there is no contiguous `pick` block for a month, that segment is skipped unless you pass **`--allow-legacy-fallback`** (risky).

## 3. Squash by day

**Goal:** Finer buckets: one squash per calendar day (same mechanics as month, different grouping key).

**Command:**

```bash
node squashHistory.js --strategy day
```

**Best for:** Very chatty histories where you still want day-level granularity.

## 4. Directory renames during month/day rebase

**Goal:** Avoid some `CONFLICT (file location)` cases when merges and directory renames interact.

**Default:** The script passes **`-c merge.directoryRenames=false`** with **`-s recursive`** for month/day rebases.

**Override:** If you need Git’s default directory-rename detection:

```bash
node squashHistory.js --strategy month --strict-directory-renames
```

## 5. Preview before you say yes

**Goal:** See how many periods and commits will be touched without reading the whole log first.

**Method:**

1. Run the script and read the printed summary (periods, counts).
2. Answer **`n`** at the confirmation prompt to cancel with no changes.

There is no built-in `--dry-run` flag; canceling at the prompt is the safe preview.

## 6. Error scenarios

**Not a repository**

```bash
cd /tmp && node /path/to/squashHistory.js --strategy year
# → Error: Not in a Git repository.
```

**Dirty tree**

```bash
# with uncommitted changes
node squashHistory.js --strategy year
# → Error: The repository has uncommitted changes. Exiting.
```

**Invalid strategy**

```bash
node squashHistory.js --strategy week
# → Error: Unknown strategy 'week'. Valid values: year, month, day.
```

**Year strategy on detached HEAD**

```bash
git checkout --detach HEAD
node squashHistory.js --strategy year
# → Error: Detached HEAD — checkout a named branch before rewriting year history.
```

## 7. Workflow: clean history before publishing

1. Finish work on a branch; run tests.
2. **`git checkout your-branch`** (named branch required for `year`).
3. Run **`node squashHistory.js --strategy year`** (or `month` / `day`).
4. Inspect **`git log`**, then force-push only if you intend to rewrite remote history (**coordinate with collaborators**).

## 8. Recovering from a bad month/day rebase

If an interactive step fails mid-way:

```bash
git rebase --abort
```

Then fix conflicts or choose different flags (`--strict-directory-renames`, or avoid `--allow-legacy-fallback` unless you accept risk) before retrying.
