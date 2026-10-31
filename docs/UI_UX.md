# HIMMAT — UI/UX Guide

**Version:** 1.1 | **Date:** 31 Oct 2026
**Font:** Share Tech (Google Fonts, by Carrois Apostrophe, 1 style)
**Theme:** **Wine Red `#7F011F`** + **Light Sand `#F5EBD0`** (from your reference), with a dark wine-ink for body text.

> **Changelog 1.1:** Theme changed from grey/white to Wine Red + Light Sand. Status colors and tokens were redone so they work with the red brand color. There is no separate "red alert" color any more, because the brand itself is red.

> **Design goal in one line:** warm, calm, large, high-contrast, and never scary. A learner who is afraid of "pressing the wrong button" should feel safe and in control on every screen.

---

## 1. Design Principles

| # | Principle | What it means on screen |
|---|---|---|
| 1 | **Warm and calm, not alarming** | Sand backgrounds, wine only for brand and main actions. No big red crosses, no "You failed". Mistakes are shown as learning steps. |
| 2 | **Big and clear** | Large text, large buttons (min 48px), one main action per screen. |
| 3 | **Always know it's practice** | A permanent "Practice world. Nothing is real." banner on every simulator screen. |
| 4 | **User stays in control** | Nothing happens without a tap. No auto-advance, no countdown on the learner. |
| 5 | **Simple words** | Short sentences, no jargon. Every technical word has a tap-to-explain. |
| 6 | **Same place, same meaning** | Same button position, same colors, same icons everywhere. |
| 7 | **Works in 3 languages** | English, Roman Urdu, Urdu (RTL). Layout must not break in any of them. |
| 8 | **Wine is the brand, never the warning** | Because our main color is red, **red never means "danger" in HIMMAT**. Status is shown with icon + word + amber/green (see 2.2). |

---

## 2. Color Theme

### 2.1 Core palette

| Token | Hex | Use |
|---|---|---|
| `--wine` | **`#7F011F`** | Brand color: primary buttons, headings, links, icons, active states, hero bands |
| `--sand` | **`#F5EBD0`** | Page background, text on wine surfaces |
| `--surface` | `#FFF9EA` | Cards and panels sitting on sand (a lighter cream) |
| `--ink` | `#2A0A10` | Main body text (very dark wine-brown, softer than pure black) |
| `--text-muted` | `#5C3A40` | Secondary text, labels, meta info |
| `--text-subtle` | `#6B5258` | Placeholders and captions (use at 18px or larger) |
| `--border` | `#DCCBA3` | Decorative hairlines and card outlines |
| `--border-strong` | `#8A7748` | Input borders, checkbox outlines (3:1 or better against sand) |
| `--wine-dark` | `#5A0016` | Hover / pressed state of wine, focus ring |
| `--wine-tint` | `#EBD0C4` | Selected row, soft highlight |
| `--on-wine` | `#F5EBD0` | Text on wine backgrounds (same as sand) |
| `--on-wine-muted` | `#E4D3B0` | Secondary text on wine backgrounds |

### 2.2 Status colors (red is NOT used for status)

| Token | Text / icon | Tint | Use |
|---|---|---|---|
| `--safe` | `#146C2E` | `#DCE9D0` | Safe choice, correct recovery step, mastered skill |
| `--caution` | `#8A5100` | `#F5DDA6` | Risky choice, needs attention, form errors, "practice account affected" outcome |
| `--neutral` | `#5C3A40` | `#EFE3C4` | Neutral step, information |

- The "simulated account compromised" outcome uses a **filled caution tag** (`#8A5100` background, sand text) with a warning icon and the words "Practice account affected". Calm, clear, not scary.
- Form errors use the caution color + warning icon + a plain sentence telling the learner what to do.
- Text inside tinted boxes stays `--ink`. The status color is used for the icon and the short label.

### 2.3 Contrast check (WCAG)

