# Avatar runtime

The browser bundle in `public/vendor/avatar-runtime.js` includes:

- `@bible-strong/avatar-core` 0.1.0 and `@bible-strong/avatar-web` 0.1.0, copyright Stéphane Montlouis-Calixte, AGPL-3.0-only. Full license: `public/vendor/AVATAR-LICENSE.txt`. Corresponding upstream source: https://github.com/smontlouis/bible-strong-avatar-lab/tree/a5f5a76f22d72507ef12664acb96f35714753bec/packages. Published source artifacts are also available through npm at the pinned versions.
- Ajv 8.20.0 generated validation code, copyright Evgeny Poberezkin, MIT. Ajv source and license: https://github.com/ajv-validator/ajv. Its complete MIT license is retained in `public/vendor/AJV-LICENSE.txt`.

Lew's integration and reproducible build source are `scripts/build-avatars.mjs`, `agents.mjs` and `public/avatar-view.js` in this repository. Imported avatar definitions are user content and retain their respective licenses.
