# Design Guidelines: Schedule Automation System

## Design Approach
Hybrid Design System based on Material Design principles, optimized for educational administrative panels (inspired by Canvas, Google Classroom). Focus on clear information hierarchy and tabular data presentation.

## Color Palette

### Primary Colors
```css
--primary-blue: #0B5BD7;    /* buttons, links, active states */
--gold-accent: #F9C846;     /* highlights, achievements */
--background: #F8F9FA;      /* app background */
--card-white: #FFFFFF;      /* cards, panels */
--text-primary: #1A1A1A;    /* primary text */
--text-secondary: #6B7280;  /* secondary text */
--border: #E5E7EB;          /* borders */
```

### Status Colors
```css
--success: #10B981;  --warning: #F59E0B;
--error: #EF4444;    --info: #3B82F6;
```

### Gradients
- Hero: `linear-gradient(135deg, #0B5BD7 0%, #2563EB 100%)`
- Accent: `linear-gradient(135deg, #F9C846 0%, #FBBF24 100%)`

## Typography

**Fonts:**
- Primary: `'Inter', -apple-system, sans-serif`
- Display: `'Manrope', 'Inter', sans-serif` (headings)
- Mono: `'JetBrains Mono', monospace` (time, codes)

**Hierarchy:**
- H1: `text-4xl font-bold` (36px) - page titles
- H2: `text-3xl font-semibold` (30px) - sections
- H3: `text-2xl font-semibold` (24px) - subsections
- H4: `text-xl font-medium` (20px) - cards
- Body: `text-base` (16px) - default
- Small: `text-sm` (14px) - secondary
- Caption: `text-xs` (12px) - labels

## Spacing System
**Units:** `2, 3, 4, 6, 8, 12, 16` (Tailwind)
- Cards: `p-6` (24px)
- Section gaps: `gap-8` (32px)
- Form elements: `space-y-4` (16px)
- Buttons/tags: `px-4 py-2`
- Page containers: `px-6 py-8` (desktop), `px-4 py-6` (mobile)

## Layout Structure

### Navigation
- **Sidebar:** `w-70` (280px), collapsible on mobile
- Active indicator: left blue bar + background
- **Top Bar:** Search, notifications, user profile, logout
- **Breadcrumbs:** Icon-based navigation chain

### Content Area
- Max width: `max-w-7xl mx-auto`
- Cards: `rounded-lg shadow-sm`
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` (stats)

## Core Components

### Buttons
```html
<!-- Primary -->
<button class="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2.5">

<!-- Secondary -->
<button class="border border-gray-300 hover:bg-gray-50 rounded-lg">

<!-- Danger -->
<button class="bg-red-600 hover:bg-red-700 text-white rounded-lg">
```

### Forms
- **Input height:** `h-11`, blue focus border
- **Selects:** Custom arrows, blue accent when open
- **Date/Time Picker:** Highlight working days
- **Checkbox:** Blue with animated checkmark
- **Validation:** Error messages below fields in red

### Tables
- **Schedule Grid:** Days (columns) × Time slots (rows)
- **Striped rows:** `odd:bg-gray-50`
- **Sticky header** with sort/filter
- **Cell padding:** `px-4 py-3`
- **Actions:** Right-aligned icons
- **Mobile:** Horizontal scroll or card view

### Cards
```html
<!-- Lesson Card -->
<div class="bg-white rounded-lg shadow-sm hover:shadow-md p-4">
  <div class="text-lg font-semibold">{subject}</div>
  <div class="text-sm text-gray-600">{teacher}</div>
  <div class="text-sm">{room} • {time}</div>
</div>

<!-- Stats Card -->
<div class="bg-white rounded-lg shadow-sm p-6">
  <div class="text-3xl font-bold text-blue-600">{number}</div>
  <div class="text-sm text-gray-600">{label}</div>
