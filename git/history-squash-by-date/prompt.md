# history-squash-by-date
## Prompt for the Agent


**Task:** write a Node.js script to merge commits in a Git repository according to a strategy (`year`, `month`, `day`).


**Documentation references:**
* Review the specification in the `spec.md` file.
* Check the usage scenarios in the `use_cases.md` file.


**Script requirements:**
1. Accepts one command‑line argument — `strategy`.
2. Validates the argument (only `year`, `month`, `day` are allowed). If the argument is invalid, outputs an error message and exits.
3. Checks that the script is run in the root of a Git repository and that `git status` is clean.
4. Retrieves the commit history with dates using `git log --pretty=format:"%H %ai %s"`.
5. Groups commits by periods according to the strategy:
    * for `year` — by year;
    * for `month` — by year and month;
    * for `day` — by full date (year‑month‑day).
6. For each period:
    * counts the number of commits;
    * analyses commit messages to determine the topic (the most frequent keyword: `fix`, `feat`, `refactor`, `docs`, etc.);
    * generates a commit message following the template from `spec.md`: `<operation>: <count> commits for <period> (<optional: topic>)`;
    * performs an interactive rebase (`git rebase -i`), merging all commits of the period into one with the new message.
7. After all operations are completed, outputs a report (as specified in `spec.md`):
    * total number of commits before merging;
    * number of commits after merging;
    * list of processed periods.
8. Handles errors (e.g., conflicts during rebasing) and outputs informative messages.
9. Exits with code `0` on success, `1` on error.

**Technical details:**
* Use the `child_process` module to call Git commands.
* Use `Date` for date parsing.
* Log intermediate steps (e.g., “Processing period: 2023‑05”).
* Do not use external libraries except standard Node.js modules.

**Report output format:**
```
Commit merging completed.
Before: <number> commits
After: <number> commits
Processed periods:
- <period 1>
- <period 2>
...
```

**Code:** provide the full script code with comments on key parts.

*(Продолжение следует — в следующем сообщении будет use_cases.md)*

---

## 3. use_cases.md (Usage Scenarios)

### Scenario 1: strategy `year`

**Input parameters:**
* `strategy = "year"`

**Current repository state:**
* Commit history for 2 years:
    * 2022: 80 commits (topics: `fix` — 45, `feat` — 35);
    * 2023: 70 commits (topics: `refactor` — 50, `docs` — 20).
* Branch: `main` (not protected).
* Clean `git status`.

**Expected result:**
* All commits from 2022 are merged into one commit with the message: `squash: 80 commits for 2022 (bug fixes)`.
* All commits from 2023 are merged into one commit with the message: `squash: 70 commits for 2023 (refactoring)`.
* Total number of commits: 2.
* Script output:
```
Commit merging completed.
Before: 150 commits
After: 2 commits
Processed periods:
- 2022
- 2023
```

### Scenario 2: strategy `month`

**Input parameters:**
* `strategy = "month"`

**Current repository state:**
* Commit history for 3 months:
    * 2023-01: 25 commits (topics: `feat` — 15, `fix` — 10);
    * 2023-02: 30 commits (topics: `fix` — 25, `docs` — 5);
    * 2023-03: 20 commits (topics: `refactor` — 20).
* Branch: `dev` (not protected).
* Clean `git status`.

**Expected result:**
* Each month is merged into one commit:
    * `squash: 25 commits for 2023-01 (feature updates)`;
    * `squash: 30 commits for 2023-02 (bug fixes)`;
    * `squash: 20 commits for 2023-03 (refactoring)`.
* Total number of commits: 3.
* Script output:
```
Commit merging completed.
Before: 75 commits
After: 3 commits
Processed periods:
- 2023-01
- 2023-02
- 2023-03
```

### Scenario 3: strategy `day`

**Input parameters:**
* `strategy = "day"`

**Current repository state:**
* Commit history for the last 3 days:
    * 2023-10-01: 5 commits (topics: `fix` — 3, `feat` — 2);
    * 2023-10-02: 8 commits (topics: `docs` — 8);
    * 2023-10-03: 3 commits (topics: `refactor` — 3).
* Branch: `feature/new-ui` (not protected).
* Clean `git status`.

**Expected result:**
* Each day is merged into one commit:
    * `squash: 5 commits for 2023-10-01 (bug fixes)`;
    * `squash: 8 commits for 2023-10-02 (documentation)`;
    * `squash: 3 commits for 2023-10-03 (refactoring)`.
* Total number of commits: 3.
* Script output:
```
Commit merging completed.
Before: 16 commits
After: 3 commits
Processed periods:
- 2023-10-01
- 2023-10-02
- 2023-10-03
```

### Scenario 4: error — invalid parameter

**Input parameters:**
* `strategy = "week"`

**Current repository state:** any.

**Expected result:**
* The script outputs an error: `Error: Unknown strategy 'week'. Valid values: year, month, day.`
* Exits with exit code `1`.

### Scenario 5: error — uncommitted changes

**Input parameters:**
* `strategy = "month"`

**Current repository state:**
* There are uncommitted changes (`git status` is not clean).

**Expected result:**
* The script outputs an error: `Error: The repository has uncommitted changes. Exiting.`
* Exits with exit code `1`.

