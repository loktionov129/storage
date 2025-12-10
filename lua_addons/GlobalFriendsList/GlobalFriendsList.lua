-- Создаем главный фрейм аддона
local frame = CreateFrame("Frame", "FriendSyncFrame", UIParent)

-- Инициализация глобальной таблицы
GlobalFriendsList = GlobalFriendsList or {}

-- Текущий персонаж
local currentCharacter = UnitName("player")

-- Конфигурация
local CONFIG = {
    WINDOW_WIDTH = 320,
    WINDOW_HEIGHT = 450,
    FRIEND_ENTRY_HEIGHT = 30,
    MAX_FRIENDS_DISPLAYED = 50
}

-- Создаем фрейм для окна со списком друзей
local friendFrame = CreateFrame("Frame", "FriendSyncListFrame", UIParent)
friendFrame:SetSize(CONFIG.WINDOW_WIDTH, CONFIG.WINDOW_HEIGHT)
friendFrame:SetPoint("CENTER")
friendFrame:SetMovable(true)
friendFrame:EnableMouse(true)
friendFrame:RegisterForDrag("LeftButton")
friendFrame:SetScript("OnDragStart", friendFrame.StartMoving)
friendFrame:SetScript("OnDragStop", friendFrame.StopMovingOrSizing)
friendFrame:SetFrameStrata("HIGH")

-- Настраиваем фон фрейма
friendFrame:SetBackdrop({
    bgFile = "Interface\\DialogFrame\\UI-DialogBox-Background",
    edgeFile = "Interface\\DialogFrame\\UI-DialogBox-Border",
    tile = true,
    tileSize = 32,
    edgeSize = 32,
    insets = { left = 11, right = 12, top = 12, bottom = 11 }
})

-- Создаем заголовок
local titleBg = CreateFrame("Frame", nil, friendFrame)
titleBg:SetPoint("TOP", friendFrame, "TOP", 0, 12)
titleBg:SetSize(CONFIG.WINDOW_WIDTH - 20, 40)
titleBg:SetBackdrop({
    bgFile = "Interface\\DialogFrame\\UI-DialogBox-Header",
    tile = false,
    tileSize = 0
})

-- Создаем текст заголовка
friendFrame.titleText = titleBg:CreateFontString(nil, "OVERLAY", "GameFontHighlight")
friendFrame.titleText:SetPoint("CENTER", titleBg, "CENTER", 0, 8)
friendFrame.titleText:SetText("Global Friends List")

-- Кнопка закрытия
local closeButton = CreateFrame("Button", nil, friendFrame, "UIPanelCloseButton")
closeButton:SetPoint("TOPRIGHT", friendFrame, "TOPRIGHT", -5, -5)
closeButton:SetScript("OnClick", function() friendFrame:Hide() end)

-- Создаем выпадающий список
local dropdown = CreateFrame("Frame", "FriendSyncDropdown", friendFrame, "UIDropDownMenuTemplate")
dropdown:SetPoint("TOP", titleBg, "BOTTOM", 0, -5)
UIDropDownMenu_SetWidth(dropdown, 180)
UIDropDownMenu_SetText(dropdown, "Выберите персонажа")

-- Создаем область прокрутки
local scrollFrame = CreateFrame("ScrollFrame", "$parent_DF", friendFrame, "UIPanelScrollFrameTemplate")
scrollFrame:SetPoint("TOPLEFT", friendFrame, "TOPLEFT", 10, -60)
scrollFrame:SetPoint("BOTTOMRIGHT", friendFrame, "BOTTOMRIGHT", -30, 10)

local function hasFriend(name)
    local currentUnit = UnitName("player")
    local table = GlobalFriendsList[currentUnit]
    for i = 1, #table do
        if table[i].name == name then return true end
    end
    return false
end

-- Создаем фрейм для контента
local contentFrame = CreateFrame("Frame")
scrollFrame:SetScrollChild(contentFrame)
contentFrame:SetWidth(scrollFrame:GetWidth())
contentFrame:SetHeight(1)

-- Вспомогательные функции
local function GetSortedCharacterList()
    local characters = {}
    for characterName in pairs(GlobalFriendsList) do
        table.insert(characters, characterName)
    end
    table.sort(characters)
    return characters
end

