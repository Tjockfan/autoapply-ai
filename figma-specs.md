# AutoApply AI - Figma Design Specifications

## Project Overview
**Product:** AutoApply AI - Yacht Crew Job Application Automation Platform  
**Design Style:** Nautical Professional + Modern AI Tech  
**Target Audience:** Yacht crew professionals (deckhands, stewards, engineers, chefs)

---

## Figma File Structure

```
📁 AutoApply AI Design System
├── 📄 Cover
├── 📁 01 - Design Tokens
│   ├── Colors
│   ├── Typography
│   ├── Shadows
│   └── Spacing
├── 📁 02 - Components
│   ├── Buttons
│   ├── Inputs
│   ├── Cards
│   ├── Badges
│   ├── Navigation
│   └── Icons
├── 📁 03 - Layouts
│   ├── Landing Page
│   ├── Dashboard
│   ├── Profile
│   └── Mobile Views
└── 📁 04 - Assets
    ├── Illustrations
    └── Icon Library
```

---

## Design Tokens

### Color Palette (Figma Variables)

#### Primary (Nautical Blue)
```
navy-900: #0A1628 (Primary text, dark backgrounds)
navy-800: #1A2B4A (Secondary backgrounds)
navy-700: #2A4060 (Card backgrounds)
navy-600: #3D5A80 (Primary buttons, links)
navy-500: #4A6FA5 (Secondary buttons, hover states)
```

#### Accent (Ocean)
```
ocean-500: #00A8E8 (Primary accent, highlights)
ocean-400: #22B8E8 (Secondary accent)
ocean-300: #5CC8E8 (Light backgrounds)
ocean-200: #A8E0F0 (Subtle backgrounds)
ocean-100: #E0F4FA (Tertiary backgrounds)
```

#### Premium (Gold)
```
gold-500: #C9A227 (CTA buttons, premium highlights)
gold-400: #D9B73A (Hover states)
gold-300: #E8C94C (Active states)
gold-100: #F5E6B3 (Subtle highlights)
```

#### Semantic
```
success-500: #10B981
warning-500: #F59E0B
error-500: #EF4444
info-500: #3B82F6
```

#### Neutral (Gray Scale)
```
gray-900: #111827
gray-700: #374151
gray-500: #6B7280
gray-300: #D1D5DB
gray-100: #F3F4F6
gray-50: #F9FAFB
white: #FFFFFF
```

### Typography (Figma Text Styles)

**Font Family:** Inter (Google Fonts)

| Style Name | Size | Weight | Line Height | Letter Spacing |
|------------|------|--------|-------------|----------------|
| Display | 64px | 800 | 110% | -2% |
| H1 | 40px | 700 | 120% | -2% |
| H2 | 32px | 700 | 125% | -1% |
| H3 | 24px | 600 | 130% | 0% |
| H4 | 20px | 600 | 140% | 0% |
| Body Large | 18px | 400 | 160% | 0% |
| Body | 16px | 400 | 160% | 0% |
| Body Small | 14px | 400 | 150% | 0% |
| Caption | 12px | 500 | 140% | 1% |
| Button | 14px | 600 | 100% | 0% |

### Spacing (Figma Grid)

**Base Unit:** 4px  
**Grid System:** 12-column, 24px gutter (desktop), 16px (mobile)

| Token | Value |
|-------|-------|
| space-1 | 4px |
| space-2 | 8px |
| space-3 | 12px |
| space-4 | 16px |
| space-6 | 24px |
| space-8 | 32px |
| space-12 | 48px |
| space-16 | 64px |
| space-20 | 80px |
| space-24 | 96px |

### Border Radius

| Token | Value |
|-------|-------|
| radius-sm | 4px |
| radius-md | 8px |
| radius-lg | 12px |
| radius-xl | 16px |
| radius-2xl | 24px |
| radius-full | 9999px |

### Shadows (Figma Effects)

