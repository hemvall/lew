# Avatar runtime

The browser bundle in `public/vendor/avatar-runtime.js` includes:

- `@bible-strong/avatar-core` 0.1.0 and `@bible-strong/avatar-web` 0.1.0, copyright Stéphane Montlouis-Calixte, AGPL-3.0-only. Full license: `public/vendor/AVATAR-LICENSE.txt`. Corresponding upstream source: https://github.com/smontlouis/bible-strong-avatar-lab/tree/a5f5a76f22d72507ef12664acb96f35714753bec/packages. Published source artifacts are also available through npm at the pinned versions.
- Ajv 8.20.0 generated validation code, copyright Evgeny Poberezkin, MIT. Ajv source and license: https://github.com/ajv-validator/ajv. Its complete MIT license is retained in `public/vendor/AJV-LICENSE.txt`.

Lew's integration and reproducible build source are `scripts/build-avatars.mjs`, `agents.mjs` and `public/avatar-view.js` in this repository. Imported avatar definitions are user content and retain their respective licenses.

# Bundled team and typography

`public/avatars/*.avatar.json` are colored/body-shape adaptations of the Avatar Lab consumer example (Strobi), distributed with the same AGPL-3.0-only notices above. Corresponding example source: https://github.com/smontlouis/bible-strong-avatar-lab/tree/a5f5a76f22d72507ef12664acb96f35714753bec/examples/react-vite-consumer. The rendering adapter, including SVG lighting, is `public/avatar-view.js` in this repository.

`public/fonts/InterVariable.woff2` is Inter Variable 4.1, copyright Rasmus Andersson, SIL Open Font License 1.1. Full license: `public/fonts/INTER-LICENSE.txt`. Source: https://github.com/rsms/inter/tree/v4.1. Apple system fonts are resolved from the user's platform and are not redistributed.

The expression and animation presets in the bundled team avatars also adapt BetchApp's Avatar Lab export from https://github.com/Betcha-Protocol/BetchApp/blob/95b55974e587974705a60284742c7453dec81731/src/avatar/BetchAvatar.avatar.ts. The legacy export is converted into the validated portable schema; Lew retains its own body shapes, role-specific idle pools and timing. The upstream runtime code is not copied from BetchApp.
