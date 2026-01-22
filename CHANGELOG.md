# SOLUS FORGE Changelog

## v3.5.0 - January 22, 2026

### ✨ New Features

- **Arcana Split Animation**: Workflow section now features unified arcana symbols that dramatically fracture and split into individual workflow cards as you scroll
  - Each of the 4 arcana (Visionary, Merchant, Oracle, Alchemist) starts as a glowing unified symbol
  - Crack lines appear with particle burst effects during the split
  - Cards emerge and settle into their final positions with spring physics
  - Staggered animation timing for each column creates a cascading effect

- **Extended Scroll Experience**: Increased scroll height from 400vh to 600vh for more immersive animations and longer workflow exploration area

### 🎨 UI/UX Improvements

- Refined scroll animation phases for smoother transitions between sections
- Section title now animates upward as workflow cards appear
- Enhanced visual feedback during arcana split with particle bursts and glow effects

### 🔧 Technical

- New `ArcanaSplit.tsx` component with scroll-linked Framer Motion animations
- Optimized scroll progress breakpoints for 600vh scroll container
- SVG-based fracture line animations with dynamic path lengths

---

## v3.4.0 - January 22, 2026

### ✨ New Features

- **Simplified Workflow Grid**: Replaced complex tarot card arc animation with clean 4-column arcana grid layout
- **Chat Bar Slide Animation**: Interface now slides up from below the viewport as you scroll
- **Agent Flight Animation**: Agent icons fly into their respective boxes as the chat bar UI slides into view

### 🎨 UI/UX Improvements

- Cleaner workflow card design with horizontal layout (icon + title)
- Color-coded arcana columns: Orange (Visionary), Green (Merchant), Purple (Oracle), Pink (Alchemist)
- Empty agent boxes that fill as agents arrive

### 🔧 Technical

- MorphingAgent component updated with chatBarY prop for targeting sliding boxes
- Scroll-linked Y transform for chat bar sliding animation

---

## v3.3.0 - January 22, 2026

### 🎨 UI/UX Improvements

- **Solar Flare Direction Fixed**: Flames now travel OUTWARD from the gradient circle (away from the eye) instead of inward
- **Centered Eye**: Content inside GradientCircle is now perfectly centered using absolute positioning
- **Font Usage Fixed**: Hero section now properly uses Futuriata font variable

### 🔧 Technical

- Reversed flare angle calculation in GradientCircle canvas animation
- Updated content centering with translate(-50%, -50%) positioning

---

## v3.2.0 - January 22, 2026

### 🎨 UI/UX Improvements

- **Password Gate Cleanup**: Removed SOLUS FORGE title from password gate
- **Centered Dialog**: Password input dialog now perfectly centered
- **Larger HandEye Icon**: Increased submit button icon size to 36px in 64px button

### 🔧 Technical

- Removed title element from BlackHoleGate component
- Updated flex centering for password form
- Adjusted icon proportions in submit button

---

## v3.1.0 - Previous

### ✨ Features

- OSINT workflow with Lupin III integration
- Orbiting agent animations
- Tarot card reveal system
- Hyperspeed transition effect
- Password gate with HandEye authentication