| Text on background | Ratio | Result |
|---|---|---|
| `--ink #2A0A10` on `--sand` | ≈ 15:1 | AAA |
| `--ink` on `--surface #FFF9EA` | ≈ 17:1 | AAA |
| `--wine #7F011F` on `--sand` | ≈ 9.2:1 | AAA |
| `--wine` on `--surface` | ≈ 10.4:1 | AAA |
| `--sand` on `--wine` (button text, hero band) | ≈ 9.2:1 | AAA |
| `--sand` on `--wine-dark` | ≈ 12:1 | AAA |
| `--text-muted #5C3A40` on `--sand` | ≈ 8.3:1 | AAA |
| `--on-wine-muted #E4D3B0` on `--wine` | ≈ 7.4:1 | AAA |
| `--text-subtle #6B5258` on `--sand` | ≈ 5.9:1 | AA |
| `--safe #146C2E` on `--sand` / `--surface` | ≈ 5.5:1 / 6.2:1 | AA |
| `--caution #8A5100` on `--sand` / `--surface` | ≈ 5.4:1 / 6.1:1 | AA |
| Sand on filled caution `#8A5100` | ≈ 5.4:1 | AA |
| `--border-strong #8A7748` vs `--sand` (input outline) | ≈ 3.7:1 | Passes 3:1 for UI components |

### 2.4 Color usage rules
1. **About 70% sand and cream, 20% ink text, 10% wine.** Wine is used for the one main action per screen, headings, and brand moments. Do not flood screens with wine.
2. **Split-band hero (like your reference):** hero and title areas can be a full wine band with sand text, followed by a sand area with wine text. Use at most once per page.
3. **Never rely on color alone.** Always pair with an icon and a word (for example a check icon + "Safe choice").
4. **One primary button per screen** in wine. Other buttons are outlined or quiet.
5. **No red for mistakes or warnings.** Mistakes are amber, safe is green, and wine is only the brand.
6. **High-contrast mode** (accessibility toggle): background `#FFFFFF`, all text `#000000`, borders 2px `#000000`, tints removed, wine becomes `#5A0016`.

### 2.5 Fictional app colors (inside the phone simulator only)
The simulated apps must look **different from HIMMAT's wine/sand UI**, so learners always know which part is the "practice phone". Fictional brands, inspired by familiar apps but not copied. None of them use wine or sand as their main color.

| Fictional app | Look |
|---|---|
| ChatLine (chat) | Teal-blue `#0E7490` header, white and light-grey bubbles |
| SafeTrust Bank | Navy `#1E3A8A` header, white body |
| PaySathi (wallet) | Orange `#C2410C` accent |
| BazaarNow (shop) | Purple `#6D28D9` accent |
| MeetKaro (video) | Dark `#111827` canvas, green join button |
| e-Sahulat (gov portal) | Deep green `#166534` header, formal layout |

The fake **scam** screens should look slightly "off" in realistic ways (misspelling in the web address, odd logo spacing) so learners can practise spotting them. They must never copy a real bank's login page.

---

## 3. Typography — Share Tech

### 3.1 Font facts
- **Family:** Share Tech (Google Fonts)
- **Styles available:** 1 (Regular, weight 400 only)
- **Character:** slightly condensed, techno-humanist sans, clean and modern
- **Supports:** Latin only. **It has no Urdu letters**, so Urdu script needs a fallback font (see 3.4).

