const R = String.raw;

export default [
  {
    id: 'sql-core', title: 'SQL practice: filtering, grouping and joins', group: 'coding',
    uses: [
      'Finance and operations teams build monthly revenue and refund reports from payment tables, where one wrong join or NULL turns a total into a misleading number',
      'Growth and support analysts find customers who never ordered, who returned too much, or who signed up twice, then hand those lists to marketing and customer care'
    ],
    tasks: [
      // ---------- easy ----------
      {
        id: 'sq-net-amount', title: 'Net order value', level: 'easy', lang: 'sql', ordered: true,
        prompt: `Table \`orders(id, customer, amount, discount)\`. \`discount\` is NULL when no discount was given.

The net value of an order is \`amount - discount\`, where a missing discount counts as 0. Return \`id\` and the net value as \`net\` for orders with **net >= 100**. Order by \`id\`.`,
        setup: R`CREATE TABLE orders(id INTEGER PRIMARY KEY, customer TEXT, amount INTEGER, discount INTEGER);
INSERT INTO orders VALUES
 (1,'Mona',120,NULL),(2,'Omar',150,30),(3,'Sara',90,NULL),(4,'Ali',200,50),(5,'Nour',130,40);`,
        hiddenSetup: R`CREATE TABLE orders(id INTEGER PRIMARY KEY, customer TEXT, amount INTEGER, discount INTEGER);
INSERT INTO orders VALUES
 (1,'A',100,NULL),(2,'B',100,1),(3,'C',99,NULL),(4,'D',300,200),(5,'E',250,NULL),(6,'F',100,0);`,
        starter: R`SELECT id, amount AS net
FROM orders
ORDER BY id;`,
        solution: R`SELECT id, amount - COALESCE(discount, 0) AS net
FROM orders
WHERE amount - COALESCE(discount, 0) >= 100
ORDER BY id;`
      },
      {
        id: 'sq-payment-band', title: 'Payment size bands', level: 'easy', lang: 'sql', ordered: true,
        prompt: `Table \`payments(id, user_id, amount)\`.

Label each payment in a column \`band\`: \`'unknown'\` when the amount is missing, \`'small'\` when below 20, \`'medium'\` from 20 up to but not including 100, and \`'large'\` for 100 or more. Return \`id\` and \`band\`, ordered by \`id\`.`,
        setup: R`CREATE TABLE payments(id INTEGER PRIMARY KEY, user_id INTEGER, amount REAL);
INSERT INTO payments VALUES
 (1,1,5.5),(2,1,20),(3,2,45),(4,3,100),(5,3,250.75),(6,2,19.99);`,
        hiddenSetup: R`CREATE TABLE payments(id INTEGER PRIMARY KEY, user_id INTEGER, amount REAL);
INSERT INTO payments VALUES
 (1,1,0),(2,1,19.99),(3,2,20),(4,3,99.99),(5,3,100),(6,2,NULL),(7,4,NULL),(8,4,1000);`,
        starter: R`SELECT id, amount AS band
FROM payments
ORDER BY id;`,
        solution: R`SELECT id,
       CASE WHEN amount IS NULL THEN 'unknown'
            WHEN amount < 20 THEN 'small'
            WHEN amount < 100 THEN 'medium'
            ELSE 'large' END AS band
FROM payments
ORDER BY id;`
      },
      {
        id: 'sq-loyal-customers', title: 'Customers with repeat paid orders', level: 'easy', lang: 'sql', ordered: true,
        prompt: `Table \`orders(id, customer_id, status, amount)\`. Status is \`'paid'\` or \`'refunded'\`.

For customers with **at least 2 paid orders**, return \`customer_id\`, the number of paid orders as \`paid_orders\` and their total as \`paid_total\`. Refunded orders are ignored everywhere. Order by \`paid_total\` highest first, then \`customer_id\`.`,
        setup: R`CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER);
INSERT INTO orders VALUES
 (1,1,'paid',50),(2,1,'paid',70),(3,2,'paid',120),(4,2,'refunded',30),(5,3,'paid',20),
 (6,3,'paid',10),(7,3,'paid',90),(8,4,'refunded',60),(9,4,'refunded',40);`,
        hiddenSetup: R`CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER);
INSERT INTO orders VALUES
 (1,5,'paid',10),(2,5,'refunded',10),(3,6,'paid',10),(4,6,'paid',10),(5,7,'paid',40),(6,7,'paid',40),
 (7,8,'paid',100),(8,9,'paid',5),(9,9,'paid',5),(10,9,'paid',5),(11,10,'paid',20),(12,10,'paid',20);`,
        starter: R`SELECT customer_id, COUNT(*) AS paid_orders, SUM(amount) AS paid_total
FROM orders
GROUP BY customer_id;`,
        solution: R`SELECT customer_id, COUNT(*) AS paid_orders, SUM(amount) AS paid_total
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
HAVING COUNT(*) >= 2
ORDER BY paid_total DESC, customer_id;`
      },
      {
        id: 'sq-daily-buyers', title: 'Unique buyers per day', level: 'easy', lang: 'sql', ordered: true,
        prompt: `Table \`events(id, user_id, event, ts)\` where \`ts\` is text like \`'2024-03-01 09:10:00'\`.

For each calendar day that has at least one \`'purchase'\` event, return \`day\` (as \`'YYYY-MM-DD'\`) and the number of **different users** who purchased that day as \`buyers\`. Order by \`day\`.`,
        setup: R`CREATE TABLE events(id INTEGER PRIMARY KEY, user_id INTEGER, event TEXT, ts TEXT);
INSERT INTO events VALUES
 (1,1,'view','2024-03-01 09:00:00'),(2,1,'purchase','2024-03-01 09:10:00'),(3,1,'purchase','2024-03-01 18:00:00'),
 (4,2,'purchase','2024-03-01 11:00:00'),(5,2,'view','2024-03-02 08:00:00'),(6,3,'purchase','2024-03-02 23:59:59'),
 (7,3,'view','2024-03-03 10:00:00');`,
        hiddenSetup: R`CREATE TABLE events(id INTEGER PRIMARY KEY, user_id INTEGER, event TEXT, ts TEXT);
INSERT INTO events VALUES
 (1,1,'purchase','2024-12-31 23:59:59'),(2,1,'purchase','2024-12-31 10:00:00'),(3,1,'purchase','2024-12-31 11:00:00'),
 (4,2,'purchase','2025-01-01 00:00:00'),(5,3,'view','2025-01-01 09:00:00'),(6,2,'purchase','2025-01-01 12:00:00'),
 (7,4,'purchase','2025-01-01 13:00:00'),(8,5,'view','2025-01-02 13:00:00');`,
        starter: R`SELECT ts AS day, COUNT(*) AS buyers
FROM events
GROUP BY ts;`,
        solution: R`SELECT date(ts) AS day, COUNT(DISTINCT user_id) AS buyers
FROM events
WHERE event = 'purchase'
GROUP BY date(ts)
ORDER BY day;`
      },
      {
        id: 'sq-orders-per-user', title: 'Orders per user, including none', level: 'easy', lang: 'sql', ordered: true,
        prompt: `Tables \`users(id, name)\` and \`orders(id, user_id, amount)\`.

Return **every** user with \`name\` and the number of their orders as \`n_orders\` (0 when they have none). Order by \`n_orders\` highest first, then \`name\`.`,
        setup: R`CREATE TABLE users(id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders(id INTEGER PRIMARY KEY, user_id INTEGER, amount INTEGER);
INSERT INTO users VALUES (1,'Mona'),(2,'Omar'),(3,'Sara'),(4,'Ali');
INSERT INTO orders VALUES (1,1,10),(2,1,20),(3,2,15),(4,4,5),(5,4,5),(6,4,5);`,
        hiddenSetup: R`CREATE TABLE users(id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders(id INTEGER PRIMARY KEY, user_id INTEGER, amount INTEGER);
INSERT INTO users VALUES (1,'Bea'),(2,'Cal'),(3,'Dov'),(4,'Eli'),(5,'Abe');
INSERT INTO orders VALUES (1,1,10),(2,2,15),(3,NULL,99),(4,2,5),(5,1,7);`,
        starter: R`SELECT u.name, COUNT(*) AS n_orders
FROM users u
JOIN orders o ON o.user_id = u.id
GROUP BY u.name;`,
        solution: R`SELECT u.name, COUNT(o.id) AS n_orders
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name
ORDER BY n_orders DESC, u.name;`
      },
      // ---------- medium ----------
      {
        id: 'sq-unsold-products', title: 'Products that never sold', level: 'medium', lang: 'sql', ordered: true,
        prompt: `Tables \`products(id, name)\` and \`order_items(id, order_id, product_id, qty)\`. In real data \`product_id\` is sometimes NULL (an item that was deleted from the catalogue).

Return \`id\` and \`name\` of products that appear in **no** order item. Order by \`id\`.`,
        setup: R`CREATE TABLE products(id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE order_items(id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER, qty INTEGER);
INSERT INTO products VALUES (1,'Pen'),(2,'Notebook'),(3,'Stapler'),(4,'Marker');
INSERT INTO order_items VALUES (1,100,1,2),(2,101,1,1),(3,101,2,5);`,
        hiddenSetup: R`CREATE TABLE products(id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE order_items(id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER, qty INTEGER);
INSERT INTO products VALUES (1,'Lamp'),(2,'Desk'),(3,'Chair'),(4,'Shelf');
INSERT INTO order_items VALUES (1,100,2,1),(2,101,NULL,3),(3,102,4,2),(4,103,4,1);`,
        starter: R`SELECT id, name
FROM products
ORDER BY id;`,
        solution: R`SELECT p.id, p.name
FROM products p
WHERE NOT EXISTS (SELECT 1 FROM order_items i WHERE i.product_id = p.id)
ORDER BY p.id;`
      },
      {
        id: 'sq-above-manager', title: 'Paid more than their manager', level: 'medium', lang: 'sql', ordered: true,
        prompt: `Table \`employees(id, name, manager_id, salary)\`. \`manager_id\` points to another row of the same table and is NULL for people with no manager.

Return employees who earn **strictly more** than their manager: \`name\`, \`manager_name\`, \`salary\` and \`manager_salary\`. Order by \`name\`.`,
        setup: R`CREATE TABLE employees(id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER, salary INTEGER);
INSERT INTO employees VALUES
 (1,'Hana',NULL,90),(2,'Omar',1,70),(3,'Sara',1,95),(4,'Ali',2,80),(5,'Nour',2,70);`,
        hiddenSetup: R`CREATE TABLE employees(id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER, salary INTEGER);
INSERT INTO employees VALUES
 (1,'Zed',NULL,100),(2,'Amy',1,100),(3,'Bob',1,120),(4,'Cat',3,120),(5,'Dan',3,130),(6,'Eli',7,50),(7,'Fay',NULL,NULL);`,
        starter: R`SELECT name, salary
FROM employees
ORDER BY name;`,
        solution: R`SELECT e.name, m.name AS manager_name, e.salary, m.salary AS manager_salary
FROM employees e
JOIN employees m ON m.id = e.manager_id
WHERE e.salary > m.salary
ORDER BY e.name;`
      },
      {
        id: 'sq-dedup-signups', title: 'One account per email', level: 'medium', lang: 'sql', ordered: true,
        prompt: `Table \`users_raw(id, email, signed_up)\` holds duplicate sign-ups. Emails that differ only by letter case are the same address.

Keep **one row per address**: the earliest \`signed_up\` (a text date); if two share the earliest date, keep the one with the smaller \`id\`. Return \`id\`, \`email\` in lower case, and \`signed_up\`. Order by \`id\`.`,
        setup: R`CREATE TABLE users_raw(id INTEGER PRIMARY KEY, email TEXT, signed_up TEXT);
INSERT INTO users_raw VALUES
 (1,'ana@x.com','2024-01-05'),(2,'Ana@x.com','2024-01-03'),(3,'bo@x.com','2024-02-01'),
 (4,'bo@x.com','2024-02-09'),(5,'cy@x.com','2024-02-11');`,
        hiddenSetup: R`CREATE TABLE users_raw(id INTEGER PRIMARY KEY, email TEXT, signed_up TEXT);
INSERT INTO users_raw VALUES
 (1,'Dee@x.com','2024-05-01'),(2,'dee@x.com','2024-05-01'),(3,'dee@x.com','2024-06-01'),
 (4,'eve@x.com','2024-05-02'),(5,'EVE@X.COM','2024-05-02'),(6,'fay@x.com','2024-01-01');`,
        starter: R`SELECT id, email, signed_up
FROM users_raw
ORDER BY id;`,
        solution: R`SELECT id, email, signed_up
FROM (
  SELECT id, LOWER(email) AS email, signed_up,
         ROW_NUMBER() OVER (PARTITION BY LOWER(email) ORDER BY signed_up, id) AS rn
  FROM users_raw
) t
WHERE rn = 1
ORDER BY id;`
      },
      {
        id: 'sq-above-dept-average', title: 'Above their own department average', level: 'medium', lang: 'sql', ordered: true,
        prompt: `Table \`employees(id, name, dept, salary)\`. Some salaries are NULL (not yet recorded).

Return \`name\`, \`dept\` and \`salary\` of employees paid **strictly more than the average of their own department** (NULL salaries are ignored by the average). Order by \`dept\`, then \`salary\` highest first, then \`name\`.`,
        setup: R`CREATE TABLE employees(id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES
 (1,'Mona','ML',42000),(2,'Omar','ML',55000),(3,'Sara','Data',38000),
 (4,'Ali','Data',39000),(5,'Nour','ML',56000),(6,'Hany','Platform',47000);`,
        hiddenSetup: R`CREATE TABLE employees(id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES
 (1,'A','X',10),(2,'B','X',30),(3,'C','X',NULL),(4,'D','X',30),(5,'E','Y',50),(6,'F','Y',50),(7,'G','Z',10),
 (8,'H','W',5),(9,'I','W',15),(10,'J','W',15),(11,'K','W',100);`,
        starter: R`SELECT name, dept, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)
ORDER BY dept, salary DESC, name;`,
        solution: R`SELECT e.name, e.dept, e.salary
FROM employees e
WHERE e.salary > (SELECT AVG(x.salary) FROM employees x WHERE x.dept = e.dept)
ORDER BY e.dept, e.salary DESC, e.name;`
      },
      {
        id: 'sq-monthly-revenue', title: 'Revenue per month', level: 'medium', lang: 'sql', ordered: true,
        prompt: `Table \`payments(id, paid_at, amount, status)\` where \`paid_at\` is text such as \`'2024-01-15'\` or \`'2024-03-31 23:59:59'\`.

Count only payments with status \`'success'\`. For each month that has at least one, return \`month\` (as \`'YYYY-MM'\`), \`revenue\` (sum of amount) and \`n_payments\`. Order by \`month\`.`,
        setup: R`CREATE TABLE payments(id INTEGER PRIMARY KEY, paid_at TEXT, amount INTEGER, status TEXT);
INSERT INTO payments VALUES
 (1,'2024-01-15',100,'success'),(2,'2024-01-20',50,'failed'),(3,'2024-02-02',70,'success'),
 (4,'2024-02-28',30,'success'),(5,'2024-03-05',40,'failed');`,
        hiddenSetup: R`CREATE TABLE payments(id INTEGER PRIMARY KEY, paid_at TEXT, amount INTEGER, status TEXT);
INSERT INTO payments VALUES
 (1,'2023-12-31 23:59:59',100,'success'),(2,'2024-12-01 08:00:00',200,'success'),(3,'2024-01-01 00:00:00',10,'success'),
 (4,'2024-12-15',60,'failed'),(5,'2023-12-02',5,'success'),(6,'2024-03-31 23:59:59',20,'failed');`,
        starter: R`SELECT paid_at AS month, SUM(amount) AS revenue, COUNT(*) AS n_payments
FROM payments
GROUP BY paid_at;`,
        solution: R`SELECT strftime('%Y-%m', paid_at) AS month, SUM(amount) AS revenue, COUNT(*) AS n_payments
FROM payments
WHERE status = 'success'
GROUP BY strftime('%Y-%m', paid_at)
ORDER BY month;`
      },
      // ---------- hard ----------
      {
        id: 'sq-return-rate', title: 'Return rate per customer', level: 'hard', lang: 'sql', ordered: true,
        prompt: `Table \`orders(id, customer_id, status, amount)\`. Status is \`'delivered'\`, \`'returned'\` or sometimes NULL (not yet known).

For customers with **at least 3 orders** (of any status), return \`customer_id\`, \`n_orders\`, \`n_returned\` and \`return_rate\` = returned orders divided by all orders, rounded to 2 decimals. Order by \`return_rate\` highest first, then \`customer_id\`.`,
        setup: R`CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER);
INSERT INTO orders VALUES
 (1,1,'delivered',10),(2,1,'returned',10),(3,1,'delivered',10),(4,1,'delivered',10),
 (5,2,'returned',20),(6,2,'returned',20),(7,2,'delivered',20),
 (8,3,'returned',5),(9,3,'delivered',5),
 (10,4,'delivered',5),(11,4,'delivered',5),(12,4,'delivered',5);`,
        hiddenSetup: R`CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER);
INSERT INTO orders VALUES
 (1,1,'returned',9),(2,1,'delivered',9),(3,1,NULL,9),
 (4,2,'returned',9),(5,2,'delivered',9),(6,2,'delivered',9),(7,2,'delivered',9),(8,2,'returned',9),(9,2,'delivered',9),
 (10,3,'returned',9),(11,3,'returned',9),(12,3,'returned',9),
 (13,4,'delivered',9),(14,4,'delivered',9);`,
        starter: R`SELECT customer_id, COUNT(*) AS n_orders
FROM orders
GROUP BY customer_id;`,
        solution: R`SELECT customer_id,
       COUNT(*) AS n_orders,
       SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) AS n_returned,
       ROUND(1.0 * SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) / COUNT(*), 2) AS return_rate
FROM orders
GROUP BY customer_id
HAVING COUNT(*) >= 3
ORDER BY return_rate DESC, customer_id;`
      },
      {
        id: 'sq-bought-all-books', title: 'Bought every book', level: 'hard', lang: 'sql', ordered: true,
        prompt: `Tables \`products(id, name, category)\` and \`purchases(id, customer_id, product_id)\`. A customer can buy the same product more than once.

Return \`customer_id\` for customers who have bought **every** product in the category \`'Books'\` at least once. Order by \`customer_id\`.`,
        setup: R`CREATE TABLE products(id INTEGER PRIMARY KEY, name TEXT, category TEXT);
CREATE TABLE purchases(id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER);
INSERT INTO products VALUES (1,'Novel','Books'),(2,'Atlas','Books'),(3,'Poems','Books'),(4,'Lamp','Home'),(5,'Mug','Home');
INSERT INTO purchases VALUES
 (1,1,1),(2,1,2),(3,1,3),(4,2,1),(5,2,2),(6,2,4),(7,2,5),(8,3,1),(9,3,1),(10,3,1),
 (11,4,1),(12,4,2),(13,4,3),(14,4,3);`,
        hiddenSetup: R`CREATE TABLE products(id INTEGER PRIMARY KEY, name TEXT, category TEXT);
CREATE TABLE purchases(id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER);
INSERT INTO products VALUES (1,'A','Books'),(2,'B','Books'),(3,'C','Books'),(4,'D','Books'),(5,'E','Home'),(6,'F','Toys');
INSERT INTO purchases VALUES
 (1,1,1),(2,1,2),(3,1,3),(4,1,4),(5,2,1),(6,2,2),(7,2,3),(8,2,5),(9,2,6),
 (10,3,1),(11,3,2),(12,3,3),(13,3,4),(14,3,4),(15,4,5),(16,4,6);`,
        starter: R`SELECT DISTINCT customer_id
FROM purchases
ORDER BY customer_id;`,
        solution: R`SELECT pu.customer_id
FROM purchases pu
JOIN products p ON p.id = pu.product_id
WHERE p.category = 'Books'
GROUP BY pu.customer_id
HAVING COUNT(DISTINCT p.id) = (SELECT COUNT(*) FROM products WHERE category = 'Books')
ORDER BY pu.customer_id;`
      },
      {
        id: 'sq-paid-totals', title: 'Paid total for every user', level: 'hard', lang: 'sql', ordered: true,
        prompt: `Tables \`users(id, name)\` and \`orders(id, user_id, amount, status)\`. Status is \`'paid'\` or \`'refunded'\`; \`amount\` can be NULL.

Return **every** user with \`name\` and \`paid_total\`, the sum of the amounts of their **paid** orders (0 when they have none, or when all those amounts are NULL). Order by \`paid_total\` highest first, then \`name\`.`,
        setup: R`CREATE TABLE users(id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders(id INTEGER PRIMARY KEY, user_id INTEGER, amount INTEGER, status TEXT);
INSERT INTO users VALUES (1,'Mona'),(2,'Omar'),(3,'Sara'),(4,'Ali');
INSERT INTO orders VALUES (1,1,50,'paid'),(2,1,30,'refunded'),(3,2,40,'refunded'),(4,4,20,'paid'),(5,4,30,'paid');`,
        hiddenSetup: R`CREATE TABLE users(id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders(id INTEGER PRIMARY KEY, user_id INTEGER, amount INTEGER, status TEXT);
INSERT INTO users VALUES (1,'Bea'),(2,'Cal'),(3,'Dov'),(4,'Eli');
INSERT INTO orders VALUES (1,1,100,'paid'),(2,1,NULL,'paid'),(3,2,NULL,'paid'),(4,2,50,'refunded'),(5,3,10,'paid'),(6,3,15,'paid');`,
        starter: R`SELECT u.name, SUM(o.amount) AS paid_total
FROM users u
JOIN orders o ON o.user_id = u.id
GROUP BY u.name;`,
        solution: R`SELECT u.name, COALESCE(SUM(o.amount), 0) AS paid_total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'paid'
GROUP BY u.id, u.name
ORDER BY paid_total DESC, u.name;`
      },
      {
        id: 'sq-overdue-invoices', title: 'Overdue invoices', level: 'hard', lang: 'sql', ordered: true,
        prompt: `Table \`invoices(id, customer, issued, paid_on)\` with dates as text \`'YYYY-MM-DD'\`. \`paid_on\` is NULL while the invoice is unpaid.

Take **'2024-06-30'** as today. Return unpaid invoices issued **more than 30 days** before today: \`id\` and \`days_open\` (whole days between \`issued\` and today). Order by \`days_open\` highest first, then \`id\`.`,
        setup: R`CREATE TABLE invoices(id INTEGER PRIMARY KEY, customer TEXT, issued TEXT, paid_on TEXT);
INSERT INTO invoices VALUES
 (1,'A','2024-04-15',NULL),(2,'B','2024-05-20','2024-06-01'),(3,'C','2024-06-01',NULL),
 (4,'D','2024-05-30',NULL),(5,'E','2024-03-01',NULL);`,
        hiddenSetup: R`CREATE TABLE invoices(id INTEGER PRIMARY KEY, customer TEXT, issued TEXT, paid_on TEXT);
INSERT INTO invoices VALUES
 (1,'A','2024-05-31',NULL),(2,'B','2024-05-30',NULL),(3,'C','2024-02-15',NULL),(4,'D','2024-02-15','2024-03-01'),
 (5,'E','2024-05-30',NULL),(6,'F','2023-12-31',NULL),(7,'G','2024-06-30',NULL);`,
        starter: R`SELECT id, issued AS days_open
FROM invoices
WHERE paid_on IS NULL;`,
        solution: R`SELECT id, CAST(julianday('2024-06-30') - julianday(issued) AS INTEGER) AS days_open
FROM invoices
WHERE paid_on IS NULL
  AND julianday('2024-06-30') - julianday(issued) > 30
ORDER BY days_open DESC, id;`
      },
      {
        id: 'sq-grew-vs-2023', title: 'Customers who grew year on year', level: 'hard', lang: 'sql', ordered: true,
        prompt: `Table \`orders(id, customer_id, order_date, amount)\` with dates as text \`'YYYY-MM-DD'\`; data spans several years.

Return customers whose **2024 total is greater than their 2023 total**, treating a year with no orders as 0. Columns: \`customer_id\`, \`total_2023\`, \`total_2024\`. Other years are ignored. Order by \`customer_id\`.`,
        setup: R`CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT, amount INTEGER);
INSERT INTO orders VALUES
 (1,1,'2023-03-01',60),(2,1,'2023-11-10',40),(3,1,'2024-02-01',150),(4,2,'2023-05-05',80),(5,2,'2024-05-05',50),
 (6,3,'2024-07-07',60),(7,4,'2023-09-09',90),(8,5,'2022-01-01',500),(9,5,'2024-01-01',10);`,
        hiddenSetup: R`CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT, amount INTEGER);
INSERT INTO orders VALUES
 (1,1,'2023-01-01',100),(2,1,'2024-12-31',100),(3,2,'2023-06-01',50),(4,2,'2024-06-01',70),(5,3,'2025-02-01',999),
 (6,4,'2024-03-03',5),(7,5,'2023-12-31',200),(8,5,'2024-01-01',100),(9,5,'2025-01-01',900),(10,6,'2022-05-05',1);`,
        starter: R`SELECT customer_id, SUM(amount) AS total_2024
FROM orders
GROUP BY customer_id;`,
        solution: R`SELECT customer_id,
       SUM(CASE WHEN strftime('%Y', order_date) = '2023' THEN amount ELSE 0 END) AS total_2023,
       SUM(CASE WHEN strftime('%Y', order_date) = '2024' THEN amount ELSE 0 END) AS total_2024
FROM orders
GROUP BY customer_id
HAVING total_2024 > total_2023
ORDER BY customer_id;`
      }
    ],
    quiz: [
      { q: 'Which clause filters groups after aggregation?', options: ['WHERE', 'HAVING', 'ORDER BY', 'DISTINCT'], answer: 1, why: 'WHERE removes rows before grouping; HAVING keeps or drops whole groups using aggregate values.', level: 'easy' },
      { q: 'A column holds 4, NULL and 8. What does COUNT(column) return?', options: ['3', '1', '2', 'NULL'], answer: 2, why: 'COUNT(column) counts only non-NULL values, so it returns 2; COUNT(*) would return 3.', level: 'easy' },
      { q: 'How do you select rows where `coupon` is missing?', options: ['WHERE coupon = NULL', 'WHERE coupon == 0', 'WHERE coupon IS NULL', 'WHERE coupon = \'\''], answer: 2, why: 'NULL equals nothing, not even itself, so the test must be IS NULL.', level: 'easy' },
      { q: 'Which join keeps every row of the left table even without a match?', options: ['LEFT JOIN', 'INNER JOIN', 'CROSS JOIN', 'JOIN ... USING'], answer: 0, why: 'A LEFT JOIN fills the right-hand columns with NULL when nothing matches.', level: 'easy' },
      { q: 'A column holds 10, NULL and 30. What does AVG(column) return?', options: ['13.33', '20', '40', 'NULL'], answer: 1, why: 'AVG skips NULLs, so it is (10 + 30) / 2 = 20.', level: 'medium' },
      { q: 'Rows have status \'paid\', \'refunded\' and NULL. What does `WHERE status <> \'paid\'` return?', options: ['The refunded and NULL rows', 'Only the refunded rows', 'Only the NULL rows', 'No rows'], answer: 1, why: 'Comparing NULL with anything is unknown, so the NULL row is dropped as well.', level: 'medium' },
      { q: '`WHERE id NOT IN (SELECT user_id FROM orders)` returns nothing, although some users have no orders. What is the likely cause?', options: ['user_id contains a NULL', 'The table has no index', 'NOT IN needs a GROUP BY', 'The subquery returned too many rows'], answer: 0, why: '`x NOT IN (1, NULL)` is never true; use NOT EXISTS or filter the NULLs out.', level: 'medium' },
      { q: 'You LEFT JOIN users to orders, then add `WHERE o.status = \'paid\'`. What happens to users without paid orders?', options: ['They stay, with NULLs', 'They disappear, so the join acts like an inner join', 'The query fails', 'They appear twice'], answer: 1, why: 'WHERE removes rows whose right side is NULL; put the condition in the ON clause to keep them.', level: 'medium' },
      { q: 'You join orders to order_items and then run SUM(orders.amount) grouped by customer. The totals look far too high. Why?', options: ['SUM ignores duplicates', 'Each order row repeats once per item, so its amount is added several times', 'GROUP BY doubles values', 'The join key was an integer'], answer: 1, why: 'Joining to a many-side table multiplies the rows; aggregate before joining or sum a per-order value.', level: 'hard' },
      { q: 'You need one row per lower-cased email, keeping the earliest sign-up, and a deterministic winner on ties. Which approach works?', options: ['SELECT DISTINCT email', 'ROW_NUMBER() OVER (PARTITION BY LOWER(email) ORDER BY signed_up, id) and keep rn = 1', 'GROUP BY email with MIN(signed_up) and join back on the date', 'ORDER BY signed_up LIMIT 1'], answer: 1, why: 'ROW_NUMBER gives exactly one winner per group; joining back on a MIN date returns both rows when dates tie.', level: 'hard' },
      { q: 'users has 2 rows: A with 2 orders, B with none. `SELECT u.id, COUNT(*) FROM users u LEFT JOIN orders o ON o.user_id = u.id GROUP BY u.id` gives B a count of…', options: ['0', 'NULL', '1', 'An error'], answer: 2, why: 'The unmatched row still exists once, and COUNT(*) counts it; use COUNT(o.id) to get 0.', level: 'hard' },
      { q: 'Two years of payments are grouped with `GROUP BY strftime(\'%m\', paid_at)`. What goes wrong?', options: ['Nothing, it is the standard month', 'January of both years merges into one row', 'SQLite rejects the format', 'December is sorted first'], answer: 1, why: '%m is the month number only, so the same month in different years collapses; use %Y-%m.', level: 'hard' }
    ],
    interview: [
      { q: 'What is the difference between WHERE and HAVING?', level: 'easy', points: [['WHERE filters rows before grouping', ['before', 'row']], ['HAVING filters groups after aggregation', ['after', 'group', 'aggregat']], ['Aggregates are only allowed in HAVING, not WHERE', ['count', 'sum', 'aggregate function']], ['Filtering early with WHERE is cheaper', ['cheaper', 'faster', 'fewer rows', 'efficien']]], model: 'WHERE filters individual rows before any grouping happens, so it cannot see aggregates such as COUNT or SUM. HAVING filters the groups after aggregation, so it can say keep only departments with more than five people. In practice I put every condition I can in WHERE, because it removes rows early and the grouping has less to do, and I keep HAVING for conditions that need an aggregate. A typical query keeps paid orders in WHERE, groups by customer, then uses HAVING COUNT of at least two.' },
      { q: 'How do you find customers who have never placed an order, and what can go wrong?', level: 'medium', points: [['LEFT JOIN then filter where the right key IS NULL, or NOT EXISTS', ['left join', 'is null', 'not exists', 'anti']], ['NOT IN fails when the subquery contains a NULL', ['not in', 'null']], ['Put extra conditions on the right table in ON, not WHERE', ['on clause', 'on ', 'where']], ['Check the join key for duplicates and orphans', ['duplicate', 'orphan', 'unique']]], model: 'I would use an anti-join: either LEFT JOIN orders and keep rows where the order id IS NULL, or WHERE NOT EXISTS with a correlated subquery. I avoid NOT IN because a single NULL in the subquery makes the whole condition unknown and the query returns nothing. If I need to restrict to, say, paid orders, that condition belongs in the ON clause, otherwise the WHERE turns the left join back into an inner join. Finally I sanity check the answer: customers with orders plus customers without should equal the customer count.' },
      { q: 'A table has duplicate rows for the same email. How do you keep exactly one per email, and how do you choose the winner?', level: 'medium', points: [['Define the duplicate key, for example lower-cased email', ['lower', 'key', 'normalis', 'normaliz', 'case']], ['ROW_NUMBER over a partition by that key', ['row_number', 'partition']], ['A rule for the winner: earliest, latest or best row', ['earliest', 'latest', 'order by', 'newest', 'oldest']], ['A tie-break such as id so the result is deterministic', ['tie', 'deterministic', 'id']]], model: 'First I decide what counts as a duplicate, for example the lower-cased and trimmed email. Then I use ROW_NUMBER partitioned by that key and ordered by the rule that picks the winner, such as the earliest sign-up. I always add a tie-break like the primary key, otherwise two rows with the same date make the result non-deterministic. I keep rows where the row number is one. I avoid grouping with MIN and joining back, because ties return both rows. Before deleting anything I would check how many rows are affected.' },
      { q: 'A revenue report doubled after a colleague added a join to bring in a product category. How do you debug it?', level: 'hard', points: [['Suspect fan-out: the join key is not unique on one side', ['fan-out', 'fan out', 'multipl', 'duplicat', 'not unique']], ['Compare row counts and sums before and after the join', ['count', 'compare', 'before and after']], ['Find the keys that appear more than once with GROUP BY HAVING', ['having', 'group by', 'more than once']], ['Fix: aggregate first, deduplicate the lookup, or choose the right grain', ['aggregate first', 'subquery', 'cte', 'dedup', 'grain']]], model: 'That smells like fan-out: the new join key is not unique, so each order row now appears once per matching category row and its amount is summed several times. I would compare the row count and the sum before and after the join, then look for keys that appear more than once in the lookup table with GROUP BY and HAVING COUNT above one. The fix depends on the cause: deduplicate the lookup table, aggregate the orders to the grain I need before joining, or join on a more specific key. Afterwards I add a check that the total matches the source table.' }
    ]
  },

  {
    id: 'sql-analytics', title: 'SQL practice: window functions and analytics', group: 'coding',
    uses: [
      'Product analytics teams compute retention cohorts, funnels and sessions from raw event logs to see where users drop off',
      'Finance and IoT teams use running totals, moving averages and year-over-year change to track revenue trends and spot faulty sensors'
    ],
    tasks: [
      // ---------- easy ----------
      {
        id: 'sq-latest-order', title: 'Latest order per customer', level: 'easy', lang: 'sql', ordered: true,
        prompt: `Table \`orders(id, customer_id, ordered_at, amount)\` with \`ordered_at\` as text \`'YYYY-MM-DD'\`.

For each customer return the **most recent** order: \`customer_id\`, \`order_id\` (the order's id) and \`amount\`. If two orders share the latest date, take the one with the higher id. Order by \`customer_id\`.`,
        setup: R`CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, ordered_at TEXT, amount INTEGER);
INSERT INTO orders VALUES
 (1,1,'2024-01-01',10),(2,1,'2024-02-01',20),(3,2,'2024-01-15',5),(4,3,'2024-03-01',7),(5,3,'2024-01-01',9);`,
        hiddenSetup: R`CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, ordered_at TEXT, amount INTEGER);
INSERT INTO orders VALUES
 (1,1,'2024-05-01',10),(2,1,'2024-05-01',20),(3,2,'2024-04-01',5),(4,2,'2024-06-01',6),(5,2,'2024-06-01',7),(6,3,'2024-01-01',1);`,
        starter: R`SELECT customer_id, id AS order_id, amount
FROM orders
ORDER BY customer_id;`,
        solution: R`SELECT customer_id, id AS order_id, amount
FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY ordered_at DESC, id DESC) AS rn
  FROM orders
) t
WHERE rn = 1
ORDER BY customer_id;`
      },
      {
        id: 'sq-second-salary-tier', title: 'Second-highest salary per department', level: 'easy', lang: 'sql', ordered: true,
        prompt: `Table \`employees(id, name, dept, salary)\`.

Within each department, find the employees who have the **second-highest distinct salary** (people on the same salary share the same place). Return \`dept\`, \`name\`, \`salary\`. Order by \`dept\`, then \`name\`.`,
        setup: R`CREATE TABLE employees(id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES
 (1,'Mona','ML',42000),(2,'Omar','ML',55000),(3,'Sara','Data',38000),
 (4,'Ali','Data',39000),(5,'Nour','ML',56000),(6,'Hany','Platform',47000);`,
        hiddenSetup: R`CREATE TABLE employees(id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES
 (1,'A','X',100),(2,'B','X',100),(3,'C','X',90),(4,'D','X',90),(5,'E','X',80),(6,'F','Y',50),
 (7,'G','Z',70),(8,'H','Z',60),(9,'I','Z',60),(10,'J','W',10),(11,'K','W',10);`,
        starter: R`SELECT dept, name, salary
FROM employees
ORDER BY dept, name;`,
        solution: R`SELECT dept, name, salary
FROM (
  SELECT dept, name, salary, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS r
  FROM employees
) t
WHERE r = 2
ORDER BY dept, name;`
      },
      {
        id: 'sq-running-revenue', title: 'Running revenue total', level: 'easy', lang: 'sql', ordered: true,
        prompt: `Table \`daily_sales(day, revenue)\` with one row per day (\`day\` as text \`'YYYY-MM-DD'\`). Rows may be stored in any order and revenue can be negative on refund days.

Return \`day\`, \`revenue\` and \`running_total\`, the sum of revenue from the first day up to and including that day. Order by \`day\`.`,
        setup: R`CREATE TABLE daily_sales(day TEXT PRIMARY KEY, revenue INTEGER);
INSERT INTO daily_sales VALUES ('2024-05-01',100),('2024-05-02',150),('2024-05-03',80),('2024-05-04',120);`,
        hiddenSetup: R`CREATE TABLE daily_sales(day TEXT PRIMARY KEY, revenue INTEGER);
INSERT INTO daily_sales VALUES ('2024-05-03',-30),('2024-05-01',50),('2024-05-05',200),('2024-05-02',10),('2024-05-04',0);`,
        starter: R`SELECT day, revenue
FROM daily_sales
ORDER BY day;`,
        solution: R`SELECT day, revenue,
       SUM(revenue) OVER (ORDER BY day ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM daily_sales
ORDER BY day;`
      },
      {
        id: 'sq-temp-change', title: 'Temperature change between readings', level: 'easy', lang: 'sql', ordered: true,
        prompt: `Table \`readings(sensor_id, ts, temp)\` with \`ts\` as text \`'YYYY-MM-DD HH:MM'\`. Rows are stored in no particular order.

Return \`sensor_id\`, \`ts\`, \`temp\` and \`change\`: the temperature minus the **same sensor's** previous reading (NULL for its first reading). Order by \`sensor_id\`, then \`ts\`.`,
        setup: R`CREATE TABLE readings(sensor_id INTEGER, ts TEXT, temp REAL);
INSERT INTO readings VALUES
 (1,'2024-06-01 10:00',20.0),(2,'2024-06-01 10:00',18.0),(1,'2024-06-01 11:00',21.5),
 (2,'2024-06-01 11:00',19.0),(1,'2024-06-01 12:00',21.0);`,
        hiddenSetup: R`CREATE TABLE readings(sensor_id INTEGER, ts TEXT, temp REAL);
INSERT INTO readings VALUES
 (3,'2024-06-01 09:00',30.0),(1,'2024-06-01 12:00',25.0),(2,'2024-06-01 10:00',10.0),(1,'2024-06-01 10:00',20.0),
 (2,'2024-06-01 11:00',12.5),(3,'2024-06-01 10:00',29.0),(1,'2024-06-01 11:00',22.0),(4,'2024-06-01 08:00',5.0);`,
        starter: R`SELECT sensor_id, ts, temp, temp AS change
FROM readings
ORDER BY sensor_id, ts;`,
        solution: R`SELECT sensor_id, ts, temp,
       temp - LAG(temp) OVER (PARTITION BY sensor_id ORDER BY ts) AS change
FROM readings
ORDER BY sensor_id, ts;`
      },
      {
        id: 'sq-category-share', title: 'Revenue share per category', level: 'easy', lang: 'sql', ordered: true,
        prompt: `Table \`sales(id, category, amount)\`.

For each category return \`category\`, \`revenue\` (sum of amount) and \`pct\`: its share of the grand total in percent, rounded to 1 decimal. Order by \`revenue\` highest first, then \`category\`.`,
        setup: R`CREATE TABLE sales(id INTEGER PRIMARY KEY, category TEXT, amount INTEGER);
INSERT INTO sales VALUES (1,'Books',100),(2,'Books',200),(3,'Toys',200),(4,'Games',300),(5,'Games',200);`,
        hiddenSetup: R`CREATE TABLE sales(id INTEGER PRIMARY KEY, category TEXT, amount INTEGER);
INSERT INTO sales VALUES (1,'B',100),(2,'A',100),(3,'C',100),(4,'D',0),(5,'D',0);`,
        starter: R`SELECT category, SUM(amount) AS revenue
FROM sales
GROUP BY category;`,
        solution: R`SELECT category, SUM(amount) AS revenue,
       ROUND(100.0 * SUM(amount) / SUM(SUM(amount)) OVER (), 1) AS pct
FROM sales
GROUP BY category
ORDER BY revenue DESC, category;`
      },
      // ---------- medium ----------
      {
        id: 'sq-top2-products', title: 'Top two products per category', level: 'medium', lang: 'sql', ordered: true,
        prompt: `Table \`product_sales(product, category, units)\`.

Return the **top 2 places** per category by \`units\`: \`category\`, \`product\`, \`units\`. Products tied on units share a place, and a tie for 2nd place includes everyone tied; after a tie for 1st, the next place is 3rd (standard competition ranking). Order by \`category\`, then \`units\` highest first, then \`product\`.`,
        setup: R`CREATE TABLE product_sales(product TEXT, category TEXT, units INTEGER);
INSERT INTO product_sales VALUES
 ('Car','Toys',50),('Doll','Toys',40),('Ball','Toys',30),('Chess','Games',70),('Ludo','Games',60),('Go','Games',20),
 ('Novel','Books',90),('Atlas','Books',90),('Comic','Books',10);`,
        hiddenSetup: R`CREATE TABLE product_sales(product TEXT, category TEXT, units INTEGER);
INSERT INTO product_sales VALUES
 ('p1','A',10),('p2','A',8),('p3','A',8),('p4','A',5),('q1','B',5),('r1','C',9),('r2','C',9),('r3','C',9),
 ('s1','D',7),('s2','D',7),('s3','D',3);`,
        starter: R`SELECT category, product, units
FROM product_sales
ORDER BY category, units DESC, product;`,
        solution: R`SELECT category, product, units
FROM (
  SELECT *, RANK() OVER (PARTITION BY category ORDER BY units DESC) AS r
  FROM product_sales
) t
WHERE r <= 2
ORDER BY category, units DESC, product;`
      },
      {
        id: 'sq-moving-average', title: 'Three-day moving average', level: 'medium', lang: 'sql', ordered: true,
        prompt: `Table \`daily_visits(day, visits)\` with one row per day, stored in any order.

Return \`day\` and \`avg_3\`: the average of \`visits\` over that day and the two rows before it, rounded to 2 decimals. Only include days that **have two earlier rows** (a full 3-row window). Order by \`day\`.`,
        setup: R`CREATE TABLE daily_visits(day TEXT PRIMARY KEY, visits INTEGER);
INSERT INTO daily_visits VALUES
 ('2024-07-01',100),('2024-07-02',120),('2024-07-03',90),('2024-07-04',130),('2024-07-05',110),('2024-07-06',150);`,
        hiddenSetup: R`CREATE TABLE daily_visits(day TEXT PRIMARY KEY, visits INTEGER);
INSERT INTO daily_visits VALUES
 ('2024-07-04',10),('2024-07-01',40),('2024-07-03',20),('2024-07-02',0);`,
        starter: R`SELECT day, visits AS avg_3
FROM daily_visits
ORDER BY day;`,
        solution: R`SELECT day, avg_3
FROM (
  SELECT day,
         ROUND(AVG(visits) OVER (ORDER BY day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS avg_3,
         ROW_NUMBER() OVER (ORDER BY day) AS rn
  FROM daily_visits
) t
WHERE rn >= 3
ORDER BY day;`
      },
      {
        id: 'sq-plan-changes', title: 'Plan changes', level: 'medium', lang: 'sql', ordered: true,
        prompt: `Table \`plan_history(user_id, changed_at, plan)\`: each row is the plan a user was on from that date (\`changed_at\` as text \`'YYYY-MM-DD'\`). The same plan is sometimes recorded twice in a row.

Return real changes only: rows whose plan differs from that user's previous plan. Columns: \`user_id\`, \`changed_at\`, \`from_plan\`, \`to_plan\`. A user's first row is not a change. Order by \`user_id\`, then \`changed_at\`.`,
        setup: R`CREATE TABLE plan_history(user_id INTEGER, changed_at TEXT, plan TEXT);
INSERT INTO plan_history VALUES
 (1,'2024-01-01','free'),(1,'2024-03-01','pro'),(1,'2024-06-01','pro'),(1,'2024-09-01','team'),
 (2,'2024-02-01','free'),(3,'2024-01-10','free'),(3,'2024-02-10','pro');`,
        hiddenSetup: R`CREATE TABLE plan_history(user_id INTEGER, changed_at TEXT, plan TEXT);
INSERT INTO plan_history VALUES
 (5,'2024-08-01','free'),(4,'2024-03-01','team'),(4,'2024-01-01','pro'),(4,'2024-05-01','pro'),(4,'2024-07-01','free'),
 (5,'2024-02-01','free'),(6,'2024-04-04','pro');`,
        starter: R`SELECT user_id, changed_at, plan AS to_plan
FROM plan_history
ORDER BY user_id, changed_at;`,
        solution: R`SELECT user_id, changed_at, from_plan, plan AS to_plan
FROM (
  SELECT user_id, changed_at, plan,
         LAG(plan) OVER (PARTITION BY user_id ORDER BY changed_at) AS from_plan
  FROM plan_history
) t
WHERE from_plan IS NOT NULL AND from_plan <> plan
ORDER BY user_id, changed_at;`
      },
      {
        id: 'sq-yoy-revenue', title: 'Year-over-year revenue change', level: 'medium', lang: 'sql', ordered: true,
        prompt: `Table \`monthly_revenue(month, revenue)\` with \`month\` as text \`'YYYY-MM'\`. Some months are missing from the table.

For every month whose **same month one year earlier** exists, return \`month\`, \`revenue\`, \`prev_year_revenue\` and \`yoy_pct\` = percentage change from last year, rounded to 1 decimal. Order by \`month\`.`,
        setup: R`CREATE TABLE monthly_revenue(month TEXT PRIMARY KEY, revenue INTEGER);
INSERT INTO monthly_revenue VALUES
 ('2023-01',100),('2023-02',120),('2023-03',90),('2024-01',110),('2024-02',108),('2024-03',135);`,
        hiddenSetup: R`CREATE TABLE monthly_revenue(month TEXT PRIMARY KEY, revenue INTEGER);
INSERT INTO monthly_revenue VALUES
 ('2022-11',200),('2022-12',220),('2023-02',250),('2023-11',230),('2023-12',198),('2024-02',300);`,
        starter: R`SELECT month, revenue
FROM monthly_revenue
ORDER BY month;`,
        solution: R`SELECT c.month, c.revenue, p.revenue AS prev_year_revenue,
       ROUND(100.0 * (c.revenue - p.revenue) / p.revenue, 1) AS yoy_pct
FROM monthly_revenue c
JOIN monthly_revenue p
  ON c.month = strftime('%Y-%m', p.month || '-01', '+1 year')
ORDER BY c.month;`
      },
      {
        id: 'sq-spend-tiers', title: 'Spend tiers with NTILE', level: 'medium', lang: 'sql', ordered: true,
        prompt: `Table \`customer_totals(customer_id, total)\`.

Split customers into **3 tiers** of (as near as possible) equal size by \`total\`, where tier 1 holds the highest spenders. Break ties on \`total\` by the lower \`customer_id\` first. Return \`customer_id\`, \`total\`, \`tier\`. Order by \`total\` highest first, then \`customer_id\`.`,
        setup: R`CREATE TABLE customer_totals(customer_id INTEGER PRIMARY KEY, total INTEGER);
INSERT INTO customer_totals VALUES (1,500),(2,300),(3,300),(4,200),(5,100),(6,50);`,
        hiddenSetup: R`CREATE TABLE customer_totals(customer_id INTEGER PRIMARY KEY, total INTEGER);
INSERT INTO customer_totals VALUES (7,40),(3,40),(1,90),(2,90),(5,10),(4,40),(6,10);`,
        starter: R`SELECT customer_id, total, 1 AS tier
FROM customer_totals
ORDER BY total DESC, customer_id;`,
        solution: R`SELECT customer_id, total,
       NTILE(3) OVER (ORDER BY total DESC, customer_id) AS tier
FROM customer_totals
ORDER BY total DESC, customer_id;`
      },
      // ---------- hard ----------
      {
        id: 'sq-median-salary', title: 'Median salary per department', level: 'hard', lang: 'sql', ordered: true,
        prompt: `Table \`employees(id, dept, salary)\`. Some salaries are NULL.

Return \`dept\` and \`median_salary\`. Ignore NULL salaries. With an even number of known salaries the median is the average of the two middle values. Departments with no known salary are left out. Order by \`dept\`.`,
        setup: R`CREATE TABLE employees(id INTEGER PRIMARY KEY, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES (1,'ML',42000),(2,'ML',55000),(3,'Data',38000),(4,'Data',39000),(5,'ML',56000),(6,'Platform',47000);`,
        hiddenSetup: R`CREATE TABLE employees(id INTEGER PRIMARY KEY, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES
 (1,'X',10),(2,'X',20),(3,'X',20),(4,'X',40),(5,'Y',5),(6,'Z',1),(7,'Z',2),(8,'Z',NULL),(9,'W',NULL),(10,'V',7),(11,'V',9),(12,'V',100);`,
        starter: R`SELECT dept, AVG(salary) AS median_salary
FROM employees
GROUP BY dept
ORDER BY dept;`,
        solution: R`WITH r AS (
  SELECT dept, salary,
         ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary) AS rn,
         COUNT(*) OVER (PARTITION BY dept) AS n
  FROM employees
  WHERE salary IS NOT NULL
)
SELECT dept, AVG(salary) AS median_salary
FROM r
WHERE rn IN ((n + 1) / 2, (n + 2) / 2)
GROUP BY dept
ORDER BY dept;`
      },
      {
        id: 'sq-cohort-retention', title: 'Month-1 retention by signup cohort', level: 'hard', lang: 'sql', ordered: true,
        prompt: `Tables \`users(id, signup_date)\` and \`activity(user_id, active_date)\`, dates as text \`'YYYY-MM-DD'\`. A user can have many activity rows.

Group users into cohorts by signup month. For each cohort return \`cohort\` (\`'YYYY-MM'\`), \`cohort_size\`, \`retained\` (users active at least once in the **calendar month after** their signup month) and \`retention_pct\` (retained / cohort size in percent, 1 decimal). Cohorts with nobody retained still appear. Order by \`cohort\`.`,
        setup: R`CREATE TABLE users(id INTEGER PRIMARY KEY, signup_date TEXT);
CREATE TABLE activity(user_id INTEGER, active_date TEXT);
INSERT INTO users VALUES (1,'2024-01-05'),(2,'2024-01-20'),(3,'2024-01-28'),(4,'2024-02-03'),(5,'2024-02-15');
INSERT INTO activity VALUES (1,'2024-02-02'),(1,'2024-02-20'),(2,'2024-02-11'),(3,'2024-03-01'),(4,'2024-03-05'),(5,'2024-02-20');`,
        hiddenSetup: R`CREATE TABLE users(id INTEGER PRIMARY KEY, signup_date TEXT);
CREATE TABLE activity(user_id INTEGER, active_date TEXT);
INSERT INTO users VALUES (1,'2023-12-10'),(2,'2023-12-12'),(3,'2024-01-03'),(4,'2024-03-09');
INSERT INTO activity VALUES (1,'2024-01-04'),(1,'2024-01-09'),(1,'2024-01-20'),(2,'2023-12-30'),(3,'2024-01-10'),(4,'2024-03-20'),(4,'2024-05-01');`,
        starter: R`SELECT strftime('%Y-%m', signup_date) AS cohort, COUNT(*) AS cohort_size
FROM users
GROUP BY cohort
ORDER BY cohort;`,
        solution: R`SELECT strftime('%Y-%m', u.signup_date) AS cohort,
       COUNT(DISTINCT u.id) AS cohort_size,
       COUNT(DISTINCT a.user_id) AS retained,
       ROUND(100.0 * COUNT(DISTINCT a.user_id) / COUNT(DISTINCT u.id), 1) AS retention_pct
FROM users u
LEFT JOIN activity a
  ON a.user_id = u.id
 AND strftime('%Y-%m', a.active_date) = strftime('%Y-%m', u.signup_date, 'start of month', '+1 month')
GROUP BY cohort
ORDER BY cohort;`
      },
      {
        id: 'sq-funnel', title: 'View, cart, buy funnel', level: 'hard', lang: 'sql', ordered: false,
        prompt: `Table \`events(user_id, step, ts)\` where \`step\` is \`'view'\`, \`'cart'\` or \`'buy'\` and \`ts\` is sortable text. Users repeat steps.

Use each user's **first** time for each step. Return one row with: \`viewed\` (users with a view), \`carted\` (users whose first cart is **later** than their first view) and \`bought\` (of those, users whose first buy is later than their first cart).`,
        setup: R`CREATE TABLE events(user_id INTEGER, step TEXT, ts TEXT);
INSERT INTO events VALUES
 (1,'view','2024-04-01 10:00'),(1,'cart','2024-04-01 10:05'),(1,'buy','2024-04-01 10:09'),
 (2,'view','2024-04-01 11:00'),(2,'cart','2024-04-01 11:02'),
 (3,'view','2024-04-01 12:00'),
 (4,'cart','2024-04-01 09:00'),(4,'view','2024-04-01 09:30'),
 (5,'view','2024-04-01 13:00'),(5,'buy','2024-04-01 13:10');`,
        hiddenSetup: R`CREATE TABLE events(user_id INTEGER, step TEXT, ts TEXT);
INSERT INTO events VALUES
 (1,'view','2024-04-01 10:00'),(1,'view','2024-04-02 10:00'),(1,'cart','2024-04-01 10:05'),(1,'cart','2024-04-03 10:05'),(1,'buy','2024-04-04 10:00'),(1,'buy','2024-04-05 10:00'),
 (2,'view','2024-04-01 08:00'),(2,'buy','2024-04-01 08:30'),(2,'cart','2024-04-01 09:00'),
 (3,'cart','2024-04-01 08:00'),(3,'buy','2024-04-01 08:10'),
 (4,'view','2024-04-02 08:00'),(4,'cart','2024-04-02 08:01'),(4,'buy','2024-04-02 08:02'),
 (5,'view','2024-04-02 09:00');`,
        starter: R`SELECT COUNT(DISTINCT user_id) AS viewed, COUNT(DISTINCT user_id) AS carted, COUNT(DISTINCT user_id) AS bought
FROM events;`,
        solution: R`WITH f AS (
  SELECT user_id,
         MIN(CASE WHEN step = 'view' THEN ts END) AS v,
         MIN(CASE WHEN step = 'cart' THEN ts END) AS c,
         MIN(CASE WHEN step = 'buy' THEN ts END) AS b
  FROM events
  GROUP BY user_id
)
SELECT COUNT(v) AS viewed,
       COUNT(CASE WHEN c > v THEN 1 END) AS carted,
       COUNT(CASE WHEN c > v AND b > c THEN 1 END) AS bought
FROM f;`
      },
      {
        id: 'sq-sessions', title: 'Sessionise an event log', level: 'hard', lang: 'sql', ordered: true,
        prompt: `Table \`events(user_id, ts)\` with \`ts\` as text \`'YYYY-MM-DD HH:MM:SS'\`, stored in any order.

A user's events belong to the same session unless the gap from their previous event is **more than 30 minutes** (exactly 30 minutes stays in the session). Number sessions per user from 1. Return \`user_id\`, \`session_no\`, \`started_at\` (first ts), \`ended_at\` (last ts) and \`n_events\`. Order by \`user_id\`, then \`session_no\`.`,
        setup: R`CREATE TABLE events(user_id INTEGER, ts TEXT);
INSERT INTO events VALUES
 (1,'2024-05-01 09:00:00'),(1,'2024-05-01 09:10:00'),(1,'2024-05-01 09:40:00'),(1,'2024-05-01 11:00:00'),(2,'2024-05-01 10:00:00');`,
        hiddenSetup: R`CREATE TABLE events(user_id INTEGER, ts TEXT);
INSERT INTO events VALUES
 (2,'2024-05-02 23:50:00'),(1,'2024-05-01 10:31:01'),(1,'2024-05-01 10:00:00'),(2,'2024-05-03 00:10:00'),(1,'2024-05-01 10:00:00'),
 (2,'2024-05-03 01:00:00'),(3,'2024-05-01 00:00:00'),(1,'2024-05-02 10:00:00');`,
        starter: R`SELECT user_id, 1 AS session_no, MIN(ts) AS started_at, MAX(ts) AS ended_at, COUNT(*) AS n_events
FROM events
GROUP BY user_id
ORDER BY user_id;`,
        solution: R`WITH g AS (
  SELECT user_id, ts,
         CASE WHEN LAG(ts) OVER (PARTITION BY user_id ORDER BY ts) IS NULL
                OR strftime('%s', ts) - strftime('%s', LAG(ts) OVER (PARTITION BY user_id ORDER BY ts)) > 1800
              THEN 1 ELSE 0 END AS new_s
  FROM events
), s AS (
  SELECT user_id, ts,
         SUM(new_s) OVER (PARTITION BY user_id ORDER BY ts ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS session_no
  FROM g
)
SELECT user_id, session_no, MIN(ts) AS started_at, MAX(ts) AS ended_at, COUNT(*) AS n_events
FROM s
GROUP BY user_id, session_no
ORDER BY user_id, session_no;`
      },
      {
        id: 'sq-longest-streak', title: 'Longest login streak', level: 'hard', lang: 'sql', ordered: true,
        prompt: `Table \`logins(user_id, login_date)\` with dates as text \`'YYYY-MM-DD'\`. A user may log in several times a day, and rows are in any order.

For each user return \`user_id\` and \`longest_streak\`: the longest run of **consecutive calendar days** with at least one login. Order by \`user_id\`.`,
        setup: R`CREATE TABLE logins(user_id INTEGER, login_date TEXT);
INSERT INTO logins VALUES
 (1,'2024-01-01'),(1,'2024-01-02'),(1,'2024-01-03'),(1,'2024-01-05'),(1,'2024-01-06'),
 (2,'2024-01-01'),(2,'2024-01-03'),(2,'2024-01-05'),
 (3,'2024-01-10'),(3,'2024-01-10'),(3,'2024-01-11');`,
        hiddenSetup: R`CREATE TABLE logins(user_id INTEGER, login_date TEXT);
INSERT INTO logins VALUES
 (1,'2024-02-29'),(1,'2024-02-28'),(1,'2024-03-01'),(1,'2024-03-01'),(1,'2024-03-03'),
 (2,'2024-01-31'),(2,'2024-02-01'),(2,'2024-02-03'),(2,'2024-02-04'),(2,'2024-02-05'),
 (3,'2024-05-05');`,
        starter: R`SELECT user_id, COUNT(*) AS longest_streak
FROM logins
GROUP BY user_id
ORDER BY user_id;`,
        solution: R`WITH d AS (
  SELECT DISTINCT user_id, login_date FROM logins
), n AS (
  SELECT user_id, login_date,
         date(login_date, '-' || ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) || ' days') AS grp
  FROM d
), s AS (
  SELECT user_id, COUNT(*) AS len FROM n GROUP BY user_id, grp
)
SELECT user_id, MAX(len) AS longest_streak
FROM s
GROUP BY user_id
ORDER BY user_id;`
      }
    ],
    quiz: [
      { q: 'Salaries 100, 100 and 90 are ranked with RANK() OVER (ORDER BY salary DESC). What is the rank of 90?', options: ['2', '3', '1', 'NULL'], answer: 1, why: 'RANK leaves a gap after a tie: 1, 1, 3. DENSE_RANK would give 2.', level: 'easy' },
      { q: 'What does LAG(amount) return on the first row of a partition?', options: ['0', 'The same row amount', 'NULL', 'An error'], answer: 2, why: 'There is no earlier row, so LAG returns NULL unless you pass a default.', level: 'easy' },
      { q: 'Which expression gives a running total of sales ordered by day?', options: ['SUM(sales) OVER ()', 'SUM(sales) OVER (ORDER BY day)', 'SUM(sales) GROUP BY day', 'COUNT(sales) OVER (ORDER BY day)'], answer: 1, why: 'Adding ORDER BY to the window makes the sum grow row by row.', level: 'easy' },
      { q: 'What does PARTITION BY do inside OVER?', options: ['Sorts the output', 'Splits rows into independent groups for the window calculation', 'Removes duplicate rows', 'Limits the result to one row per group'], answer: 1, why: 'The window restarts for each partition, but every row is kept.', level: 'easy' },
      { q: 'You want only rows where ROW_NUMBER() OVER (...) = 1. Where must the condition go?', options: ['In WHERE of the same SELECT', 'In HAVING', 'In an outer query or CTE that wraps the window', 'In GROUP BY'], answer: 2, why: 'Window functions are evaluated after WHERE, so you filter on them one level up.', level: 'medium' },
      { q: 'Top 3 per group, where everyone tied for third place must be included. Which function?', options: ['ROW_NUMBER() <= 3', 'RANK() <= 3', 'NTILE(3)', 'LAG(3)'], answer: 1, why: 'RANK gives tied rows the same place, so all of them pass the filter; ROW_NUMBER cuts ties arbitrarily.', level: 'medium' },
      { q: 'Which frame computes a 3-row moving average ending at the current row?', options: ['ROWS BETWEEN 3 PRECEDING AND CURRENT ROW', 'ROWS BETWEEN 2 PRECEDING AND CURRENT ROW', 'ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING', 'RANGE UNBOUNDED PRECEDING'], answer: 1, why: 'Two previous rows plus the current one makes three rows.', level: 'medium' },
      { q: 'To split events into sessions with a 30-minute timeout, the usual recipe is…', options: ['GROUP BY date', 'Flag a new session when the gap to the previous event exceeds 30 minutes, then take a running SUM of the flags', 'Use RANK on the timestamp', 'DISTINCT user_id'], answer: 1, why: 'The cumulative sum of 0/1 flags gives every event its session number.', level: 'medium' },
      { q: 'In the gaps-and-islands trick, what stays constant within a run of consecutive dates?', options: ['The date minus its row number (in days)', 'The date plus the user id', 'The count of rows in the table', 'The first letter of the month'], answer: 0, why: 'Consecutive dates rise by one day as the row number rises by one, so their difference is the same.', level: 'hard' },
      { q: 'Two rows share the same day and the query uses `SUM(x) OVER (ORDER BY day)` with the default frame. What do those two rows show?', options: ['Different running totals, in storage order', 'The same running total, which includes both rows', 'NULL for the second row', 'The total of the first row only'], answer: 1, why: 'The default RANGE frame treats rows with equal ORDER BY values as peers; use ROWS to step one row at a time.', level: 'hard' },
      { q: 'A cohort has 100 signups but only 40 of them ever return. For retention you should divide the returners by…', options: ['40', '100, the cohort size', 'The number of active days', 'The number of cohorts'], answer: 1, why: 'The denominator is everyone who signed up, which needs a LEFT JOIN so non-returners still count.', level: 'hard' },
      { q: 'Why can `LAG(revenue, 12)` give a wrong year-over-year change on a monthly table?', options: ['LAG cannot take an offset', 'If months are missing, 12 rows back is not the same month last year', 'LAG only works on integers', 'It always returns NULL'], answer: 1, why: 'Row offsets assume no gaps; join on the shifted date instead.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain ROW_NUMBER, RANK and DENSE_RANK and when each is the right choice.', level: 'easy', points: [['ROW_NUMBER gives unique numbers and breaks ties arbitrarily', ['unique', 'row_number', 'arbitrar']], ['RANK gives ties the same place and leaves gaps', ['gap', 'skip', 'rank']], ['DENSE_RANK gives ties the same place without gaps', ['dense', 'no gap', 'without gap']], ['Pick by the business rule: one row, or all ties', ['tie', 'business', 'rule']]], model: 'All three number rows inside a partition by an ordering. ROW_NUMBER gives every row a unique number, so ties are split arbitrarily unless I add a tie-break column. RANK gives tied rows the same place and then skips, so values 100, 100, 90 get 1, 1, 3. DENSE_RANK also shares places but does not skip, giving 1, 1, 2. I choose by the business rule: ROW_NUMBER when I need exactly one row, such as the latest record, DENSE_RANK for the second-highest salary, and RANK for a leaderboard where ties share a place.' },
      { q: 'How would you return the top 3 products by revenue in each category?', level: 'medium', points: [['Aggregate revenue per product first', ['aggregate', 'sum', 'group by']], ['Rank within each category using a window with PARTITION BY', ['partition', 'rank', 'row_number']], ['Filter on the rank in an outer query or CTE', ['outer', 'cte', 'subquery', 'wrap']], ['Decide how to treat ties and add a tie-break', ['tie', 'break']]], model: 'First I aggregate to one row per product and category with SUM of revenue. Then in a CTE I rank products inside each category with a window function, partitioned by category and ordered by revenue descending. Because window functions cannot be filtered in the same SELECT, an outer query keeps rows where the rank is at most three. I ask whether ties should all be included: RANK keeps everyone tied, ROW_NUMBER with a tie-break such as the product id returns exactly three. I would also check a category with fewer than three products behaves sensibly.' },
      { q: 'You have a raw event log with user ids and timestamps. How do you turn it into sessions?', level: 'medium', points: [['Order each user events by time with a window partitioned by user', ['partition', 'order', 'lag']], ['Compute the gap to the previous event with LAG', ['lag', 'gap', 'previous']], ['Flag a new session when the gap exceeds the timeout', ['flag', 'timeout', 'threshold', '30']], ['Running sum of flags gives the session number', ['running', 'cumulative', 'sum']]], model: 'I partition by user and order by timestamp, then use LAG to get the previous event time. A new session starts when there is no previous event or the gap is longer than the timeout, say thirty minutes, so I create a flag of one for those rows and zero otherwise. A running SUM of that flag per user gives every event a session number. Then I group by user and session number to get start, end and event count. I check the boundary, a gap of exactly the timeout, and duplicate timestamps.' },
      { q: 'Design a query for month-one retention by signup cohort. What traps do you watch for?', level: 'hard', points: [['Cohort is the signup month and cohort size is the denominator', ['cohort', 'denominator', 'size']], ['LEFT JOIN activity in the following calendar month so empty cohorts survive', ['left join', 'empty', 'zero']], ['COUNT DISTINCT users because activity has many rows', ['distinct', 'duplicate', 'many rows']], ['Date arithmetic across year ends, and exclude the signup month itself', ['year', 'december', 'boundary', 'signup month', 'strftime']]], model: 'I assign every user to a cohort by signup month and use the number of users in that cohort as the denominator. Then I LEFT JOIN their activity restricted to the calendar month after signup, so cohorts where nobody returned still show zero instead of vanishing. Activity has many rows per user, so I count distinct users, otherwise heavy users inflate retention. I compute the next month with date functions so December rolls into January correctly, and I make sure activity in the signup month itself does not count. Finally I sanity check that retention never exceeds a hundred percent.' }
    ]
  }
];
