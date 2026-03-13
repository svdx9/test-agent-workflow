---
name: solidjs-webapp-styles
description: >
  Apply consistent styling rules when building or modifying any UI in this SolidJS + Tailwind webapp.
  Use this skill whenever the user asks to build a component, style a page, create a layout, fix
  a visual issue, or write any SolidJS JSX. Triggers on: "build a component", "style this",
  "create a page", "add a button", "make it look like", "update the UI", or any frontend task.
---

# SolidJS + Tailwind Styling Guide

## Stack
- **Framework**: SolidJS (use `createSignal`, `createMemo`, `For`, `Show` — NOT React hooks)
- **Styling**: Tailwind CSS utility classes only — no inline styles, no CSS modules, no styled-components
- **Component files**: `.tsx` extension, default exports

## Design Tokens

Replace the placeholder values below with your actual design decisions.

### Colors
```
Primary:      [e.g. bg-indigo-600 / text-indigo-600]
Primary hover:[e.g. hover:bg-indigo-700]
Surface:      [e.g. bg-white / bg-zinc-900 for dark]
Background:   [e.g. bg-zinc-50 / bg-zinc-950 for dark]
Border:       [e.g. border-zinc-200 / border-zinc-800 for dark]
Text primary: [e.g. text-zinc-900 / text-zinc-50 for dark]
Text muted:   [e.g. text-zinc-500]
Danger:       [e.g. bg-red-600]
Success:      [e.g. bg-emerald-600]
```

### Typography
```
Page title:   text-2xl font-semibold tracking-tight
Section title:text-lg font-medium
Body:         text-sm text-zinc-700
Muted/caption:text-xs text-zinc-500
Code:         font-mono text-sm
```

### Spacing & Layout
```
Page padding: px-6 py-8 (or max-w-5xl mx-auto px-4)
Card padding: p-4 or p-6
Stack gap:    space-y-4 (vertical), gap-4 (grid/flex)
```

### Borders & Radius
```
Card:         rounded-xl border border-zinc-200
Input:        rounded-lg border border-zinc-300
Button:       rounded-lg
Pill/badge:   rounded-full
```

## Component Patterns

### Button
```tsx
// Primary
<button type="button" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
  Label
</button>

// Secondary / ghost
<button type="button" class="px-4 py-2 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-sm font-medium rounded-lg transition-colors">
  Label
</button>

// Danger
<button type="button" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
  Delete
</button>
```

### Input / Form Field
```tsx
<div class="flex flex-col gap-1.5">
  <label for="example-input" class="text-sm font-medium text-zinc-700">Label</label>
  <input
    id="example-input"
    class="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    placeholder="..."
  />
</div>
```

### Card
```tsx
<div class="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
  {/* content */}
</div>
```

### Badge / Pill
```tsx
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
  Label
</span>
```

## SolidJS-Specific Rules

- Use `<For each={items()}>` not `.map()` for reactive lists
- Use `<Show when={condition()}>` not ternaries for conditional rendering
- Signals are called as functions: `count()` not `count`
- Avoid spreading props onto DOM elements unless using `splitProps`
- Prefer `createMemo` for derived values, not recomputing in JSX

```tsx
// ✅ Correct SolidJS
const [items, setItems] = createSignal<string[]>([]);

<For each={items()}>
  {(item) => <li class="text-sm text-zinc-700">{item}</li>}
</For>

// ❌ Wrong (React pattern)
{items().map(item => <li>{item}</li>)}
```

## Rules

1. **Tailwind only** — never write `style={{}}` or external CSS
2. **Consistent tokens** — always use the color/spacing values from the Design Tokens section above
3. **Dark mode** — if the app supports dark mode, always include `dark:` variants
4. **Accessibility** — buttons need `type` attribute, inputs need `id`/`for` pairs, interactive elements need focus rings
5. **Transitions** — add `transition-colors` or `transition-all duration-150` to interactive elements
6. **No magic numbers** — use Tailwind's scale (p-4, not p-[17px]) unless absolutely necessary

## File Conventions
```
src/
  components/     # Reusable UI components (Button.tsx, Card.tsx, etc.)
  pages/          # Route-level components
  layouts/        # Wrapper layouts
```

---

> **Note for Claude**: When the user hasn't specified colors yet, use the placeholder comments
> as prompts to ask them, or make reasonable neutral defaults (zinc/slate scale + indigo accent)
> and note what you assumed.