### 3.2 Loading (Next.js)
```tsx
// frontend/src/app/layout.tsx
import { Share_Tech, Noto_Nastaliq_Urdu } from "next/font/google";

const shareTech = Share_Tech({
  subsets: ["latin"],
  weight: "400",              // only weight available
  variable: "--font-share-tech",
  display: "swap",
});

const urdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  variable: "--font-urdu",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${shareTech.variable} ${urdu.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### 3.3 One weight only. How to build hierarchy without bold
Your reference uses very heavy headline letters, but Share Tech only has one weight. **Never use `font-bold` or `font-semibold`**, because the browser would fake it and it looks blurry. Add this once:

```css
html { font-synthesis: none; }
```

To get the same strong feeling as your reference headings, use:
1. **Very large size** (`--text-2xl` and up) in `--wine` on sand, or `--sand` on a wine band
2. **UPPERCASE with wide letter spacing** (`0.04em`) for short hero labels like "FAKE BANK MESSAGE" (Latin text only, never full sentences, never Urdu script)
3. **Color contrast** (`--ink` for main, `--text-muted` for secondary, `--wine` for emphasis)
4. **Space and position** (more space around important things)
5. **Icons** next to labels

### 3.4 Font stacks
```css
:root {
  --font-ui: var(--font-share-tech), "Segoe UI", system-ui, sans-serif;
  --font-urdu-stack: var(--font-urdu), "Noto Naskh Arabic", "Jameel Noori Nastaleeq", serif;
}
html[lang="en"], html[lang="ur-Latn"] { font-family: var(--font-ui); }   /* English + Roman Urdu */
html[lang="ur"] { font-family: var(--font-urdu-stack); }                 /* Urdu script, RTL */
```
Roman Urdu is written in Latin letters, so Share Tech works for it directly.

### 3.5 Type scale
Share Tech is compact, so we start bigger than usual. The learner's **text-size setting** (normal / large / xlarge) scales everything with one CSS variable.

| Token | Normal | Large (default) | X-Large | Use |
|---|---|---|---|---|
| `--text-xs` | 14px | 16px | 18px | Captions only (never for instructions) |
| `--text-sm` | 16px | 18px | 20px | Meta info, labels |
| `--text-base` | 18px | 20px | 24px | Body text, buttons |
| `--text-lg` | 22px | 24px | 28px | Card titles, important sentences |
| `--text-xl` | 28px | 32px | 36px | Screen titles |
| `--text-2xl` | 36px | 40px | 48px | Hero / big outcome message |

- **Line height:** 1.6 for body, 1.25 for titles.
- **Letter spacing:** `0.01em` on body, `0` on titles, `0.04em` on uppercase hero labels.
- **Line length:** max about 60 characters for paragraphs.
- **Urdu script:** line-height 2.0 and about 2px larger than Latin text (Nastaliq needs more vertical room).

```css
:root { --scale: 1; }                      /* normal */
html[data-text="large"]  { --scale: 1.11; }
html[data-text="xlarge"] { --scale: 1.33; }
body { font-size: calc(18px * var(--scale)); line-height: 1.6; letter-spacing: 0.01em; }
```

### 3.6 Numbers and OTP
Practice OTP codes and amounts use Share Tech with `font-variant-numeric: tabular-nums` and `letter-spacing: 0.15em` so digits are easy to read one by one.

---

## 4. Layout, Spacing, Shape

| Item | Value |
|---|---|
| Spacing unit | 4px grid. Use 8, 12, 16, 24, 32, 40, 64 |
| Page background | `--sand #F5EBD0` |
| Page side gutter | 16px mobile, 40px desktop |
| Card | background `--surface #FFF9EA`, **radius 16px**, padding 24px mobile / 40px desktop, 1px `--border #DCCBA3`, no shadow |
| Hero band | background `--wine`, text `--sand`, radius 16px (or full-width), padding 40px |
| Button radius | 12px |
| Input radius | 12px, 2px `--border-strong` border |
| Min touch target | **48 × 48px** (use 56px for primary buttons) |
| Max content width | 1120px |
| Breakpoints | Mobile ≤ 640px, Tablet 641–1024px, Desktop ≥ 1025px |
| Layout | Mobile-first. On desktop: phone frame in the center, explanation/hint panel beside it. On mobile: explanation as a bottom sheet. |

### 4.1 The "meta card" pattern
Used for scenario cards, skill cards and replay steps:

```
┌──────────────────────────────────────────────────────────┐   background #FFF9EA, 1px #DCCBA3, radius 16px
│  Scenario title   2 skills  |  Difficulty: Easy           │   title in --wine, meta in --text-muted
│                                                          │
│  Big readable sentence goes here in the large size …     │   --text-xl, color --ink
└──────────────────────────────────────────────────────────┘
```
- Row 1: **name** (`--text-lg`, `--wine`) + small meta (`--text-sm`, `--text-muted`) + a thin divider `|`.
- Row 2: the main content in a large size.
- Never clip instructions. Always wrap them fully.

