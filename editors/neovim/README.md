# 🗺️ Neovim: Роадмап, Материалы и Настройка

Репозиторий для изучения Neovim с нуля и создания универсальной конфигурации на Lua под **Arch Linux** и **Windows**.

- 2024 [https://www.youtube.com/watch?v=MS9ZAQTMpKg&list=LL&index=5&t=16s](https://www.youtube.com/watch?v=MS9ZAQTMpKg&list=LL&index=5&t=16s)
- 2025 [https://www.youtube.com/watch?v=LMh9Zr5tJJA&list=LL&index=4&t=4s](https://www.youtube.com/watch?v=LMh9Zr5tJJA&list=LL&index=4&t=4s)
- 2026 [https://www.youtube.com/watch?v=SSf5T8QsBYo&list=LL&index=3&t=16s](https://www.youtube.com/watch?v=SSf5T8QsBYo&list=LL&index=3&t=16s)

## ✨ Особенности будущего конфига
* **Кросплатформенность** — один код для Arch Linux и Windows.
* **Быстрый старт** — производительная сборка на базе менеджера `lazy.nvim`.
* **Полный стек** — поддержка автодополнения (LSP) и подсветки для 12+ языков программирования.

---

## 🛠️ Системные требования

Перед началом настройки убедитесь, что в системе установлены:
* **Neovim** (версии 0.9 или выше).
* **Git** (для клонирования плагинов).
* **Компилятор C/C++** (необходим для сборки парсеров `treesitter`):
  * **Arch Linux:** `sudo pacman -S base-devel` (ставит `gcc` и `make`).
  * **Windows:** `gcc` через MSYS2 / MinGW или Visual Studio Build Tools.
* **Шрифт:** Любой **Nerd Font** (например, *JetBrainsMono Nerd Font*) в терминале для отображения иконок.

---

## 📚 Материалы для изучения

### База и интерактив
* Вбейте в терминале `nvim +Tutor` — официальный встроенный тренажер движений.
* [Vim Cheat Sheet (RU)](https://rtorr.com) — интерактивная шпаргалка по хоткеям и движениям.
* [Kickstart.nvim](https://github.com) — эталонный reference-конфиг в один файл. Изучать его код обязательно.

### Документация и плагины
* [Neovim Lua Guide](https://neovim.io) — официальный гайд по настройке на Lua.
* [Официальный плагин-менеджер lazy.nvim](https://github.com) — стандарт де-факто в экосистеме.

### YouTube каналы
* [ThePrimeagen](https://youtube.com) — амбассадор Neovim. Смотреть плейлист *«Neovim from scratch»*.
* [Typecraft](https://youtube.com) — детальный пошаговый разбор настройки Lua-конфига для новичков.

---

## 💻 Стек языков и компоненты Mason / Treesitter

Для работы автодополнения (IntelliSense) и подсветки синтаксиса в Neovim используются три кита: **Lazy.nvim** (плагины), **Mason** (менеджер серверов) и **Treesitter** (парсер кода).


| Язык | Что ставить в Mason (LSP) | Пакет Treesitter |
| :--- | :--- | :--- |
| **Lua** | `lua_ls` (необходим для самого конфига nvim) | `lua` |
| **C#** | `omnisharp` или `csharp-language-server` | `c_sharp` |
| **TS / JS** | `typescript-language-server` | `typescript`, `javascript` |
| **Python** | `pyright` или `pylsp` | `python` |
| **C / C++** | `clangd` | `c`, `cpp` |
| **Assembler** | `asm_lsp` | `asm` |
| **Rust** | `rust_analyzer` | `rust` |
| **Haskell** | `hls` | `haskell` |
| **F#** | `fsautocomplete` | `fsharp` |
| **HTML / CSS**| `html`, `cssls` | `html`, `css` |

---

## 🚀 Пошаговый план настройки

- [ ] **Шаг 1: Базовые движения.** Пройти `nvim +Tutor`, привыкнуть к `h, j, k, l`, `w, b, e`, `ci"`, `diw`.
- [ ] **Шаг 2: Структура файлов.** Создать `init.lua` и базовые директории.
- [ ] **Шаг 3: Опции.** Настроить табы, отступы, нумерацию строк и системный буфер обмена (`set.opt`).
- [ ] **Шаг 4: Хоткеи.** Создать файл маппингов, переназначить `<Leader>` на `Space` (пробел).
- [ ] **Шаг 5: Плагины.** Поставить и инициализировать `lazy.nvim`.
- [ ] **Шаг 6: Визуал и Поиск.** Накатить `Telescope` (фуззи-файндер) и `nvim-treesitter` (подсветка).
- [ ] **Шаг 7: Интеллект.** Настроить `nvim-lspconfig`, `mason.nvim` и `nvim-cmp` для автодополнения.

---

## 📂 Пути синхронизации конфигурации

Конфиг пишется один раз и копируется в системные папки редактора:

* **Arch Linux:** `~/.config/nvim/`
* **Windows (PowerShell):** `$env:USERPROFILE\AppData\Local\nvim\`

### Пример планируемой структуры папок:
```text
~/.config/nvim/
├── init.lua             # Точка входа
└── lua/
    ├── core/            # Базовые настройки редактора
    │   ├── options.lua  # Настройки Vim (табы, номера строк)
    │   └── remaps.lua   # Горячие клавиши
    └── plugins/         # Конфигурация плагинов
        └── lazy.lua     # Инициализация плагин-менеджера
```

## ⌨️ Персональные горячие клавиши

* `Space` — основной Leader-ключ.
* `шорткат` — описание действия.
