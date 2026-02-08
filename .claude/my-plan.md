Overview
Functional requirements:

- implement XP goal at the user character level
- e.g. daily goal, weekly goal, monthly goal, yearly goal
- user can set all of the above at anytime
- display the progress of each on top of tasks

Implementation plan:

- Schema.ts, new table: user settings, fields: dailyXpTarget, then 3 more for weekly, monthly, quarterly, yearly
- BE:
  - user_character controller
    - get/patch: all fields
    - get goals progress
- FE:
  - goals edit component: create a common component modal, it allows editing fields and save
  - goals display component, this will be more complex, it will display not just the goal, but the current progress bar for each

Testing:

- manually set today?
- insert entries with completed date
  - daily: insert one entry today
  - weekly: insert one entry beginning of this week
  - monthly: insert one entry beginning of this month
  - quarterly: insert one entry beginning of this quarter
  - yearly: insert one entry beginning of this year
  - insert an entry before beginning of this year
