# 🎯 Quick Reference Guide

## Theme Toggle & Language Switcher Locations

### 📍 Location 1: Login Page (Before Authentication)
```
┌─────────────────────────────────────────────────┐
│                                   [🌐 EN ▼] [☀️] │ ← Top-Right Corner
│                                                  │
│   AGRI-NEURAL TWIN                              │
│   THE GOOGLE MAPS FOR FARMERS                   │
│                                                  │
│   [Login Form Area]                             │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 📍 Location 2: Main Dashboard (After Login)
```
┌─────────────────────────────────────────────────┐
│ ⬅ STATE MAP  |  District: [Vellore ▼]  [🌐 EN ▼] [☀️] │ ← TopBar
├─────────────────────────────────────────────────┤
│ Sidebar  │  Dashboard Content                   │
│ • Dash   │                                       │
│ • Analytics                                     │
│ • Reports│  [Cards, Maps, Charts]               │
│ • Settings                                      │
│          │                                       │
└─────────────────────────────────────────────────┘
```

### 📍 Location 3: Settings Page (Advanced Control)
```
┌─────────────────────────────────────────────────┐
│  SETTINGS // SYSTEM CONFIG                      │
│                                                  │
│  INTERFACE PREFERENCES                          │
│  ┌──────────────────────────────────────────┐  │
│  │ Theme Mode         [🌙 Dark] [☀️ Light] │  │
│  ├──────────────────────────────────────────┤  │
│  │ High Contrast      [ON] / [OFF]          │  │
│  ├──────────────────────────────────────────┤  │
│  │ Language           [English ▼]            │  │
│  │                    • English              │  │
│  │                    • தமிழ்                 │  │
│  │                    • తెలుగు                 │  │
│  │                    • ಕನ್ನಡ                 │  │
│  │                    • മലയാളം                │  │
│  │                    • اردو                  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 🔄 How It Works

### Theme Toggle Behavior
1. **Click Sun (☀️)**: Switch to Light Mode
   - Entire app becomes light-themed
   - Button changes to Moon (🌙)
   
2. **Click Moon (🌙)**: Switch to Dark Mode
   - Entire app becomes dark-themed
   - Button changes to Sun (☀️)

3. **Auto-Save**: Preference saved instantly
4. **Persistent**: Works across sessions

### Language Selector Behavior
1. **Click Globe (🌐)**
2. Select your preferred language
3. Entire UI translates instantly
4. All pages update (Login, Dashboard, Settings, Reports, etc.)
5. Preference saved for next visit

---

## 🌈 Theme Comparison

### Dark Mode (Default)
```
Background: Deep Navy Blue (#0F172A)
Panels: Darker Blue (#1E293B)
Text: Light Gray (#F1F5F9)
Accent: Emerald Green (#10B981)
Perfect for: Night use, reducing eye strain
```

### Light Mode
```
Background: Off-White (#F8FAFC)
Panels: Pure White (#FFFFFF)
Text: Dark Gray (#0F172A)
Accent: Forest Green (#059669)
Perfect for: Bright environments, printing
```

---

## 📱 Language Support

### Fully Supported (Professional Translations)
- ✅ **English** - Complete
- ✅ **Tamil (தமிழ்)** - Complete

### Technically Ready (English Placeholders)
- 🔄 **Telugu (తెలుగు)** - Needs translation
- 🔄 **Kannada (ಕನ್ನಡ)** - Needs translation  
- 🔄 **Malayalam (മലയാളം)** - Needs translation
- 🔄 **Urdu (اردو)** - Needs translation

*Note: These 4 languages work without errors, but show English text until professionally translated.*

---

## 🎮 User Flow Examples

### Example 1: Farmer Wants Light Mode in Tamil
1. Open app (Login page)
2. Click **☀️** button → Light mode ON
3. Click **🌐** → Select "தமிழ்"
4. Login with credentials
5. **Result**: App is now in Light Mode + Tamil

### Example 2: Officer Wants Dark Mode in English
1. Open app (Login page)
2. Already in Dark mode (default) ✓
3. Already in English (default) ✓
4. Login
5. **Result**: No changes needed!

### Example 3: User Switches Mid-Session
1. Already logged in
2. Working in Dashboard
3. Click **🌙** → Switches to Dark mode
4. Click **🌐** → Select "తెలుగు"
5. **Result**: Instant update, no page reload

---

## ⚡ Performance Notes

- **Theme Switch**: < 100ms (instant)
- **Language Switch**: < 200ms (near-instant)
- **No Page Reload**: Everything uses React state
- **Persistent Storage**: localStorage (< 5KB total)

---

## 🔧 Technical Implementation

### Components
```javascript
// Theme Toggle
<ThemeToggle /> // Located in TopBar + Login

// Language Switcher
<LanguageSwitcher /> // Located in TopBar + Login
```

### State Management
```javascript
// Theme
localStorage.getItem('appTheme') // 'dark' | 'light'
document.body.setAttribute('data-theme', theme)

// Language
localStorage.getItem('appLanguage') // 'en' | 'ta' | 'te' | etc.
i18n.changeLanguage(code)
```

---

**Last Updated**: February 14, 2026  
**Version**: 2.1.0
