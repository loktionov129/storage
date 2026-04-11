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
