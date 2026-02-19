1. Day-long goal: goalCompletedAmount reflects only the referenced day
   Create a task with goalPeriod: 'day-long', goalAmount: 10
   Insert completions: amount 5 on Jan 15, amount 3 on Jan 16, amount 7 on Jan 17
   referenceTime=Jan 15 → goalCompletedAmount = 5
   referenceTime=Jan 16 → goalCompletedAmount = 3
   referenceTime=Jan 17 → goalCompletedAmount = 7
   referenceTime=Jan 18 (no completions) → goalCompletedAmount = 0
2. Week-long goal: goalCompletedAmount sums the entire referenced week
   Create a task with goalPeriod: 'week-long', goalAmount: 20
   Insert completions across two weeks (e.g., amount 5 on Mon Jan 12, amount 8 on Wed Jan 14, amount 6 on Mon Jan 19)
   referenceTime within week of Jan 12 → goalCompletedAmount = 13 (5+8)
   referenceTime within week of Jan 19 → goalCompletedAmount = 6
3. Streaks are calculated relative to referenceTime
   This is already covered by existing streak tests, so no new tests needed here.

4. Task without a goal period returns null goalCompletedAmount regardless of referenceTime
   Create a task with no goalPeriod/goalAmount
   referenceTime on any day → goalCompletedAmount = null
   That gives us 3 new test cases (the 4th is partially covered already). The first two are the highest-value since they directly test the day navigation behavior. Want me to implement these?
