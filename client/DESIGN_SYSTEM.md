# Design System

## 1) Overview

This document serves as the **single source of truth** for styling in this repository. It documents the current implementation exactly as it exists.

**Rule: Use tokens + primitives first.**

Before writing custom Tailwind classes, check if:

- A design token exists in `tailwind.config.cjs`
- A UI primitive exists in `src/components/ui/`

UI Primitives location: [`src/components/ui/`](src/components/ui/)

### Visual parity (not pixel-perfect)

Goal is **design-faithful**, not pixel-perfect.


---

## 2) Tokens

### Colors

#### `colors.ui.*`

| Token             | Value                   | Intended Usage                               | Tailwind Examples       |
| ----------------- | ----------------------- | -------------------------------------------- | ----------------------- |
| `ui.glass`        | `rgba(255,255,255,0.1)` | Background for glass morphism effects        | `bg-ui-glass`           |
| `ui.overlay`      | `rgba(0,0,0,0.75)`      | Dark overlay backgrounds, button backgrounds | `bg-ui-overlay`         |
| `ui.border`       | `#d0d5dd`               | Standard border color                        | `border-ui-border`      |
| `ui.card`         | `rgba(104,104,104,0.2)` | Solid card backgrounds                       | `bg-ui-card`            |
| `ui.input`        | `#524974`               | Default input/textarea background            | `bg-ui-input`           |
| `ui.inputSubtle`  | `#574a7b`               | Subtle input/textarea background             | `bg-ui-inputSubtle`     |
| `ui.glassBorder`  | `rgba(255,255,255,0.1)` | Border for glass morphism elements           | `border-ui-glassBorder` |
| `ui.loginOverlay` | `rgba(95,82,178,0.45)`  | Login page background overlay                | `bg-ui-loginOverlay`    |

**Usage examples:**

```tsx
// Glass effect background
<div className="bg-ui-glass border-ui-glassBorder">...</div>

// Dark overlay
<div className="bg-ui-overlay">...</div>

// Input styling
<input className="bg-ui-input border-ui-glassBorder" />
```

#### `colors.design.*`

| Token               | Value                      | Intended Usage                                                       | Tailwind Examples      |
| ------------------- | -------------------------- | -------------------------------------------------------------------- | ---------------------- |
| `design.background` | `rgba(144, 126, 173, 0.4)` | Page background overlay                                              | `bg-design-background` |
| `design.text`       | `#FFFFFF`                  | Primary text color                                                   | `text-design-text`     |
| `design.button`     | `rgba(0, 0, 0, 0.75)`      | Button background (note: Button primitive uses `ui.overlay` instead) | `bg-design-button`     |

**Usage examples:**

```tsx
// Background overlay
<div className="bg-design-background">...</div>

// Text color
<p className="text-design-text">...</p>
```

### Radii

| Token             | Value  | Tailwind Class    |
| ----------------- | ------ | ----------------- |
| `rounded-card`    | `16px` | `rounded-card`    |
| `rounded-pill`    | `60px` | `rounded-pill`    |
| `rounded-pill-sm` | `50px` | `rounded-pill-sm` |

**Usage examples:**

```tsx
// Card corners
<div className="rounded-card">...</div>

// Pill-shaped buttons
<button className="rounded-pill">...</button>
```

### Border Width

| Token         | Value   | Tailwind Class |
| ------------- | ------- | -------------- |
| `border-thin` | `1.5px` | `border-thin`  |

**Usage example:**

```tsx
<div className="border-thin border-ui-glassBorder">...</div>
```

### Blur

| Token                 | Value    | Tailwind Class        |
| --------------------- | -------- | --------------------- |
| `backdrop-blur-glass` | `7.5px`  | `backdrop-blur-glass` |
| `backdrop-blur-hero`  | `17.5px` | `backdrop-blur-hero`  |

**Usage example:**

```tsx
<div className="bg-ui-glass backdrop-blur-glass">...</div>
```

---

## 3) Typography

All typography should use the `<Typography>` primitive from `src/components/ui/Typography.tsx`.

### Variants

#### `h1`

- **Font family:** Poppins
- **Size:** 48px (`text-h1`)
- **Weight:** Bold (700)
- **Letter spacing:** -0.02em
- **Line height:** 1.2
- **Commonly used as:** `h1`
- **When to use:** Main page headings, hero titles
- **Example:**

```tsx
<Typography variant="h1">Main Heading</Typography>
```

