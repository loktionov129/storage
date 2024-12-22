CREATE TABLE Employee
(
  id bigserial constraint "PK_Employee" primary key,
  salary money,
  grade varchar(256)
);

insert into Employee(salary, grade) VALUES
(5, 'jun'),
(6, 'jun'),
(70, 'midal'),
(80, 'midal'),
(300, 'pomidor'),
(999, 'pomidor');


--- 1. Multiple UPDATE queries
/*
UPDATE Employee SET salary = 7 WHERE id = 2;
UPDATE Employee SET salary = 80, grade = 'pomidor' WHERE id = 3;
UPDATE Employee SET grade = 'Ведущий специалист' WHERE id = 5;
*/

-- 2. CASE/WHEN
/*
update Employee
SET salary = CASE
	WHEN id = 2 THEN 7::money
    	WHEN id = 3 THEN 80::money
    	ELSE salary
    END,
    grade = CASE
    	WHEN id = 3 THEN 'pomidor'
    	WHEN id = 5 THEN 'Ведущий специалист'
    	ELSE grade
    END;
*/

--- 3. With CTE
WITH updated(id, salary, grade) AS (VALUES
    (2, 7::money, (select grade from Employee where id = 2)), 
    (3, 80::money, 'pomidor'),
    (5, (select salary from Employee where id = 5), 'Ведущий специалист')
)
UPDATE Employee
    SET 
    salary = updated.salary,
    grade = updated.grade
FROM updated
WHERE (Employee.id = updated.id);




---
select * from Employee
order by id

/* BEFORE
| id  | salary  | grade   |
| --- | ------- | ------- |
| 1   | $5.00   | jun     |
| 2   | $6.00   | jun     |                    --- повысили ЗП
| 3   | $70.00  | midal   |                    --- повысили ЗП и ЗВАНИЕ
| 4   | $80.00  | midal   |
| 5   | $300.00 | pomidor |                    --- повысили ЗВАНИЕ
| 6   | $999.00 | pomidor |
*/

/* AFTER
| id  | salary  | grade              |
| --- | ------- | ------------------ |
| 1   | $5.00   | jun                |
| 2   | $7.00   | jun                |         --- повысили ЗП
| 3   | $80.00  | pomidor            |         --- повысили ЗП и ЗВАНИЕ
| 4   | $80.00  | midal              |
| 5   | $300.00 | Ведущий специалист |         --- повысили ЗВАНИЕ
| 6   | $999.00 | pomidor            |
*/
