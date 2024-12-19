echo netplwiz -- create user xitriy with password 123456
echo win+L    -- login as new created user xitriy
echo win+L    -- go back to main account

echo copy C:\steam\steam.exe -> C:\_xitriy\steam.exe
echo create bat:
runas /user:xitriy /SAVECRED "C:\_xitriy\steam.exe"