</div>
```

### Modals
- **Backdrop:** `bg-black/50` with blur
- **Container:** `max-w-2xl rounded-xl`
- **Animation:** Scale `0.95 → 1` + opacity
- **Footer:** Actions right-aligned (Cancel + Confirm)

### Notifications
- **Toast:** Top-right, auto-hide 5s, status icon
- **Alert:** Inline with colored left border
- **Loading:** Pulsing skeletons (prefer over spinners)

### Schedule-Specific
- **Time Slot:** Color-coded by subject (generated from name hash)
- **Conflict Indicator:** Red warning icon, details on hover
- **Generation Progress:** Progress bar with percentage + stage label

## Animations (Framer Motion)

**Durations:**
- Micro: `150ms` (hover)
- Standard: `200-300ms` (transitions)
- Complex: `400-500ms` (page loads)

**Key Animations:**
```javascript
// Page entrance
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}

// Modal
initial={{ scale: 0.95, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}

// Hover (buttons/cards)
whileHover={{ scale: 1.02 }}

// Staggered lists
variants={{
  container: { staggerChildren: 0.05 }
}}
```

**Easing:** `ease-out` (entrance), `ease-in-out` (state changes)

## Responsive Design

**Breakpoints:** Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)

**Adaptations:**
- Sidebar: Hidden on mobile (hamburger), visible desktop
- Grids: 1 → 2 → 4 columns
- Spacing: Reduce by 1-2 levels on mobile
- Typography: Decrease heading sizes by 1 level

## Key Pages

### Login
- Centered form on gradient background
- Logo → Login (Full Name) → Password → "Sign In" button
- Error messages below fields

### Dashboard
- **Admin:** Stats cards + generation button + system status
- **Teacher:** Today's schedule
- **Student:** Upcoming lessons list
- Quick actions grid (4 columns desktop)

### Admin - Users
- Table with filters (role, status, name search)
- Modal for create/edit: Role, Last Name, First Name, Patronymic, Password
- Actions: edit, deactivate, delete (with confirmation)

### Admin - Entities (Groups/Subjects/Rooms)
- Card grid layout
- Create/edit modals with specific fields
- Groups: name, year, course, student count
- Subjects: name, short name, duration
- Rooms: number, capacity, resources

### Template Constructor
- Multi-step or tabbed: Group → Subject → Teacher → Frequency
- Optional preferences: days, time
- Live preview panel (right side)

### Schedule Generation
- Settings panel: working days, hours
- Large "Generate Schedule" button
- Progress indicator during generation
- Results report: placed lessons, conflicts, generation time
- Conflict list with details

### Schedule View
- **Default:** Weekly grid (days × time slots)
- **Filters:** Group, Teacher, Week, Room
- **Lesson card:** Time, subject (large), teacher, room, group
- **Color coding:** Unique color per subject (hash-based)
- **Mobile:** Vertical day list → lessons within day

## Accessibility

- **Keyboard navigation:** Full support, Esc (close), Ctrl+K (search), Ctrl+S (save)
- **Focus indicators:** Visible blue outline
- **Screen readers:** Semantic HTML, ARIA labels
- **Color contrast:** WCAG AA minimum (4.5:1 text, 3:1 UI)
- **Touch targets:** Minimum 44×44px

## UX Patterns

- **Confirmations:** Required before delete operations
- **Auto-save:** Forms with save indicator
- **Empty states:** Illustration + text + CTA
- **Error recovery:** "Retry" button on load failures
- **Search:** Global search in top bar (Ctrl+K hotkey)
- **Loading:** Skeleton screens preferred

## Assets

**Use:**
- Heroicons (via CDN) for actions
- MITSO logo (sidebar, login)
- Undraw-style illustrations (empty states)
- User initials (no avatars unless uploaded)

**Avoid:** Large hero images (utilitarian app)

---

**Implementation Priority:** Tables/grids → Forms → Modals → Animations → Mobile optimization