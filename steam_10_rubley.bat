echo netplwiz -- create user xitriy with password 123456
echo win+L    -- login as new created user xitriy
echo win+L    -- go back to main account

echo copy C:\steam\steam.exe -> C:\_xitriy\steam.exe
echo create bat:



@ECHO OFF
SETLOCAL EnableExtensions
SET konkyrent=steam.exe
FOR /F %%x IN ('tasklist /NH /FI "IMAGENAME eq %konkyrent%"') DO IF %%x == %konkyrent% (
  GOTO Running
) ELSE (
  GOTO NotRunning
)


:Running
ECHO %konkyrent% is Running
pause
GOTO End

:NotRunning
runas /user:lop /SAVECRED "G:\_lop\steam.exe"
GOTO End

:End


