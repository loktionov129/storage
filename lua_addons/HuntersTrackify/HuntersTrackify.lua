local function L(key)
    local locale = GetLocale()
    local localeTable = _G["HuntersTrackify_Locales"][locale]
    if localeTable and localeTable[key] then
        return localeTable[key]
    end
    
    local fallbackTable = _G["HuntersTrackify_Locales"]["enUS"]
    return fallbackTable and fallbackTable[key] or key
end

local function GetTrackingIndexForCreatureType(creatureType)
    local wantedTrackingName = L(creatureType)
    if not wantedTrackingName then
        return nil
    end
    
    for i = 1, GetNumTrackingTypes() do
        local name, texture, active, category = GetTrackingInfo(i)
        if name == wantedTrackingName then
            return i
        end
    end
    
    return nil
end

local function ChangeTracking(unit)
    local creatureType = UnitCreatureType(unit)
    if not creatureType then
        return
    end
    
    local trackingIndex = GetTrackingIndexForCreatureType(creatureType)
    if not trackingIndex then
        return
    end
    
    local currentTexture = GetTrackingTexture()
    local name, texture, active, category = GetTrackingInfo(trackingIndex)
    if not active or texture ~= currentTexture then
        SetTracking(trackingIndex)
    end
end

local frame = CreateFrame("Frame")
frame:RegisterEvent("PLAYER_TARGET_CHANGED")
frame:SetScript("OnEvent", function(self, event, ...)
    local _, englishClass = UnitClass("player")
    if englishClass ~= "HUNTER" then
        self:UnregisterEvent("PLAYER_TARGET_CHANGED")
    end

    if event == "PLAYER_TARGET_CHANGED" then
        ChangeTracking("target")
    end
end)