#### `h2`

- **Font family:** Poppins
- **Size:** 32px (`text-h2`)
- **Weight:** Semibold (600)
- **Letter spacing:** -0.01em
- **Line height:** 1.2
- **Commonly used as:** `h2`
- **When to use:** Section headings, card titles
- **Example:**

```tsx
<Typography variant="h2">Section Title</Typography>
```

#### `body`

- **Font family:** Manrope
- **Size:** 24px (`text-body`)
- **Weight:** Semibold (600)
- **Letter spacing:** 0.12em
- **Line height:** 1.2
- **Commonly used as:** `p`
- **When to use:** Body text, paragraphs
- **Example:**

```tsx
<Typography variant="body">Body text content</Typography>
```

#### `n1`

- **Font family:** Manrope
- **Size:** 20px (`text-n1`)
- **Weight:** Medium (500)
- **Letter spacing:** 0.12em
- **Line height:** 1.2
- **Commonly used as:** `p`
- **When to use:** Notes, secondary text
- **Example:**

```tsx
<Typography variant="n1">Note text</Typography>
```

#### `label`

- **Font family:** Poppins
- **Size:** 14px (`text-sm`)
- **Weight:** Medium (500)
- **Letter spacing:** Default
- **Line height:** Default
- **Commonly used as:** `label` (for real form labels) or `p`/`span` (for non-form labels)
- **When to use:** Form labels, small labels
- **Example:**

```tsx
// For real form labels (with htmlFor)
<Typography variant="label" as="label" htmlFor="email">
  Email Address
</Typography>

// For non-form labels (use as="p" or as="span")
<Typography variant="label" as="p">
  Section Label
</Typography>
```

#### `caption`

- **Font family:** Poppins
- **Size:** 14px (`text-sm`)
- **Weight:** Normal (400)
- **Letter spacing:** Default
- **Line height:** Default
- **Commonly used as:** `p`
- **When to use:** Captions, small descriptive text
- **Example:**

```tsx
<Typography variant="caption">Caption text</Typography>
```

**Note:** Typography variants do not include responsive behavior. Add responsive classes via `className` prop if needed.

**Guidance on `as` prop:**

- Use `as="label"` + `htmlFor` only for real form labels that are semantically connected to an input
- For non-form labels or decorative text, use `as="p"` or `as="span"` instead

---

## 4) UI Primitives

All primitives are located in `src/components/ui/` and exported from `src/components/ui/index.ts`.

### Button

**Location:** `src/components/ui/Button.tsx`

**Variants:**

- `primary` - Dark overlay background (`bg-ui-overlay`), white text
- `outline` - Transparent background with border (`border-ui-border`)
- `ghost` - Transparent background, hover effect

**Sizes:**

- `sm` - Height: 36px (h-9)
- `md` - Height: 48px (h-12) - default
- `lg` - Height: 56px (h-14)
- `xl` - Height: 82px (h-[82px])

**Props:**

- `variant?: 'primary' | 'outline' | 'ghost'` (default: `'primary'`)
- `size?: 'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`)
- `leftIcon?: ReactNode` - Icon on the left
- `rightIcon?: ReactNode` - Icon on the right
- `fullWidth?: boolean` - Makes button full width
- Standard button props (onClick, disabled, type, etc.)

**Examples:**

```tsx
// Primary button
<Button variant="primary" size="md">Click me</Button>

// Button with icon
<Button variant="primary" leftIcon={<Icon />}>
  Submit
</Button>

// Full width button
<Button variant="primary" fullWidth>Submit</Button>

// Outline button
<Button variant="outline">Cancel</Button>
```

### Card

**Location:** `src/components/ui/Card.tsx`

**Variants:**

- `glass` - Glass morphism effect (`bg-ui-glass`, `border-ui-glassBorder`, `backdrop-blur-glass`) - default
- `solid` - Solid background (`bg-ui-card`)

**Padding:**

- `sm` - 16px (p-4)
- `md` - 24px (p-6) - default
- `lg` - 32px (p-8)

**Props:**

- `variant?: 'glass' | 'solid'` (default: `'glass'`)
- `padding?: 'sm' | 'md' | 'lg'` (default: `'md'`)
- Standard div props (className, children, etc.)

**Examples:**

```tsx
// Glass card
<Card variant="glass" padding="md">
  <Typography variant="h2">Card Title</Typography>
  <Typography variant="body">Card content</Typography>
</Card>

// Solid card
<Card variant="solid" padding="lg">
  Content here
</Card>
```