```
shadow-sm: 0 1px 2px 0 rgba(10, 22, 40, 0.05)
shadow-md: 0 4px 6px -1px rgba(10, 22, 40, 0.1), 0 2px 4px -2px rgba(10, 22, 40, 0.1)
shadow-lg: 0 10px 15px -3px rgba(10, 22, 40, 0.1), 0 4px 6px -4px rgba(10, 22, 40, 0.1)
shadow-glow: 0 0 20px rgba(0, 168, 232, 0.3)
shadow-gold: 0 0 20px rgba(201, 162, 39, 0.3)
```

---

## Component Specifications

### Buttons

#### Primary Button
- **Height:** 44px (default), 36px (small), 52px (large)
- **Padding:** 0 24px
- **Background:** Linear gradient 135° (#3D5A80 → #00A8E8)
- **Text:** White, 14px, 600 weight
- **Border Radius:** 8px
- **Shadow:** shadow-md
- **Hover:** translateY(-2px), shadow-lg + glow
- **Icon:** 16px, gap 8px

#### Gold CTA Button
- **Background:** Linear gradient 135° (#C9A227 → #D9B73A)
- **Text:** #0A1628, 14px, 600 weight
- **Shadow:** shadow-md
- **Hover:** translateY(-2px), shadow-lg + gold-glow

#### Secondary Button
- **Background:** White
- **Border:** 1px solid #D1D5DB
- **Text:** #3D5A80, 14px, 600 weight
- **Hover:** Background #F3F4F6, Border #3D5A80

#### Ghost Button
- **Background:** Transparent
- **Text:** #6B7280, 14px, 600 weight
- **Hover:** Background #F3F4F6

### Inputs

#### Text Input
- **Height:** 44px
- **Padding:** 12px 16px
- **Border:** 1px solid #D1D5DB
- **Border Radius:** 8px
- **Font:** 15px, regular
- **Placeholder:** #9CA3AF
- **Focus:** Border #00A8E8, Box shadow 0 0 0 3px rgba(0,168,232,0.1)
- **Error:** Border #EF4444
- **Success:** Border #10B981

#### Input with Icon
- **Icon Size:** 20px
- **Icon Color:** #9CA3AF
- **Left Padding:** 44px (includes icon)

### Cards

#### Default Card
- **Background:** White
- **Border:** 1px solid #E5E7EB
- **Border Radius:** 12px
- **Padding:** 24px
- **Shadow:** None (default), shadow-md (hover)

#### Feature Card
- **Background:** #F3F4F6
- **Border:** 1px solid transparent
- **Border Radius:** 16px
- **Padding:** 32px
- **Hover:** Border #A8E0F0, translateY(-4px), shadow-lg

#### Job Card
- **Layout:** Flex column
- **Padding:** 20px
- **Company Logo:** 44px circle
- **Title:** 16px, 600 weight
- **Meta:** 14px, #6B7280
- **Tags:** 12px, 500 weight, 50px border-radius

### Badges

#### Status Badge
- **Padding:** 4px 12px
- **Border Radius:** 50px
- **Font:** 12px, 600 weight
- **Variants:**
  - Blue: bg #E0F4FA, text #3D5A80
  - Green: bg #D1FAE5, text #10B981
  - Gold: bg #F5E6B3, text #92400E
  - Red: bg #FEE2E2, text #EF4444

#### With Dot
- **Dot:** 6px circle
- **Gap:** 6px
- **Colors:** Green (#10B981), Yellow (#F59E0B), Red (#EF4444)

### Navigation

#### Sidebar Navigation
- **Width:** 260px
- **Background:** White
- **Border Right:** 1px solid #E5E7EB
- **Item Height:** 44px
- **Item Padding:** 12px 16px
- **Active:** bg #E0F4FA, text #3D5A80
- **Hover:** bg #F3F4F6

#### Top Navigation
- **Height:** 72px
- **Background:** White
- **Border Bottom:** 1px solid #E5E7EB
- **Logo:** 40px icon + text

#### Tabs
- **Container:** bg #F3F4F6, padding 4px, border-radius 10px
- **Tab:** padding 10px 20px, border-radius 8px
- **Active:** bg White, text #3D5A80, shadow-sm
- **Inactive:** text #6B7280

### Icons

**Icon Set:** Lucide Icons  
**Sizes:** 16px (sm), 20px (md), 24px (lg), 32px (xl)

**Key Icons:**
- Navigation: Home, Briefcase, FileText, User, Settings
- Actions: Plus, Edit, Trash2, Check, X, ChevronDown
- Status: CheckCircle, AlertCircle, Clock, XCircle
- Yacht-specific: Anchor, Ship, Compass, Waves

---

## Page Specifications

### Landing Page

#### Hero Section
- **Height:** 100vh minimum
- **Background:** Linear gradient 180° (#0A1628 → #1A2B4A)
- **Overlay:** Radial gradients at 20% 80% and 80% 20%
- **Content:** Centered, max-width 600px
- **Headline:** 64px, gradient text (ocean → gold)
- **Subhead:** 18px, rgba(255,255,255,0.7)
- **CTA:** Gold button primary, ghost button secondary
- **Stats:** 3-column grid, 32px gap

#### Features Section
- **Padding:** 96px vertical
- **Grid:** 4 columns (desktop), 2 columns (tablet), 1 column (mobile)
- **Gap:** 24px
- **Cards:** Feature card style

#### Pricing Section
- **Grid:** 3 columns
- **Featured Card:** Scale 1.02, gold border, dark background
- **Badge:** Absolute positioned top -12px

### Dashboard

#### Layout
- **Sidebar:** Fixed, 260px width
- **Main:** margin-left 260px
- **Header:** Sticky, 72px height

#### Stats Cards
- **Grid:** 4 columns (desktop), 2 columns (tablet)
- **Card:** Flex row, icon left, content right
- **Icon:** 48px circle, colored background

#### Job Cards
- **Grid:** 2 columns
- **Company Logo:** 44px, rounded 10px
- **Match Score:** Progress bar + percentage

#### Application Tracker
- **List:** Single column
- **Item:** Flex row, icon + content + date
- **Status Icon:** 40px rounded square

### Mobile Adaptations

#### Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1023px
- **Desktop:** 1024px+

#### Mobile Navigation
- **Sidebar:** Slide-out drawer
- **Hamburger:** 24px, top left
- **Bottom Nav:** Fixed, 5 icons

---

## Asset Requirements

### Illustrations
- Hero dashboard preview (SVG/CSS)
- Feature icons (48px, gradient backgrounds)
- Empty states (SVG)
- Loading animations (Lottie)

### Icons
- Lucide Icons (entire set)
- Custom yacht icons: Anchor, Ship, Compass
- Social icons: Twitter, LinkedIn, Instagram

### Images
- Hero background (optional, subtle)
- Team photos (About page)
- Yacht imagery (Career pages)

---

## Animation Specifications

### Micro-interactions

#### Button Hover
```
Duration: 200ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Transform: translateY(-2px)
Shadow: Increase depth
```

#### Card Hover
```
Duration: 300ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Transform: translateY(-4px)
Border: Color change to ocean-200
Shadow: shadow-lg
```

#### Page Transitions
```
Duration: 350ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Fade: Opacity 0 → 1
Slide: translateY(20px) → translateY(0)
```

#### Loading States
```
Spinner: 750ms linear infinite
Skeleton: Pulse animation, 1.5s ease-in-out infinite
Progress: 300ms ease-out
```

---

## Accessibility (WCAG 2.1 AA)

### Color Contrast
- All text: minimum 4.5:1 ratio
- Large text: minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio

### Focus States
```css
:focus-visible {
  outline: 2px solid #00A8E8;
  outline-offset: 2px;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Export Settings

### Figma Export
- **Icons:** SVG, 24x24px viewbox
- **Illustrations:** SVG or 2x PNG
- **Components:** As Figma components with variants
- **Spacing:** Redline annotations

### Developer Handoff
- Zeplin or Figma Dev Mode
- Color tokens as CSS variables
- Typography as CSS classes
- Component documentation

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-12 | Initial design system |

---

## File Locations

All mockups available at:
- `/autoapply-ai/landing-page.html` - Landing page mockup
- `/autoapply-ai/dashboard.html` - Dashboard mockup  
- `/autoapply-ai/components.html` - Component library
- `/autoapply-ai/design-system.md` - Full design tokens
