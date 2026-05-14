/castsequence Поиск трав, Поиск минералов




+/run if not THO then local f,t,c=CreateFrame("Frame","THO"),1,0 f:SetScript("OnUpdate", function(_, e) c=c+e if c>3 then c=0 SetTracking(t) if t==1 then t=2 else t=1 end end end) THO:Hide() end 
+/run if THO:IsVisible() then THO:Hide() else THO:Show() end






+/run local f=AuG or CreateFrame("Frame","AuG") f.m,f.t=1,0 f:SetScript("OnUpdate",function(s,e) f.t=f.t+e if f.t>2.5 and not InCombatLockdown() then f.t=0 f.m=3-f.m SetTracking(f.m) end end) f:Show()