### Input

**Location:** `src/components/ui/Input.tsx`

**Variants:**

- `default` - Uses `bg-ui-input` (#524974)
- `subtle` - Uses `bg-ui-inputSubtle` (#574a7b)

**Error behavior:**

- When `error={true}`, border changes to `border-error` (red)
- When `error={false}` or undefined, uses `border-ui-glassBorder`

**Props:**

- `variant?: 'default' | 'subtle'` (default: `'default'`)
- `error?: boolean` - Shows error border state
- Standard input props (value, onChange, placeholder, disabled, etc.)

**Base styling:**

- `rounded-[8px]`
- `border-thin`
- `text-white`
- `placeholder:text-white/70`
- `focus:outline-none focus:ring-0`
- `disabled:opacity-50 disabled:cursor-not-allowed`

**Examples:**

```tsx
// Default input
<Input variant="default" placeholder="Enter text..." />

// Input with error
<Input variant="default" error placeholder="Invalid input" />

// Subtle input
<Input variant="subtle" placeholder="Enter text..." />
```

### Textarea

**Location:** `src/components/ui/Textarea.tsx`

**Variants:**

- `default` - Uses `bg-ui-input` (#524974)
- `subtle` - Uses `bg-ui-inputSubtle` (#574a7b)

**Error behavior:**

- When `error={true}`, border changes to `border-error` (red)
- When `error={false}` or undefined, uses `border-ui-glassBorder`

**Props:**

- `variant?: 'default' | 'subtle'` (default: `'default'`)
- `error?: boolean` - Shows error border state
- Standard textarea props (value, onChange, placeholder, disabled, rows, etc.)

**Base styling:**

- `resize-none` (default, cannot be resized)
- `rounded-[8px]`
- `border-thin`
- `text-white`
- `placeholder:text-white/70`
- `focus:outline-none focus:ring-0`
- `disabled:opacity-50 disabled:cursor-not-allowed`

**Examples:**

```tsx
// Default textarea
<Textarea variant="default" rows={4} placeholder="Enter text..." />

// Textarea with error
<Textarea variant="default" error rows={4} placeholder="Invalid input" />

// Subtle textarea
<Textarea variant="subtle" rows={4} placeholder="Enter text..." />
```

---

## 5) Copy-Paste Recipes

Common patterns using primitives (not raw Tailwind).

**Note:** Adjust import paths based on your current file location. If using path aliases (e.g., `@/components/ui`), use those; otherwise use relative imports.

### Glass Card Wrapper

```tsx
// If using path alias:
import { Card, Typography } from "@/components/ui";
// Otherwise, adjust relative path:
// import { Card, Typography } from "../components/ui";

<Card variant="glass" padding="md">
  <Typography variant="h2">Title</Typography>
  <Typography variant="body">Content here</Typography>
</Card>;
```

### Primary CTA Button with Icon

```tsx
// If using path alias:
import { Button } from "@/components/ui";
// Otherwise, adjust relative path:
// import { Button } from "../components/ui";

<Button variant="primary" size="md" leftIcon={<ArrowIcon />}>
  Get Started
</Button>;
```

### Label + Input + Error Message Pattern

```tsx
// If using path alias:
import { Typography, Input } from "@/components/ui";
// Otherwise, adjust relative path:
// import { Typography, Input } from "../components/ui";

<div>
  <Typography variant="label" as="label" htmlFor="email" className="mb-2 block">
    Email Address
  </Typography>
  <Input
    id="email"
    variant="default"
    error={!!error}
    placeholder="Enter email..."
  />
  {error && (
    <Typography variant="caption" className="text-error mt-2">
      {error}
    </Typography>
  )}
</div>;
```

### Modal Card Pattern

Modal cards in this codebase use custom gradients and shadows. See `FeedbackModal.tsx` for the modal pattern:

```tsx
// Modal uses custom gradient background (not a primitive)
<div
  className="rounded-card h-[500px] w-[500px] overflow-hidden shadow-[0px_24px_60px_0px_rgba(0,0,0,0.25)]"
  style={{
    backgroundImage:
      "linear-gradient(135deg, rgba(42, 37, 88, 0.95) 0%, rgba(169, 109, 206, 0.9) 100%)",
  }}
>
  {/* Modal content */}
</div>
```

### Empty State Card Pattern

Empty states use custom styling. See `PublicFeed.tsx` for the empty state pattern:

```tsx
// Empty state uses custom dashed border and positioning
<div className="rounded-card relative h-[336px] w-[336px] overflow-hidden">
  {/* Empty state content with custom styling */}
</div>
```

---

## 6) Rules

### Prefer Tokens Over Raw Values

**Do:**

```tsx
<div className="bg-ui-glass border-ui-glassBorder">...</div>
```

**Don't:**

```tsx
<div className="border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.1)]">
  ...
</div>
```

**Exception:** If a border color differs from tokens (e.g., `rgba(255,255,255,0.2)` vs `rgba(255,255,255,0.1)`), keep the raw value in className to preserve visual differences.

### Layout Classes Stay Local

Layout classes (flex, grid, padding, margin, positioning) belong in component files, not in primitives.

**Do:**

```tsx
// In component
<div className="flex items-center gap-4">
  <Button variant="primary">Submit</Button>
</div>
```

**Don't:**

```tsx
// Don't add layout props to Button primitive
<Button variant="primary" flex gap={4}>
  Submit
</Button>
```

### Patterns Should Become Tokens/Props

If a styling pattern is **reused across 2+ components or appears 3–4 times**, consider:

1. Adding a token to `tailwind.config.cjs`
2. Adding a prop/variant to a primitive
3. Creating a new primitive

**Example:** If `rgba(255,255,255,0.2)` appears in multiple components, add `ui.borderSubtle` token.

**Note on `ui.glass` vs `ui.glassBorder`:**
Both tokens share the same value (`rgba(255,255,255,0.1)`) but represent different semantic intent:

- `ui.glass` is for **backgrounds** (glass morphism effect)
- `ui.glassBorder` is for **borders** (glass element borders)

Use the appropriate token based on context, not just the value.

### Allowed One-Offs

These patterns are allowed as one-offs and should be documented near their usage:

- **Gradients:** Custom gradient backgrounds (e.g., modal gradients in `FeedbackModal.tsx`)
- **Unique shadows:** Complex shadow values (e.g., card shadows in `PublicFeed.tsx`)
- **Animation containers:** Framer Motion containers with custom transitions

Document these in component comments, not in the design system.

### Visual parity (not pixel-perfect)

Goal is **design-faithful**, not pixel-perfect.

We optimize for:
- consistent spacing/typography via tokens + primitives
- responsive behavior and accessibility
- maintainability (no copy/paste class spam)

Acceptable tolerances:
- small spacing differences (≈1–4px) if the component remains visually consistent
- minor font rendering differences across browsers
- layout changes that improve responsiveness (avoid fixed absolute positioning unless required)

Pixel-perfect is required only for:
- hero/landing “marketing” sections in the primary viewport
- key branded components (e.g., the main CTA button) when explicitly requested


---

## 7) Where to Change Things Globally

### Tokens

**Location:** `tailwind.config.cjs`

Edit `theme.extend` to modify:

- Colors (`colors.ui.*`, `colors.design.*`)
- Border radius (`borderRadius.*`)
- Border width (`borderWidth.*`)
- Backdrop blur (`backdropBlur.*`)
- Font families (`fontFamily.*`)
- Font sizes (`fontSize.*`)

**Example:**

```js
// tailwind.config.cjs
theme: {
  extend: {
    colors: {
      ui: {
        glass: 'rgba(255,255,255,0.1)', // Change here
        // ...
      }
    }
  }
}
```

### Primitives

**Location:** `src/components/ui/*.tsx`

Edit primitive components to:

- Add new variants
- Modify existing variant styles
- Add new props
- Change default values

**Example:**

```tsx
// src/components/ui/Button.tsx
const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-ui-overlay text-white hover:opacity-90", // Change here
  // ...
};
```

### One-Offs

**Location:** Individual component files

Custom styling that doesn't fit tokens/primitives:

- Gradients (inline styles or className)
- Unique shadows
- Animation containers
- Component-specific layouts

Keep these in the component file where they're used, not in the design system.

---

## Summary

- **Tokens first:** Check `tailwind.config.cjs` before using raw values
- **Primitives second:** Use `src/components/ui/` components before custom styling
- **Layout local:** Keep flex/grid/positioning in components
- **Patterns become tokens:** If it repeats, tokenize it
- **One-offs are OK:** Gradients, unique shadows, animations can be custom
