net stop w32time
w32tm /unregister
w32tm /register
sc triggerinfo w32time start/networkon stop/networkoff
net start w32time
w32tm /resync