### 4.2 The "split band" pattern (from your reference)
```
┌──────────────────────────────┐
│  WINE BAND (#7F011F)          │   big title in sand, small hex/meta chip in a lighter wine pill
│  ── FAKE BANK MESSAGE ──      │
├──────────────────────────────┤
│  SAND AREA (#F5EBD0)          │   big title in wine
│  ── WHAT WOULD YOU DO? ──     │
└──────────────────────────────┘
```
Use it for the landing hero, scenario intro screens and the big outcome screens.

---

## 5. Components

### 5.1 Buttons
| Type | Style |
|---|---|
| **Primary** | Background `--wine #7F011F`, text `--sand`, height 56px, radius 12px. Only one per screen. Hover/pressed: `--wine-dark #5A0016`. |
| **Secondary** | Transparent background, 2px `--wine` border, text `--wine`. Hover: `--wine-tint` background. |
| **Quiet / Text** | No background, text `--wine`, underline on hover/focus. |
| **Choices inside the simulator** | Look like normal buttons of that fake app. The simulator must **not** hint which choice is risky. |
- States: **focus = 3px `--wine-dark` outline with 2px offset** (on wine buttons the offset shows a sand gap), pressed = scale 0.98, disabled = `--border` background + `--text-subtle` text with an explanation.
- Always **icon + label** (left icon for Latin, right icon for RTL).

### 5.2 "Practice world" banner
Sticky at the top of every simulator screen.
- Background `--ink #2A0A10`, text `--sand`, shield icon. Text: "Practice world. Nothing here is real."
- Height 44px, cannot be dismissed. Highly visible but calm.

### 5.3 Phone frame (Simulator)
- Rounded rectangle 360 × 720px (scales down on mobile), 12px bezel in `--ink #2A0A10`, inner screen white.
- Fake apps render inside using their own colors (section 2.5).
- A small "PRACTICE" tag sits on the bezel in sand text.

### 5.4 Consequence Panel (the 4 questions)
Four stacked cards on `--surface`, each with an icon, a short title in `--wine` and 1–2 simple sentences in `--ink`:
1. **What happened?**
2. **Why did it happen?**
3. **What should have happened?**
4. **What can you do differently?**

Outcome tag: **Safe** (green tint + check icon), **Close call** (neutral tint), **Practice account affected** (filled caution tag + warning icon, with an arrow button to the Recovery Lab). Tone: calm, neutral, "you" language. Example: "The link was not from your bank. You can check the sender before opening it next time."

### 5.4.1 Reading aloud
Every panel has a speaker button (Web Speech API). Icon + label "Listen".

### 5.5 Mistake Replay timeline
Vertical timeline, numbered circles (wine fill, sand number) on a thin `--border` line.
- Each step is a meta card (title + one line).
- Step tag chip: **Safe** (green), **Risky** (amber), **Neutral** (muted), always icon + word.
- A **"What if I chose differently?"** secondary button appears on every decision step.
- Compare view: two columns (Your path | New path) on desktop, stacked tabs on mobile. Differences highlighted with the tint colors.

### 5.6 Recovery Lab
- Numbered step cards the learner taps in the order they think is right (or drag to reorder, with a tap alternative for accessibility).
- Feedback is per step: green tint "Good step", amber tint "Try this earlier or later". Never red.

### 5.7 Digital DNA and charts
- **Radar chart** (Recharts) with 5–7 skills: stroke `--wine`, fill `--wine` at 15% opacity, gridlines `--border`.
- Beside it, a list of skills with a **horizontal bar** (track `--border`, fill `--wine`), label and percent.
- Chart colors: series 1 `--wine #7F011F`, series 2 `--border-strong #8A7748`, series 3 `--safe #146C2E`. Use different line styles (solid, dashed, dotted) too, so charts work without color.
- Below: **Recommendation card**: "Next for you: Send Money Safely" with a primary button.
- Skill vs confidence: two small side-by-side bars to show the gap.

