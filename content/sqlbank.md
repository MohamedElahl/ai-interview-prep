=== sql-core ===
# Think before you type

Every SQL question has a **grain**: what one output row stands for (one customer, one customer per month, one order). Decide it first, then pick the filters, joins and aggregates that produce exactly that grain.

# Cheat sheet

| Pattern | Shape | Mistake it avoids |
| --- | --- | --- |
| Missing values | `COALESCE(discount, 0)`, `IS NULL` | `amount - NULL` is NULL; `= NULL` is never true |
| Banding | `CASE WHEN ... THEN ... ELSE ... END` | Forgetting NULL and boundary values |
| Filter rows, then groups | `WHERE` before `GROUP BY`, `HAVING` after | Using `COUNT(*)` on rows you meant to exclude |
| Keep every left row | `LEFT JOIN` with the condition in `ON`, `COUNT(o.id)` | Inner join drops empty groups; `COUNT(*)` gives 1 |
| Anti-join | `NOT EXISTS (...)` or `LEFT JOIN ... WHERE r.id IS NULL` | `NOT IN` returns nothing if the list holds a NULL |
| Self join | `employees e JOIN employees m ON m.id = e.manager_id` | Top-level people with a NULL manager |
| Deduplicate | `ROW_NUMBER() OVER (PARTITION BY key ORDER BY rule, id)` then `rn = 1` | Joining back on `MIN(date)` returns both rows on a tie |
| Per-group average | correlated subquery or join | Comparing with the overall average |
| Months | `strftime('%Y-%m', d)` | `%m` alone merges years |
| Days between | `julianday(a) - julianday(b)` | Comparing dates as strings |
| Conditional totals | `SUM(CASE WHEN cond THEN x ELSE 0 END)` | Several joins just to split by year |
| Rates | `1.0 * a / b` | Integer division gives 0 |
| Fan-out | aggregate before joining a many-side table | Totals multiplied by the number of matching rows |

# Habits that save interviews

- Say the grain out loud and check the primary key of each table.
- Test with one customer who has no rows, one NULL and one tie.
- Compare row counts before and after each join.
- Build in steps with CTEs, then read the result back: does it make business sense?
- Relational division ("bought every book") is `COUNT(DISTINCT x) = (total number of x)`.

=== sql-analytics ===
# Window functions in one picture

An aggregate with `GROUP BY` collapses rows. A window function keeps every row and adds a value computed over a related set of rows: `function() OVER (PARTITION BY group ORDER BY order frame)`.

# Cheat sheet

| Pattern | Shape | Mistake it avoids |
| --- | --- | --- |
| One row per group | `ROW_NUMBER()` with a tie-break, keep `rn = 1` | Arbitrary winner on ties |
| Nth highest value | `DENSE_RANK()` | `RANK` skips places after ties |
| Top N including ties | `RANK() <= N` | `ROW_NUMBER` cuts a tie at the border |
| Filter on a window | wrap in a CTE or subquery | Window functions cannot sit in `WHERE` |
| Running total | `SUM(x) OVER (ORDER BY d ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)` | Default `RANGE` frame gives tied rows the same total |
| Moving average | `AVG(x) OVER (ORDER BY d ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` | Partial windows at the start |
| Previous or next row | `LAG(x)`, `LEAD(x)` with `PARTITION BY` | Mixing readings from different sensors |
| Share of total | `SUM(x) / SUM(SUM(x)) OVER ()` | A second query for the total |
| Equal-sized buckets | `NTILE(n)` | Uneven sizes: the first buckets get the extra rows |
| Median | `ROW_NUMBER` and `COUNT` per group, average the middle one or two | `AVG` is not the median; NULLs shift positions |
| Year over year | join on the shifted month | `LAG(12)` breaks when months are missing |
| Cohort retention | `LEFT JOIN` activity in the target month, `COUNT(DISTINCT)` | Cohorts with no returners vanish; heavy users counted many times |
| Funnel | first time per step with `MIN(CASE ...)`, then compare times | Counting steps without checking their order |
| Sessions | `LAG`, flag gaps above the timeout, running `SUM` of flags | Grouping by calendar day |
| Streaks (gaps and islands) | `DISTINCT` dates, date minus `ROW_NUMBER`, group by that | Duplicate days inflate the streak |

# Habits

- Always state the `PARTITION BY` (the group) and the `ORDER BY` (the order) and the tie rule.
- Decide the frame explicitly when the order column can repeat.
- Test on shuffled input, ties, a single-row group and a year boundary.
