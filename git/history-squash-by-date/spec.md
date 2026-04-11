# Specification: `squashHistory.js`

## Purpose

Automate rewriting Git history by calendar period (year / month / day), with optional topic hints derived from Conventional Commits–style prefixes in commit subjects. The goal is a shorter, readable history while keeping meaningful squash messages.

## Strategies (behavior differs by strategy)

### `year` — snapshot rewrite (default path for year)

* Builds **one new commit per distinct author-year** found in the same `git log --reverse` walk used elsewhere in the script (author date from `git log` `%ai`, local timezone).
* For each year **Y**, the new commit’s **tree** is taken from the **last** commit in that walk whose author-year is **Y** (the “snapshot” at the end of that year in walk order).
* History becomes **linear**: existing **merge commits are not preserved**; their reachable trees are folded into the walk as Git orders it.
* Implemented with **`git commit-tree`** chained by parent, then **`git update-ref`** on the current branch and **`git reset --hard`** to the new tip.
* Requires **HEAD** to be a **named branch** (not detached).

### `month` and `day` — interactive rebase

* Groups non-merge commits into runs by calendar month (`YYYY-MM`) or day (`YYYY-MM-DD`). **Merge commits** are never grouped with neighbors; each merge stays a single-commit “run”.
* Squash runs via **`git rebase -i --rebase-merges`** so merge structure is preserved where Git allows.
* Default merge options: **`-c merge.directoryRenames=false`** and **`-s recursive`** during rebase (directory rename detection can otherwise produce hard “file location” conflicts with squash + merges).
* If **`--strict-directory-renames`** is set, the script omits that `-c` override (Git defaults apply; conflicts may be more likely).
* If the interactive todo has **no contiguous block** of `pick` lines for a run (common with `--rebase-merges`), the script **skips** that segment by default. **`--allow-legacy-fallback`** restores the older non-contiguous `pick` → `squash` rewrite (unsafe: can replay onto the wrong parent and cause rename/delete conflicts).
* When a squash step would create an **empty** commit, the script may recover using **`git commit --amend --allow-empty --no-edit`** and **`git rebase --continue`** (message detection normalizes whitespace so line-broken Git errors still match).

## Functional requirements

* Group commits by the selected strategy (rules above).
* Infer a dominant **topic** from Conventional Commits types in subjects (`feat:`, `fix:`, …) when present.
* Emit squash messages: `squash: <count> commits for <period>` or with `(<topic>)` when a topic wins.
* Ask for **confirmation** before rewriting history.
* Print a **summary** (before/after commit count, periods processed).

## Input parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `--strategy` | string | Yes | `year`, `month`, or `day` |
| `--verbose` | flag | No | Log `git` invocations to stderr; more process output where applicable |
| `--strict-directory-renames` | flag | No | **Month/day only:** do not force `merge.directoryRenames=false` during rebase |
| `--allow-legacy-fallback` | flag | No | **Month/day only:** allow legacy non-contiguous sequence rewrite when picks are split by `--rebase-merges` |

## Output

* **Rewritten** history on the current branch (`year`: exact count = number of distinct author-years in the walk; `month`/`day`: depends on segments successfully squashed vs skipped).
* Console summary and progress lines.

## Technical requirements

* **Node.js** 12+.
* **Git** 2.x with working `rebase -i`, `rebase-merges`, and `commit-tree` (typical modern Git).

## Execution environment

* Run from the **root** of a Git work tree (or any directory inside it).
* Working tree and index must be **clean** (no uncommitted changes).

## Error handling

* Not in a Git repository → error, exit non-zero.
* Uncommitted changes → error, exit non-zero.
* Unknown `--strategy` → error, list valid values.
* No commits / nothing to do → informational message, exit zero where appropriate.
* **`year`** on **detached HEAD** → error (cannot update a branch ref safely).
* **Month/day** rebase failure → attempt `git rebase --abort` in the error path; message suggests abort if stuck.

## Data formats

### Commit walk (grouping input)

* Source: `git log --reverse` with NUL-separated records, fields `%H`, `%ai`, `%s`.
* Author calendar bucket uses the **local** author date prefix `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` depending on strategy.

### Squash message (output)

```
squash: <n> commits for <period>
squash: <n> commits for <period> (<topic>)
```

Examples: `squash: 73 commits for 2026 (new features)`; `squash: 5 commits for 2023-10`.

## Topic keywords

The script maps Conventional Commits types in commit subjects to short English topic phrases (e.g. `feat` → “new features”, `fix` → “bug fixes”). Extended types include `wip`, `security`, `i18n`, and others defined in code.

## Execution flow (high level)

1. Parse CLI arguments.
2. Verify repository and clean working tree.
3. Load commits via `git log` (oldest-first list).
4. **`year`:** compute last source hash per author-year → confirm → build `commit-tree` chain → update branch + hard reset → report.
5. **`month` / `day`:** build runs (merges isolated) → confirm → loop interactive squashes until no squishable run remains or user flow ends → report skipped segments if any.

## Security and safety

* Interactive confirmation before destructive steps.
* **`GIT_TERMINAL_PROMPT=0`** so Git does not hang on credential prompts in automation.
* Temporary helper scripts under the system temp directory; removed after each squash step (`month`/`day`) or not used for `year` snapshot path beyond any shared helpers.

## UX

* Progress lines such as `[k/n] Processing <period> (...)`.
* **`--verbose`:** stderr lines prefixed with `[git]` for subprocess arguments where implemented.

## Limitations

* Local use only; does not fetch or push.
* **`year`:** merge topology is lost; snapshot choice follows **author-year** in the script’s log walk, not “business calendar” or first-parent-only rules unless you change the script.
* **`month` / `day`:** merge commits are not squashed; some segments may be skipped without `--allow-legacy-fallback`.
* Commits whose author date cannot be parsed into `YYYY-MM-DD` are skipped in the walk.
