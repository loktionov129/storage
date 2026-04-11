# history-squash-by-date

## Specification

### Files

1. `spec.md` — specification.
2. `prompt.md` — prompt for the agent.
3. `use_cases.md` — usage scenarios.

---

**Name:** `squashHistory`

**Purpose:** a Node.js script that merges commits in a Git repository according to a specified strategy and rewrites the history.

**Input parameter:**
* `strategy` — a string defining the commit merging strategy. Valid values:
    * `year` — merge all commits for each calendar year into one;
    * `month` — merge commits for each month into one;
    * `day` — merge commits for each day into one.

**Commit message format:**
```
<operation>: <count> commits for <period> (<optional: topic>)
```
Where:
* `<operation>` — `squash`;
* `<count>` — the number of commits merged in this period;
* `<period>` — the period in the following format:
    * for `year`: `YYYY` (e.g., `2023`);
    * for `month`: `YYYY-MM` (e.g., `2023-05`);
    * for `day`: `YYYY-MM-DD` (e.g., `2023-10-01`);
* `<optional: topic>` — the most frequent keyword in the commit messages of the period (e.g., `bug fixes`, `feature updates`, `refactoring`). If no topic can be determined, this field is omitted.

**Requirements:**
1. The script must be executed in the root of a Git repository.
2. Before performing operations, the script checks that:
    * the repository is initialized;
    * there are no uncommitted changes (`git status` is clean);
    * the current branch is not protected (to avoid conflicts with protection rules).
3. `git rebase -i` is used to merge commits.
4. After successful execution, the script outputs a report:
    * how many commits there were before merging;
    * how many commits remain after merging;
    * which periods (years/months/days) were processed.
5. On errors, the script outputs an informative message and exits with code `1`.
6. The script must not rewrite history in repositories with `git --bare` enabled.

**Dependencies:**
* Node.js (version 14+);
* Git (version 2.0+).

**Return value:**
* Exit code `0` on success.
* Exit code `1` on error.

*(Продолжение следует — в следующем сообщении будет prompt.md, затем use_cases.md)*

Хотите, я уточню какой‑то раздел спецификации или сразу продолжу с остальными файлами?
