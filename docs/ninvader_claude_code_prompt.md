# ClaudeCode Prompt (English)

The existing prototype is a simple Space‑Invaders‑style shooter with only one stage. We will expand it according to the specifications below, aiming for highly readable and compact code.\
The GitHub repository slug is **ninvader**.\
In this sprint, **BGM, PWA/Service Worker, CI/CD, accessibility, localization, and fastest‑time tracking are out of scope**.

## 1  Refactoring & Project Skeleton

### Language / Tools

- TypeScript + Vite build (plain ES Modules is also acceptable)
- ESLint (Airbnb rules) + Prettier — place shared config files in the project root

### Directory Structure

```text
src/
  core/        // engine utilities, game loop, collision, input
  scenes/      // Title, Game, GameOver, Debug, Option
  entities/    // Player, Bullet, Enemy, Boss, UFO, FX
  ui/          // HUD, buttons, touch controls, selectors
  assets/      // images & audio (PNG, MP3/OGG)
```

### Module Boundaries

Avoid global singletons; each scene owns its entities. Use a simple scene stack for transitions.

## 2  Gameplay Content

| Stage | Trash‑Enemy Color | HP | Shot Interval | Shot Speed Modifier |
| ----- | ----------------- | -- | ------------- | ------------------- |
| 1     | Green             | 1  | 2.0 s         | 0 %                 |
| 2     | Purple            | 2  | 1.5 s         | +10 %               |
| 3     | Orange            | 3  | 1.0 s         | +20 %               |

*Use the same sprite with color swaps.*

### Bosses

| Stage | Name   | Weapon & Parameters                                                                                   | Notes                                |
| ----- | ------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 1     | Benten | Kunai, 5‑way / 120 px s⁻¹ / 2 s                                                                       | low HP                               |
| 2     | Kohaku | Wave bullet (down) / 240 px s⁻¹ / 0.7 s                                                               | medium HP / color shift when damaged |
| 3     | Oni    | Rock, 3‑way / 160 px s⁻¹ / 1 s  Big Rock (down) / 260 px s⁻¹ / 4 s / boss flashes 0.5 s before firing | high HP                              |

### Player Ships & Special Attacks

| No. | Name    | Special Attack   | Path      | Piercing | Power  |
| --- | ------- | ---------------- | --------- | -------- | ------ |
| 1   | Sakuya  | Shining Shuriken | straight  | yes      | medium |
| 2   | Nemu    | Red Dragon       | sine‑wave | yes      | low    |
| 3   | Shaoran | Panda            | straight  | no       | high   |

Recover **+1 special attack** for every **10 000 points**.

## 3  UI / UX

- **Title Scene** — carousel with left/right buttons to choose among the three ships.
- **Option Scene** — SFX volume slider, input‑mode toggle (touch / keyboard), high‑score reset (confirmation dialog).
- **Touch Controls** — two buttons (move, shoot) at bottom right; special‑attack button at bottom left.
- **Debug Scene** — open with `?debug` in the URL; select any stage or boss.
- **Game Over** — display current score and **High Score**; `Retry` restarts from the stage where the player died (score resets to 0).

## 4  Persistent Data (localStorage)

Key: **cnp\_invader\_stats**

```json
{ "ver": 1, "highScore": 0 }
```

Update if `score > highScore` at game end.\
The “Reset Records” option executes `localStorage.removeItem(key)`.

## 5  Assets

Transparent PNGs (around 1024 × 1024):

- 3 player ships + their special‑attack bullets/effects
- 3 bosses + their bullets
- UFO redesign: Dango → **Gorilla**

**Sound effects** — completely replace prototype SFX. At least 8 types (player bullet, enemy bullet, boss bullet, special attack, hit, explosion, etc.).

## 6  Recommended Task Order (adjust as needed)

1. Core refactor & directory split (completed)
2. Stage & trash‑enemy expansion
3. Boss implementation
4. Player variants, special attacks, score calculation
5. UI scenes (Title / Option / Game Over / Debug) and touch controls
6. localStorage high‑score saving
7. Asset swap (new sprites & SFX)
8. Balance tuning, cross‑browser & mobile verification

## Delivery Requirements

- Commit work to the **ninvader** repository in task‑based units.
- Maintain FPS ≥ 60 on desktop and major mobile browsers.
- `npm run lint` must pass ESLint without errors.
- `README.md` must describe controls, build/run steps, and debug mode.

---

First, create the renovation plan in **docs** in Markdown format.\
After that, we will implement each step of the renovation plan, so do **not** start implementation yet.\
If anything is unclear, be sure to ask questions before starting.

