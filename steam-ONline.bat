### firewall (windows defender with advanced security)
### -> New outbound rule wizard 
### -> provide path to steam.exe 
### -> block the connection 
### -> all checkboxex 
### -> Name="Steamshare"

netsh advfirewall firewall set rule name="Steamshare" new enable=no

pause
