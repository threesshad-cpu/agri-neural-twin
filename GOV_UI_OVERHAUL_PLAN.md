# 🏛️ Government UI Overhaul - Implementation Plan

## Overview
Transform Agri-Neural Twin from cyber/dark theme to professional Tamil Nadu Government portal aesthetic.

---

## Phase 1: Foundation & Global Controls ⚙️

### 1.1 Global Toolbar Component
**File:** `src/components/GlobalToolbar.jsx`
- Language switcher (EN/TA with flags)
- Font size controls (A-, A, A+)
- Dark/Light mode toggle
- Clean government-style design

### 1.2 Official Header Component
**File:** `src/components/OfficialHeader.jsx`
- TNS Emblem (left)
- Title: "Tamil Nadu Agriculture Portal" / "தமிழ்நாடு வேளாண் போர்டல்"
- G20 & StartupTN logos (right)
- Clean white background with subtle shadow

### 1.3 Theme System Overhaul
**File:** `src/index.css`
- **Light Mode (Default):**
  - Background: #FFFFFF
  - Secondary BG: #F3F4F6
  - Borders: #E5E7EB
  - Text: #1F2937
  - Primary: #1E40AF (Government Blue)
  - Accent: #059669 (Agricultural Green)

- **Dark Mode (Optional):**
  - Background: #1F2937
  - Secondary: #374151
  - Borders: #4B5563
  - Text: #F9FAFB

### 1.4 Typography System
**Fonts to Add:**
- English: 'Inter', sans-serif
- Tamil: 'Arima', serif OR 'Mukta Malar'
- Fallback: system-ui

---

## Phase 2: Component Redesign 🎨

### 2.1 Sidebar
**File:** `src/components/Sidebar.jsx`
- Light grey background (#F3F4F6)
- Blue active state (#1E40AF)
- Clean icons + text labels
- Subtle hover effects
- Clean dividers between sections

### 2.2 Dashboard Cards
**Refactor:** `src/components/DashboardContent.jsx`
- White cards with subtle border
- Box shadow: `0 1px 3px rgba(0,0,0,0.1)`
- Clean spacing
- Government-style iconography
- Table layouts instead of flex grids

### 2.3 Data Tables
**New Component:** `src/components/DataTable.jsx`
- Strict alignment (like government reports)
- Zebra striping (alternate row colors)
- Header with dark blue background
- Sortable columns
- Pagination controls

### 2.4 Forms & Inputs
**Style Updates:**
- Clean borders (#D1D5DB)
- Focus: Blue outline (#1E40AF)
- Labels above inputs
- Helper text in grey
- Validation states (green/red)

---

## Phase 3: Accessibility (WCAG 2.1) ♿

### 3.1 Color Contrast
- Text: 4.5:1 minimum ratio
- Large text: 3:1 minimum
- Interactive elements: 3:1

### 3.2 ARIA Labels
- All buttons have `aria-label`
- Form inputs have `aria-describedby`
- Navigation landmarks
- Live regions for dynamic content

### 3.3 Keyboard Navigation
- Tab order logical
- Focus indicators visible
- Skip to main content link
- Escape to close modals

---

## Phase 4: Internationalization 🌐

### 4.1 Component Updates
- Replace all hardcoded text with `t('key')`
- Update locale files with government-style language
- Ensure Tamil font loads properly
- RTL support verification

### 4.2 New Translation Keys
```json
{
  "official": {
    "tn_govt": "Government of Tamil Nadu",
    "tn_govt_ta": "தமிழ்நாடு அரசு",
    "agri_portal": "Agriculture Portal",
    "increase_font": "Increase Font Size",
    "decrease_font": "Decrease Font Size",
    "light_mode": "Light Mode",
    "dark_mode": "Dark Mode"
  }
}
```

---

## Phase 5: New Components to Create 📦

1. **GlobalToolbar.jsx** - Top utility bar
2. **OfficialHeader.jsx** - Government header
3. **DataTable.jsx** - Professional table component
4. **StatCard.jsx** - Government-style stat display
5. **FontSizeControl.jsx** - A-/A/A+ buttons
6. **BreadcrumbNav.jsx** - Navigation breadcrumbs

---

## File Structure Changes

```
src/
├── components/
│   ├── gov/                    # NEW FOLDER
│   │   ├── GlobalToolbar.jsx
│   │   ├── OfficialHeader.jsx
│   │   ├── DataTable.jsx
│   │   ├── StatCard.jsx
│   │   └── FontSizeControl.jsx
│   ├── Sidebar.jsx            # REDESIGN
│   ├── DashboardContent.jsx   # REDESIGN
│   └── ...
├── styles/
│   ├── government.css         # NEW
│   └── accessibility.css      # NEW
├── assets/
│   ├── logos/
│   │   ├── tns-emblem.svg
│   │   ├── g20-logo.svg
│   │   └── startuptn-logo.svg
└── context/
    └── FontSizeContext.jsx    # NEW
```

---

## Implementation Order

### Week 1: Foundation
- [ ] Create GlobalToolbar component
- [ ] Create OfficialHeader component
- [ ] Update CSS theme to light-first
- [ ] Add Inter & Arima fonts
- [ ] Create FontSizeContext

### Week 2: Components
- [ ] Redesign Sidebar
- [ ] Redesign Dashboard cards
- [ ] Create DataTable component
- [ ] Update all forms

### Week 3: Polish & Accessibility
- [ ] Add ARIA labels everywhere
- [ ] Test keyboard navigation
- [ ] Color contrast audit
- [ ] Screen reader testing

### Week 4: Testing & Refinement
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Final QA

---

## Design References

### Colors
```css
/* Government Blue */
--gov-blue-50: #EFF6FF;
--gov-blue-600: #1E40AF;
--gov-blue-700: #1E3A8A;

/* Agricultural Green */
--agri-green-50: #F0FDF4;
--agri-green-600: #059669;
--agri-green-700: #047857;

/* Neutrals */
--grey-50: #F9FAFB;
--grey-100: #F3F4F6;
--grey-200: #E5E7EB;
--grey-300: #D1D5DB;
--grey-700: #374151;
--grey-900: #1F2937;
```

### Typography Scale
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

---

## Success Criteria ✅

- [ ] Looks indistinguishable from tn.gov.in
- [ ] WCAG 2.1 AA compliant
- [ ] All text translates (EN/TA)
- [ ] Font sizing works globally
- [ ] Dark mode toggle preserves state
- [ ] Professional, trustworthy appearance
- [ ] Fast load times (<2s)
- [ ] Works on IE11+ (if required)

---

**Status:** Ready to implement
**Priority:** High
**Estimated Time:** 3-4 weeks
