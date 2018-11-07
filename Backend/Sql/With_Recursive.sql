DROP TABLE IF EXISTS [Tasks];

CREATE TABLE [dbo].[Tasks] (
    [Id]       INT IDENTITY (1, 1) NOT NULL,
    [ParentId] INT NULL,
    CONSTRAINT [PK_dbo.Tasks] PRIMARY KEY CLUSTERED ([Id] ASC),
    FOREIGN KEY ([ParentId]) REFERENCES [dbo].[Tasks] ([Id])
);

INSERT INTO Tasks ([ParentId]) VALUES
(NULL), -- 1. parent task
(NULL), -- 2. parent task
(1),    -- 3. subtask for #1
(1),    -- 4. subtask for #1
(4),    -- 5. subtask for #4
(5),    -- 6. subtask for #5
(2),    -- 7. subtask for #2
(NULL); -- 8. parent task

WITH [TaskWithAllChildTasks] ([Id], [ParentId]) AS
    (
	 -- 1 - Id задачи, которую хотим удалить
        SELECT 1, NULL
        UNION ALL
        SELECT [T].[Id], [T].[ParentId]
        FROM [Tasks] AS [T]
        JOIN [TaskWithAllChildTasks] AS [TC] ON ([T].[ParentId] = [TC].[Id])
    )
    SELECT ' ' AS ' ', [Id], [ParentId] FROM [TaskWithAllChildTasks];
    -- DELETE FROM Tasks
    -- WHERE Id IN (SELECT Id FROM TaskWithAllChildTasks);";