-- Функция для обновления списка друзей
local function UpdateFriendList()
    contentFrame.friendButtons = contentFrame.friendButtons or {}
    
    -- Очищаем предыдущий список
    for i = 1, #contentFrame.friendButtons do
        contentFrame.friendButtons[i]:Hide()
    end

    if not GlobalFriendsList[currentCharacter] or #GlobalFriendsList[currentCharacter] == 0 then
        contentFrame:SetHeight(30)
        if not contentFrame.messageText then
            contentFrame.messageText = contentFrame:CreateFontString(nil, "OVERLAY", "GameFontNormal")
            contentFrame.messageText:SetPoint("CENTER", contentFrame, "CENTER", 0, 0)
            contentFrame.messageText:SetTextColor(0.8, 0.8, 0.8)
        end
        contentFrame.messageText:SetText("Нет данных для "..currentCharacter)
        contentFrame.messageText:Show()
        return
    end
    
    if contentFrame.messageText then
        contentFrame.messageText:Hide()
    end
    
    local friendsData = GlobalFriendsList[currentCharacter]
    local numFriends = math.min(#friendsData, CONFIG.MAX_FRIENDS_DISPLAYED)
    
    
    -- Устанавливаем высоту контента
    contentFrame:SetHeight(numFriends * CONFIG.FRIEND_ENTRY_HEIGHT)
    
    for i = 1, numFriends do
        local friendData = friendsData[i]
        contentFrame.friendButtons[i] = CreateFrame("Frame", nil, contentFrame)
        contentFrame.friendButtons[i]:SetSize(contentFrame:GetWidth(), CONFIG.FRIEND_ENTRY_HEIGHT)
        
        -- Фон для чередования цветов
        contentFrame.friendButtons[i].bg = contentFrame.friendButtons[i]:CreateTexture(nil, "BACKGROUND")
        contentFrame.friendButtons[i].bg:SetAllPoints()
        contentFrame.friendButtons[i].bg:SetAlpha(0.1)
        
        -- Чекбокс
        contentFrame.friendButtons[i].checkbox = CreateFrame("CheckButton", nil, contentFrame.friendButtons[i], "UICheckButtonTemplate")
        contentFrame.friendButtons[i].checkbox:SetSize(24, 24)
        contentFrame.friendButtons[i].checkbox:SetChecked(hasFriend(friendData.name))
        contentFrame.friendButtons[i].checkbox:SetPoint("LEFT", 5, 0)
        contentFrame.friendButtons[i].checkbox:SetScript("OnClick", function(self)
            if self:GetChecked() then
                AddFriend(friendData.name, friendData.note)
            else
                RemoveFriend(friendData.name, friendData.note)
            end
        end)
        
        -- Текст имени друга
        contentFrame.friendButtons[i].nameText = contentFrame.friendButtons[i]:CreateFontString(nil, "OVERLAY", "GameFontNormal")
        contentFrame.friendButtons[i].nameText:SetPoint("LEFT", 30, 0)
        contentFrame.friendButtons[i].nameText:SetJustifyH("LEFT")
        
        -- Текст заметки
        contentFrame.friendButtons[i].noteText = contentFrame.friendButtons[i]:CreateFontString(nil, "OVERLAY", "GameFontNormalSmall")
        contentFrame.friendButtons[i].noteText:SetPoint("RIGHT", -10, 0)
        contentFrame.friendButtons[i].noteText:SetJustifyH("RIGHT")
        contentFrame.friendButtons[i].noteText:SetTextColor(0.8, 0.8, 0.8)
        
        local friendButton = contentFrame.friendButtons[i]
        friendButton:ClearAllPoints()
        friendButton:SetPoint("TOP", contentFrame, "TOP", 0, -(i-1) * CONFIG.FRIEND_ENTRY_HEIGHT)
        
        -- Устанавливаем текст
        friendButton.nameText:SetText(friendData.name or "Неизвестно")
        
        -- Показываем заметку если она есть
        if friendData.note and friendData.note ~= "" then
            friendButton.noteText:SetText(friendData.note)
            friendButton.noteText:Show()
        else
            friendButton.noteText:Hide()
        end
        
        friendButton:Show()
    end
end

-- Функция инициализации выпадающего меню
local function InitializeDropdown(self, level)
    if not GlobalFriendsList or not next(GlobalFriendsList) then
        local info = UIDropDownMenu_CreateInfo()
        info.text = "Нет данных"
        info.disabled = true
        UIDropDownMenu_AddButton(info)
        return
    end

    local info = UIDropDownMenu_CreateInfo()
    local characters = GetSortedCharacterList()
    
    for _, characterName in ipairs(characters) do
        info.text = characterName
        info.func = function() 
            UIDropDownMenu_SetText(dropdown, characterName)
            currentCharacter = characterName
            UpdateFriendList()
        end
        info.checked = (characterName == currentCharacter)
        UIDropDownMenu_AddButton(info)
    end
end

-- Функция для показа/скрытия окна
local function ToggleFriendWindow()
    if friendFrame:IsShown() then
        friendFrame:Hide()
    else
        friendFrame:Show()
        UIDropDownMenu_Initialize(dropdown, InitializeDropdown)
        UIDropDownMenu_SetText(dropdown, currentCharacter)
        UpdateFriendList()
    end
end

-- Регистрируем команды
SLASH_GFL1 = "/gfl"
SLASH_GFL2 = "/friendsync"
SlashCmdList["GFL"] = function(msg)
    ToggleFriendWindow()
end

-- Сохраняем друзей при входе в мир
local function SaveFriendsList()
    local characterName = UnitName("player")
    GlobalFriendsList = GlobalFriendsList or {}
    GlobalFriendsList[characterName] = {}
    
    local numFriends = GetNumFriends() or 0
    for i = 1, numFriends do
        local name, level, class, area, connected, status, note = GetFriendInfo(i)
        table.insert(GlobalFriendsList[characterName], {
            name = name,
            note = note or ""
        })
    end
end

-- Регистрируем события
frame:RegisterEvent("FRIENDLIST_UPDATE")
frame:RegisterEvent("PLAYER_ENTERING_WORLD")

frame:SetScript("OnEvent", function(self, event, ...)
    if event == "FRIENDLIST_UPDATE" or event == "PLAYER_ENTERING_WORLD" then
        SaveFriendsList()
        if friendFrame:IsShown() then
            UIDropDownMenu_Initialize(dropdown, InitializeDropdown)
            UpdateFriendList()
        end
    end
end)

-- Инициализация
contentFrame.friendButtons = {}
friendFrame:Hide()

print("FriendSync загружен! Используйте команду /gfl или /friendsync для просмотра списка друзей.")
