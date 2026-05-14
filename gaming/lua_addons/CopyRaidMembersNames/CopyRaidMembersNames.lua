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

function ShowNamesFrame()
    if backdrop then
        rcbf.Text:SetText(GetNames())
    end
    
    backdrop = {
        bgFile = "Interface/BUTTONS/WHITE8X8",
        edgeFile = "Interface/GLUES/Common/Glue-Tooltip-Border",
        tile = true,
        edgeSize = 8,
        tileSize = 8,
        insets = {
            left = 5,
            right = 5,
            top = 5,
            bottom = 5,
        },
    }
     
    rcbf = CreateFrame("Frame", "MyScrollMessageTextFrame", UIParent)
    rcbf:SetSize(150, 150)
    rcbf:SetPoint("CENTER")
    rcbf:SetFrameStrata("BACKGROUND")
    rcbf:SetBackdrop(backdrop)
    rcbf:SetBackdropColor(0, 0, 0)
    rcbf.Close = CreateFrame("Button", "$parentClose", rcbf)
    rcbf.Close:SetSize(24, 24)
    rcbf.Close:SetPoint("TOPRIGHT")
    rcbf.Close:SetNormalTexture("Interface/Buttons/UI-Panel-MinimizeButton-Up")
    rcbf.Close:SetPushedTexture("Interface/Buttons/UI-Panel-MinimizeButton-Down")
    rcbf.Close:SetHighlightTexture("Interface/Buttons/UI-Panel-MinimizeButton-Highlight", "ADD")
    rcbf.Close:SetScript("OnClick", function(self)
        self:GetParent():Hide()
    end)

    rcbf.Select = CreateFrame("Button", "$parentSelect", rcbf, "UIPanelButtonTemplate")
    rcbf.Select:SetSize(14, 14)
    rcbf.Select:SetPoint("RIGHT", rcbf.Close, "LEFT")
    rcbf.Select:SetText("Se")
    rcbf.Select:SetScript("OnClick", function(self)
        self:GetParent().Text:HighlightText()
        self:GetParent().Text:SetFocus()
    end)
     
    rcbf.SF = CreateFrame("ScrollFrame", "$parent_DF", rcbf, "UIPanelScrollFrameTemplate")
    rcbf.SF:SetPoint("TOPLEFT", rcbf, 12, -30)
    rcbf.SF:SetPoint("BOTTOMRIGHT", rcbf, -30, 10)
    rcbf.Text = CreateFrame("EditBox", nil, rcbf)
    rcbf.Text:SetMultiLine(true)
    rcbf.Text:SetSize(180, 170)
    rcbf.Text:SetPoint("TOPLEFT", rcbf.SF)
    rcbf.Text:SetPoint("BOTTOMRIGHT", rcbf.SF)
    rcbf.Text:SetMaxLetters(99999)
    rcbf.Text:SetFontObject(GameFontNormal)
    rcbf.Text:SetAutoFocus(false)
    rcbf.Text:SetScript("OnEscapePressed", function(self) self:ClearFocus() end) 
    rcbf.SF:SetScrollChild(rcbf.Text)
     
    rcbf.Text:SetText(GetNames())
end

SlashCmdList["CRMN"] = function(msg)
    if not IsInRaid() and not IsInGroup() then
        print("Вы не состоите в группе или рейде")
    elseif rcbf and rcbf:IsVisible() then
        rcbf:Hide()
    else
        ShowNamesFrame()
    end
end
