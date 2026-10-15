# BlinkBuddy 👀

A small desktop companion that lives in your system tray. Every ~20 seconds, a cartoon
character pops up in the corner of your screen and **blinks**, which nudges you to blink too.
People blink about 15–20 times a minute normally, but only around 5 times a minute when
staring at a screen, which leads to dry, tired eyes.

- Always on top, and mouse clicks pass straight through it, so it never blocks your work.
- 4 built-in characters (eyes, cat, owl, frog) and 3 built-in sounds, all made in code, so there are no licensing worries.
- A **library** for your own animations: GIF, WebP, APNG, PNG, WebM, MP4, or **Lottie JSON**, plus your own sounds.
- Pauses automatically when you're away; the tray menu can also pause it for 15 min to 2 h.
- Optional **20-20-20** break notification every 20 minutes.
- Can start with Windows.

## Run it

```bash
npm install
npm start
```

## Build a Windows installer (.exe)

```bash
npm run dist
```

The installer is written to `dist/`.

## Where to get animations & sounds

Always check the license of each file. For a public app, prefer **CC0 / public domain**, or
licenses that allow redistribution inside software. Record credits in `library/CREDITS.md`.

### Animations (animals & cartoons)
| Source | What you get | License notes |
|---|---|---|
| **LottieFiles** (lottiefiles.com), search "blink", "eye", "cat blink" | Lottie `.json`: tiny, crisp at any size, works directly in BlinkBuddy | Free animations use the Lottie Simple License, which allows commercial use. Check each file. |
| **IconScout / Lordicon** | Animated icons (Lottie/GIF), including eyes | Free tiers usually require attribution |
| **OpenGameArt.org** | Sprite sheets of animals and characters, many with blink frames | Filter for CC0 |
| **Kenney.nl** | Cartoon character and animal assets | All CC0 |
| **Rive community** (rive.app/community) | Interactive animated characters | Would need the Rive runtime (a good future upgrade) |
| **GIPHY / Tenor** | Lots of blinking GIFs | ⚠️ Mostly copyrighted characters, so fine for personal use but don't ship them |
| **Make your own** | Draw two frames (eyes open/closed) in Procreate, Krita, Aseprite, or Figma, then export a GIF/WebP. Or animate in After Effects with the Bodymovin plugin to get Lottie. | You own it |

### Sound effects
| Source | License notes |
|---|---|
| **Freesound.org**: search "blink", "pop", "boing", "cartoon eye" | Filter for **Creative Commons 0** |
| **Pixabay Sound Effects** | Free for commercial use, no attribution needed |
| **Mixkit** (mixkit.co/free-sound-effects) | Free license; check the terms for redistribution in apps |
| **Kenney.nl audio packs** (UI, interface sounds) | CC0 |
| **ZapSplat** | Free with attribution |
| **jsfxr / sfxr.me** | Generate your own retro "blip" sounds, which you own |

## Library roadmap ideas
1. Folder-per-character packs with a `pack.json` (name, author, license, animation, sound, tags).
2. An online catalog (e.g. a small website or GitHub repo) that the app can browse and download packs from.
3. Rive support for characters that react (e.g., follow your cursor).
4. **Webcam blink detection** (MediaPipe Face Landmarker, fully on-device): only remind you when you
   *haven't* blinked for a while, and show a daily blink-rate stat.
5. Themes by time of day, and a "streak" or eye-health dashboard.

## Project layout
```
src/main.js        tray, timer, overlay window, settings storage, library scanning
src/overlay.*      the transparent pop-up that plays the animation + sound
src/shared.js      built-in SVG characters + synthesized sounds
src/settings.*     settings & library window
library/           files bundled with the app (animations/, sounds/)
```
Your personal library lives in `%APPDATA%\BlinkBuddy\library`.
