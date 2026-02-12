# AutoApply AI - Design System

## Brand Overview
AutoApply AI is a yacht crew job application automation tool that combines nautical professionalism with modern AI efficiency.

---

## Color Palette

### Primary Colors (Nautical Blue)
```
--navy-900: #0A1628    /* Deep ocean - Primary text, headers */
--navy-800: #1A2B4A    /* Deep navy - Secondary backgrounds */
--navy-700: #2A4060    /* Medium navy - Cards, containers */
--navy-600: #3D5A80    /* Azure blue - Primary actions */
--navy-500: #4A6FA5    /* Steel blue - Hover states */
```

### Secondary Colors (Ocean Accents)
```
--ocean-500: #00A8E8   /* Bright cyan - Active states, highlights */
--ocean-400: #22B8E8   /* Sky blue - Secondary accents */
--ocean-300: #5CC8E8   /* Light cyan - Backgrounds */
--ocean-200: #A8E0F0   /* Pale blue - Subtle backgrounds */
--ocean-100: #E0F4FA   /* Ice blue - Tertiary backgrounds */
```

### Accent Colors (Gold/Brass - Yacht Luxury)
```
--gold-500: #C9A227    /* Brass gold - Premium highlights, CTAs */
--gold-400: #D9B73A    /* Light gold - Hover states */
--gold-300: #E8C94C    /* Bright gold - Active states */
--gold-100: #F5E6B3    /* Pale gold - Subtle highlights */
```

### Semantic Colors
```
--success-500: #10B981 /* Green - Success, hired, approved */
--warning-500: #F59E0B /* Amber - Pending, attention */
--error-500: #EF4444   /* Red - Errors, rejected */
--info-500: #3B82F6    /* Blue - Information */
```

### Neutral Colors
```
--gray-900: #111827    /* Primary text */
--gray-700: #374151    /* Secondary text */
--gray-500: #6B7280    /* Muted text, borders */
--gray-300: #D1D5DB    /* Light borders */
--gray-100: #F3F4F6    /* Light backgrounds */
--white: #FFFFFF       /* Pure white */
```

---

## Typography

### Font Families
```
--font-heading: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
--font-mono: 'JetBrains Mono', 'Fira Code', monospace
```

### Type Scale

| Name | Size | Weight | Line-Height | Letter-Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| Display | 4rem (64px) | 800 | 1.1 | -0.02em | Hero headlines |
| H1 | 2.5rem (40px) | 700 | 1.2 | -0.02em | Page titles |
| H2 | 2rem (32px) | 700 | 1.25 | -0.01em | Section titles |
| H3 | 1.5rem (24px) | 600 | 1.3 | 0 | Card titles |
| H4 | 1.25rem (20px) | 600 | 1.4 | 0 | Subsection |
| Body Large | 1.125rem (18px) | 400 | 1.6 | 0 | Lead paragraphs |
| Body | 1rem (16px) | 400 | 1.6 | 0 | Default text |
| Body Small | 0.875rem (14px) | 400 | 1.5 | 0 | Secondary text |
| Caption | 0.75rem (12px) | 500 | 1.4 | 0.01em | Labels, badges |

---

## Spacing System

### Base Unit: 4px
```
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
--space-20: 5rem     /* 80px */
--space-24: 6rem     /* 96px */
```

### Section Padding
```
--section-py: 5rem        /* Vertical section padding */
--section-px-mobile: 1rem /* Mobile horizontal padding */
--section-px-desktop: 2rem /* Desktop horizontal padding */
```

---

## Border & Radius

```
--radius-sm: 0.25rem    /* 4px - Inputs, small elements */
--radius-md: 0.5rem     /* 8px - Buttons, cards */
--radius-lg: 0.75rem    /* 12px - Larger cards */
--radius-xl: 1rem       /* 16px - Modals, containers */
--radius-2xl: 1.5rem    /* 24px - Feature cards */
--radius-full: 9999px   /* Full rounded - Pills, avatars */
```

---

## Shadows

```
--shadow-sm: 0 1px 2px 0 rgba(10, 22, 40, 0.05)
--shadow-md: 0 4px 6px -1px rgba(10, 22, 40, 0.1), 0 2px 4px -2px rgba(10, 22, 40, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(10, 22, 40, 0.1), 0 4px 6px -4px rgba(10, 22, 40, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(10, 22, 40, 0.1), 0 8px 10px -6px rgba(10, 22, 40, 0.1)
--shadow-glow: 0 0 20px rgba(0, 168, 232, 0.3)
--shadow-gold: 0 0 20px rgba(201, 162, 39, 0.3)
```

---

## Grid System

### Breakpoints
```
--bp-sm: 640px   /* Mobile landscape */
--bp-md: 768px   /* Tablet */
--bp-lg: 1024px  /* Desktop */
--bp-xl: 1280px  /* Large desktop */
--bp-2xl: 1536px /* Extra large */
```

### Container Max Widths
```
--container-sm: 640px
--container-md: 768px
--container-lg: 1024px
--container-xl: 1200px
--container-full: 100%
```

### Grid Columns
- Mobile: 4 columns
- Tablet: 8 columns
- Desktop: 12 columns

Gutter: 24px (desktop), 16px (mobile)

---

## Animation & Transitions

### Durations
```
--duration-fast: 150ms
--duration-normal: 250ms
--duration-slow: 350ms
--duration-slower: 500ms
```

### Easings
```
--ease-default: cubic-bezier(0.4, 0, 0.2, 1)
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Standard Transitions
```css
transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
transition: transform 350ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
transition: opacity 250ms ease-out;
```

---

## Z-Index Scale

```
--z-base: 0
--z-dropdown: 100
--z-sticky: 200
--z-fixed: 300
--z-modal-backdrop: 400
--z-modal: 500
--z-popover: 600
--z-tooltip: 700
--z-toast: 800
```

---

## Iconography

### Icon Set: Lucide Icons
- Size sm: 16px
- Size md: 20px
- Size lg: 24px
- Size xl: 32px

### Common Icons
- Navigation: Home, Briefcase, FileText, User, Settings
- Actions: Plus, Edit, Trash2, Check, X, ChevronDown
- Status: CheckCircle, AlertCircle, Clock, XCircle
- Yacht-specific: Anchor, Ship, Compass, Waves

---

## Accessibility

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--ocean-500);
  outline-offset: 2px;
}
```

### Color Contrast
- All text meets WCAG 2.1 AA standards
- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Dark Mode (Future)

```
--bg-primary-dark: #0A1628
--bg-secondary-dark: #1A2B4A
--text-primary-dark: #F3F4F6
--text-secondary-dark: #9CA3AF
```