### 5.8 AI Mentor / Hint drawer
- Floating "Need a hint?" secondary button, bottom-right (bottom-left in RTL).
- Opens a drawer with 3 steps: **Nudge, Show me where, Explain**. One at a time, each tap reveals the next level.
- Text is short (max 3 sentences). A "Listen" button and a "Type your own question" box.
- Never has a button that does the task for the user.

### 5.9 Family dashboard
- Top: learner's name and a neutral message ("Amna is practising. Here is her progress.").
- Cards: skills mastered, skills needing support, trend line (Recharts), "How you can help" tips.
- A visible **"What you can see"** panel listing the consented categories, with "Only Amna can change this".
- No conversation content, no step-by-step mistakes.

### 5.10 Forms and inputs
- Label above input, always visible (no placeholder-only labels), size `--text-base`.
- 56px height, background `--surface`, 2px `--border-strong` border, focus border `--wine`.
- Error: warning icon in `--caution` + a sentence under the field, for example "This looks like a real card number. Please use the practice number shown."

### 5.11 Icons
- `lucide-react`, 24px (28px in large mode), stroke 2px, color follows text (`--wine` for brand icons, `--ink` for neutral).
- Always paired with a text label for key actions.

### 5.12 Motion
- Framer Motion, 150–250ms ease-out. Used for: panel slide-in, replay rewind, chart draw, wine band reveal.
- Respect `prefers-reduced-motion` (turn off all but fades).
- No auto-playing animations that distract from reading.

---

## 6. Key Screens (wireframes)

### 6.1 Onboarding
```
┌───────────────────────────────┐
│ ████ WINE BAND ████████████████│   "HIMMAT" in sand
│ Welcome. Let's set up.         │   --text-xl, wine
│                                │
│ 1. Choose language             │
│ [ English ] [ Roman Urdu ] [ اردو ]│
│ 2. Text size   [A] [A+] [A++]  │
│ 3. High contrast  ( )          │
│ 4. Read aloud     ( )          │
│                                │
│        [ Continue ]  (wine)    │
└───────────────────────────────┘
```

### 6.2 Dashboard
```
┌──────────────────────────────────────────────┐
│ Hello, Amna                                   │
│ ┌──────────────────────┐ ┌─────────────────┐ │
│ │ Next for you          │ │ Digital DNA     │ │
│ │ Fake Bank Message     │ │ (radar chart)   │ │
│ │ [ Start ]             │ │                 │ │
│ └──────────────────────┘ └─────────────────┘ │
│ Due today: Review "Spot a fake message"       │
│ All scenarios:  [1] [2] [3] [4] [5]           │
└──────────────────────────────────────────────┘
```

### 6.3 Scenario Player
```
Desktop                                   Mobile
┌─────────────────────────────────────┐   ┌──────────────┐
│ Banner: Practice world               │   │ Banner        │
│ ┌────────────┐  ┌─────────────────┐  │   │ ┌──────────┐ │
│ │ Phone frame │  │ What to do now  │  │   │ │ Phone    │ │
│ │ (fake app)  │  │ [Need a hint?]  │  │   │ └──────────┘ │
│ │             │  │ Consequence     │  │   │ Bottom sheet: │
│ └────────────┘  │ panel appears   │  │   │ consequence   │
│                  └─────────────────┘  │   └──────────────┘
└─────────────────────────────────────┘
```

### 6.4 Replay + What-if
```
Your path                          What if?
1 Received urgent message  [Safe]
2 Trusted sender           [Risky] ──► [ What if I checked? ]
3 Opened link              [Risky]
4 Entered practice OTP     [Risky]
5 Practice account affected [Caution]
```

### 6.5 Mastery Test
Same as Scenario Player but the hint button is hidden and a quiet label says "Try this one on your own". The result screen uses the split band: wine band with the result, sand area with the updated Digital DNA.

---

## 7. Accessibility Checklist (maps to SRS FR-10 / NFR-U)

