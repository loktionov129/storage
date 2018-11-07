DROP TABLE IF EXISTS [dbo].[Accounts];

CREATE TABLE [dbo].[Accounts] (
    [Id]         INT          IDENTITY (1, 1) NOT NULL,
    [CardNumber] VARCHAR (16) NOT NULL,
    [UserName]   VARCHAR (50) NOT NULL,
    [Balance]    MONEY        NOT NULL CHECK ([Balance] >= 0)
);

INSERT INTO [dbo].[Accounts]
([CardNumber], [UserName], [Balance]) VALUES
('11111111', 'Alex', 0),
('22222222', 'Tom', 400);


SELECT * FROM [dbo].[Accounts];

BEGIN TRANSACTION;  

BEGIN TRY
	UPDATE [dbo].[Accounts]
	SET [Balance] = [Balance] + 500
	WHERE [UserName] IN ('Alex');

	UPDATE [dbo].[Accounts]
	SET [Balance] = [Balance] - 500
	WHERE [UserName] IN ('Tom');
END TRY  
BEGIN CATCH  
    SELECT   
        ERROR_NUMBER() AS ErrorNumber  
        ,ERROR_SEVERITY() AS ErrorSeverity  
        ,ERROR_STATE() AS ErrorState  
        ,ERROR_PROCEDURE() AS ErrorProcedure  
        ,ERROR_LINE() AS ErrorLine  
        ,ERROR_MESSAGE() AS ErrorMessage;  

    IF @@TRANCOUNT > 0  
        ROLLBACK TRANSACTION;  
END CATCH;  

IF @@TRANCOUNT > 0  
    COMMIT TRANSACTION;  

SELECT * FROM [dbo].[Accounts];
