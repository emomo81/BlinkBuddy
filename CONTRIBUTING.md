# Contributing to BlinkBuddy

Thanks for helping people blink more! 👀 Contributions of all sizes are welcome: new characters, bug fixes, features, docs, and translations.

## Getting started

```bash
git clone https://github.com/emomo81/BlinkBuddy.git
cd BlinkBuddy
npm install
npm start
```

Click the eye icon in the system tray to open Settings, then use **Test blink now** to see your changes.

## Adding a new built-in character 🐾

Characters are plain SVG drawn in code, so there are no image files or licenses to manage.

1. Open `src/shared.js` and add an entry to `CHARACTERS`, e.g. `hamster: () => svg('0 0 200 180', \`...\`)`.
2. Use the `eye({...})` helper for each eye. It adds the eyelid that slides down when the character blinks.
   - `lid` is the eyelid color (usually a slightly darker shade of the face).
   - `pupil: 'slit'` gives cat-style pupils.
3. Register it in `BUILTIN_ANIMATIONS` in `src/main.js` with a friendly name.
4. Check it in both states (eyes open and closed) and on light and dark wallpapers.

Keep the style consistent: `#2b2b2b` outlines at `stroke-width="4"`, soft pink cheeks, and a friendly face.

## Adding bundled animations or sounds

Files in `library/animations` and `library/sounds` ship with the app. Only add files that are **CC0** or whose license
clearly allows redistribution, and record the source and license in `library/CREDITS.md`.

## Pull requests

1. Fork the repo and create a branch: `git checkout -b feature/hamster-character`.
2. Keep changes focused; one feature or fix per PR.
3. Match the surrounding code style (plain JavaScript, no build step).
4. Describe what you changed and add a screenshot or GIF for anything visual.

## Reporting bugs and ideas

Open an [issue](https://github.com/emomo81/BlinkBuddy/issues) with your OS version, what you expected, and what happened.
Ideas are welcome too: see the roadmap in the README.

## Code of conduct

Be kind and respectful. Everyone is welcome here.