- [ ] Min text 18px; user can switch to 20px and 24px
- [ ] Touch targets ≥ 48×48px
- [ ] Contrast ≥ WCAG AA everywhere (see 2.3); high-contrast mode available
- [ ] Visible focus ring (3px wine-dark) on every interactive element
- [ ] Full keyboard navigation on desktop; logical tab order
- [ ] All icons have text labels or `aria-label`
- [ ] Status never conveyed by color alone (icon + word)
- [ ] Consequence messages in an `aria-live="polite"` region
- [ ] Read-aloud button on every explanation
- [ ] `prefers-reduced-motion` respected
- [ ] No time limits on the learner; urgency is only part of the story inside the fake app
- [ ] Error messages explain what to do next, in plain words

---

## 8. Language and RTL

| Language | `lang` | Direction | Font |
|---|---|---|---|
| English | `en` | LTR | Share Tech |
| Roman Urdu | `ur-Latn` | LTR | Share Tech |
| Urdu | `ur` | **RTL** | Noto Nastaliq Urdu (Share Tech has no Urdu glyphs) |

- Use logical CSS (`margin-inline-start`, `padding-inline`, `text-align: start`) so RTL works automatically. In Tailwind use `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`.
- Mirror arrows, progress direction, the timeline side and the hint button position in RTL.
- Do not mirror: numbers, logos, charts' value axes.
- Allow 30–40% more room for Roman Urdu text, so no fixed-width buttons.
- Uppercase hero labels apply to English and Roman Urdu only, never to Urdu script.

---

## 9. Voice and Tone (copy rules)

| Do | Don't |
|---|---|
| "Let's check who sent this." | "Warning! Possible fraud!" |
| "That's okay. Here is what happened." | "Wrong answer." / "You failed." |
| "Next time, you can call the bank on its official number." | "You should never have clicked." |
| Short sentences, everyday words | Jargon (phishing, malicious, authentication) without a tap-to-explain |
| Ask: "What would you like to do?" | Command: "Choose now!" |

Rule of thumb: **explain, don't scold.** Every mistake screen ends with a way forward (replay, recovery, or try again).

---

## 10. Design Tokens (copy-paste)

### 10.1 CSS variables — `frontend/src/styles/tokens.css`
```css
:root {
  /* Brand (from reference) */
  --wine: #7F011F;
  --sand: #F5EBD0;

  /* Surfaces and text */
  --bg: var(--sand);
  --surface: #FFF9EA;
  --ink: #2A0A10;
  --text-muted: #5C3A40;
  --text-subtle: #6B5258;
  --border: #DCCBA3;
  --border-strong: #8A7748;

  /* Wine variants */
  --wine-dark: #5A0016;
  --wine-tint: #EBD0C4;
  --on-wine: #F5EBD0;
  --on-wine-muted: #E4D3B0;

  /* Status (no red) */
  --safe: #146C2E;     --safe-tint: #DCE9D0;
  --caution: #8A5100;  --caution-tint: #F5DDA6;
  --neutral: #5C3A40;  --neutral-tint: #EFE3C4;

  /* Shape and space */
  --radius-card: 16px;
  --radius-control: 12px;
  --tap-min: 48px;
  --focus-ring: 3px solid var(--wine-dark);

  /* Type */
  --scale: 1;
}
html { font-synthesis: none; }
html[data-text="large"]  { --scale: 1.11; }
html[data-text="xlarge"] { --scale: 1.33; }
html[data-contrast="high"] {
  --bg: #FFFFFF; --surface: #FFFFFF; --border: #000000; --border-strong: #000000;
  --ink: #000000; --text-muted: #000000; --text-subtle: #000000;
  --wine: #5A0016; --wine-dark: #3A000E; --wine-tint: #FFFFFF;
  --safe-tint: #FFFFFF; --caution-tint: #FFFFFF; --neutral-tint: #FFFFFF;
}
body { background: var(--bg); color: var(--ink); }
:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
```

