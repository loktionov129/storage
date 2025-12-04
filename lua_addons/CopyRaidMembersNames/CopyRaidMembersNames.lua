SLASH_CRMN1 = "/crmn"

function GetNames()
    local unit, numMembers, names

    if IsInRaid() then
        unit = "raid"
        numMembers = GetNumRaidMembers()
        names = ""
    elseif IsInGroup() then
        unit = "party"
        numMembers = GetNumPartyMembers()
        names = UnitName("player") .. "\n"
    else
        print("Вы не состоите в группе или рейде")
    end
    
    for i = 1, numMembers do
      names = names .. UnitName(unit .. i) .. "\n"
    end
    return string.gsub(names, "\n$", "")
end

SlashCmdList["CRMN"] = function(msg)
    if not IsInRaid() and not IsInGroup() then
        print("Вы не состоите в группе или рейде")
    elseif rcbf and rcbf:IsVisible() then
        rcbf:Hide()
        rcbfEditBox:Hide()
    else
        rcbf = rcbf or CreateFrame("Frame", "rcbf", UIParent)
        rcbf:SetSize(1024, 769)
        rcbf:SetPoint("CENTER")
        rcbf:SetMovable(true)
        rcbf:EnableMouse(true)
        rcbf:RegisterForDrag("LeftButton") 
        rcbf:SetScript("OnDragStart", rcbf.StartMoving)
        rcbf:SetScript("OnDragStop", rcbf.StopMovingOrSizing)
        
        rcbfEditBox = rcbfEditBox or CreateFrame("EditBox", "rcbfEditBox", rcbf, "InputBoxTemplate")
        rcbfEditBox:SetMultiLine(true)
        rcbfEditBox:SetSize(180, 100)
        rcbfEditBox:SetPoint("CENTER")
        rcbfEditBox:SetText(GetNames())
        rcbfEditBox:Show()
        rcbfEditBox:SetFocus()
        rcbf:Show()
        
        rcbfCloseButton = CreateFrame("Button", "rcbfCloseButton", rcbf, "UIPanelButtonTemplate")
        rcbfCloseButton:SetSize(50, 25)
        rcbfCloseButton:SetPoint("CENTER", UIParent, "CENTER", 120, 0)
        rcbfCloseButton:SetText("CLOSE")
        rcbfCloseButton:RegisterForClicks("AnyUp")
        rcbfCloseButton:SetScript("OnClick", function(self, button, down)
            if not down then
            rcbfEditBox:Hide()
            rcbf:Hide()
            end
        end)
    end
end
