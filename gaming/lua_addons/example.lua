function pog_OnEvent(self, event,...)
	print(2)

	local name, _ = UnitName("player")

	print(name)

	if (name == "me") then
		print(3)
		FocusFrame:SetPoint("BOTTOM",nil,"BOTTOM",340,200)
		PlayerFrame:SetPoint("BOTTOM",nil,"BOTTOM",-115,200)
		TargetFrame:SetPoint("TOPLEFT", PlayerFrame, "TOPLEFT", 265, 0)
	end
end

local executiveFrame = CreateFrame("Frame", "pog_ExecutiveFrame")
executiveFrame:SetScript("OnEvent", pog_OnEvent)
executiveFrame:RegisterEvent("VARIABLES_LOADED")
-- executiveFrame:RegisterEvent("PLAYER_LOGIN")
-- executiveFrame:RegisterEvent("PLAYER_ENTERING_WORLD")

-- by Foximys
CTT=CreateFrame("Frame")CTT:SetParent(TargetFrame)CTT:SetPoint("Left",TargetFrame,-30,5)CTT:SetSize(25,25)CTT.t=CTT:CreateTexture(nil,BORDER)CTT.t:SetAllPoints()CTT.t:SetTexture("Interface\\Icons\\ABILITY_DUALWIELD")CTT:Hide()
local  function FrameOnUpdate(self) if UnitAffectingCombat("target") then  self:Show() else self:Hide() end end local g = CreateFrame("Frame")  g:SetScript("OnUpdate", function(self) FrameOnUpdate(CTT) end)
CFT=CreateFrame("Frame")CFT:SetParent(FocusFrame)CFT:SetPoint("Left",FocusFrame,-30,5)CFT:SetSize(25,25)CFT.t=CFT:CreateTexture(nil,BORDER)CFT.t:SetAllPoints()CFT.t:SetTexture("Interface\\Icons\\ABILITY_DUALWIELD")CFT:Hide()
local  function FrameOnUpdate(self) if UnitAffectingCombat("focus") then  self:Show() else self:Hide() end end local g = CreateFrame("Frame")  g:SetScript("OnUpdate", function(self) FrameOnUpdate(CFT) end)






print(1)

-- С чего начать или "построение аддона"
-- https://forum.wowcircle.net/showthread.php?t=397475