### 10.2 Tailwind — `frontend/tailwind.config.ts` (extend)
```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wine: { DEFAULT: "var(--wine)", dark: "var(--wine-dark)", tint: "var(--wine-tint)" },
        sand: "var(--sand)",
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--text-muted)",
        subtle: "var(--text-subtle)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        "on-wine": "var(--on-wine)",
        "on-wine-muted": "var(--on-wine-muted)",
        safe: { DEFAULT: "var(--safe)", tint: "var(--safe-tint)" },
        caution: { DEFAULT: "var(--caution)", tint: "var(--caution-tint)" },
        neutral: { DEFAULT: "var(--neutral)", tint: "var(--neutral-tint)" },
      },
      fontFamily: {
        sans: ["var(--font-share-tech)", "Segoe UI", "system-ui", "sans-serif"],
        urdu: ["var(--font-urdu)", "Noto Naskh Arabic", "serif"],
      },
      fontSize: {
        xs:   ["calc(14px * var(--scale))", "1.5"],
        sm:   ["calc(16px * var(--scale))", "1.5"],
        base: ["calc(18px * var(--scale))", "1.6"],
        lg:   ["calc(22px * var(--scale))", "1.4"],
        xl:   ["calc(28px * var(--scale))", "1.25"],
        "2xl":["calc(36px * var(--scale))", "1.2"],
      },
      borderRadius: { card: "16px", control: "12px" },
      minHeight: { tap: "48px" },
    },
  },
} satisfies Config;
```

### 10.3 shadcn/ui mapping
Set shadcn's variables to our tokens so every component follows the theme:
```css
:root {
  --background: var(--sand);
  --foreground: var(--ink);
  --card: var(--surface);          --card-foreground: var(--ink);
  --popover: var(--surface);       --popover-foreground: var(--ink);
  --primary: var(--wine);          --primary-foreground: var(--sand);
  --secondary: var(--wine-tint);   --secondary-foreground: var(--wine);
  --muted: var(--border);          --muted-foreground: var(--text-muted);
  --accent: var(--wine-tint);      --accent-foreground: var(--wine);
  --destructive: var(--caution);   --destructive-foreground: var(--sand);   /* no red in HIMMAT */
  --border: var(--border);         --input: var(--border-strong);
  --ring: var(--wine-dark);
  --radius: 12px;
}
```

### 10.4 Where these live in the project (see `arch.md` §19)
```
frontend/
├── src/app/layout.tsx          # loads Share Tech + Urdu font, sets lang/dir
├── src/app/globals.css         # imports tokens.css, shadcn mapping, base styles
├── src/styles/tokens.css       # section 10.1
├── tailwind.config.ts          # section 10.2
├── src/components/a11y/        # TextSizeControl, ContrastToggle, ReadAloudButton
└── src/components/ui/          # shadcn components using the mapping above
```

---

## 11. Build Priority for Today (UI only)

| Order | What | Phase (see `dev_plan.md`) |
|---|---|---|
| 1 | Tokens, Share Tech loading, shadcn mapping, base layout, "Practice world" banner | Phase 1–2 |
| 2 | Buttons, meta card, wine band, phone frame, ChatLine screens, Consequence Panel | Phase 2 |
| 3 | Text-size toggle + high-contrast toggle | Phase 2 |
| 4 | Replay timeline + What-if + compare | Phase 3 |
| 5 | Recovery step cards, Digital DNA radar + bars | Phase 4 |
| 6 | Hint drawer, Family dashboard, language switch | Phase 5 |
| 7 | Urdu RTL pass, contrast and tap-target pass | Phase 6 (only if time) |

**Rule:** build the tokens first (10 minutes), then every component automatically matches the theme.

---

## 12. Quick Do and Don't

**Do**
- Use Light Sand `#F5EBD0` as the page background and Wine Red `#7F011F` for brand, headings and the main button.
- Use `--ink #2A0A10` for long body text.
- Make hierarchy with size, uppercase hero labels, color and space.
- Add `font-synthesis: none`.
- Pair every status color with an icon and a word.
- Use amber and green for status. Red is the brand, not a warning.

**Don't**
- Don't use bold with Share Tech (it only has one weight).
- Don't use Share Tech for Urdu script (no glyphs, use the Urdu fallback).
- Don't put long paragraphs in wine on sand. Use ink for reading text.
- Don't use big red screens, crosses or "failed" wording.
- Don't use wine or sand as the main color of the fake apps inside the phone.
- Don't copy real bank, government or messaging app designs.