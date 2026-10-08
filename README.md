# lew

Votre espace pour piloter des projets avec Codex, retrouver le contexte d’une tâche et passer entre ses branches et ses conversations, sur desktop et mobile.

## Première version

- Interface responsive inspirée de macOS, thèmes clair et sombre, recherche rapide Cmd/Ctrl+K.
- Projets GitHub avec leurs instructions, branches et PR ouvertes.
- Une branche et un worktree isolé par tâche.
- Conversations, événements et états persistés dans Supabase Postgres.
- Adaptateur Codex App Server : création/reprise de thread, messages, interruption, demandes de validation.
- Connexion au compte Codex par code d’appareil, compatible avec un worker distant et un téléphone.

## Démarrer

Node 22.13+ et Git sont nécessaires. Installez Codex sur la machine qui exécutera les tâches :

```sh
npm install -g @openai/codex
npm ci
```

Copiez `.env.example` vers `.env` et renseignez `DATABASE_URL` avec l’URL **Session pooler** depuis le panneau Connect de Supabase. L’URL et les identifiants restent exclusivement côté serveur. TLS vérifie le certificat ; renseignez `SUPABASE_CA_FILE` avec le certificat Supabase si votre environnement en a besoin.

```sh
node --env-file=.env server.mjs
```

Ouvrez http://localhost:3000 puis **Votre espace → Connecter Codex**. Ouvrez la page officielle et saisissez le code affiché. Codex conserve et renouvelle lui-même les identifiants sur le worker. Si le code d’appareil est désactivé sur votre compte, activez-le dans les paramètres de sécurité ChatGPT ou connectez Codex avec son CLI sur le worker.

Sans `DATABASE_URL`, l’interface affiche la configuration requise et n’enregistre aucune donnée localement. Il n’y a pas de stockage SQLite de secours.

## Supabase

Le schéma privé `lew` a été appliqué au projet existant `Linkedin-Prospection` (`cxnjjgwiizummimxytsx`). Il contient `projects`, `workspaces` et `events`. Les tables de prospection restent séparées.

Le schéma n’est pas exposé via la Data API, les accès `anon` et `authenticated` sont révoqués et RLS est activé. Les accès se font depuis le serveur avec la connexion Postgres. L’absence de politiques est intentionnelle pour ce schéma privé : aucun accès client direct n’est prévu.

`supabase/schema.sql` reproduit le DDL initial appliqué par le connecteur. Pour une installation neuve, appliquez-le une seule fois sur votre propre projet.

## Accès depuis un téléphone

Exécutez lew sur une machine persistante. Configurez `LEW_HOST=0.0.0.0`, un long `LEW_ACCESS_TOKEN` aléatoire et un reverse proxy HTTPS. Le code d’accès sera demandé à chaque nouvelle session de navigateur. Aucun identifiant Postgres, GitHub ou Codex n’est transmis au navigateur.

Cette version utilise un worker unique et un compte Codex unique. Conservez `.lew/` et le répertoire personnel de Codex : les worktrees et l’historique natif Codex restent sur cette machine. Supabase conserve les métadonnées et les événements, mais ne remplace pas ces fichiers. Fermer le navigateur laisse le worker actif ; redémarrer le serveur marque les tâches actives comme interrompues.

Pour les repos privés, configurez le credential helper Git sur le worker. `GITHUB_TOKEN` est facultatif pour consulter les branches/PR et ne configure pas automatiquement Git.

## Vérification

```sh
npm run check
npm test
```

Les tests contrôlent le handshake Codex, la connexion par code d’appareil, les événements et la gestion des pannes avec un processus simulé. Ils ne remplacent pas une exécution réelle sur votre worker ni un test de connexion à votre Postgres.

## Prochaines étapes

Création de PR depuis l’interface, affichage de CI, édition du contexte, pagination des événements, reprise idempotente des commandes et variantes de conversations/branches. L’interface actuelle affiche les PR existantes et les diffs des fichiers suivis ; elle ne crée ni ne merge les PR.

Voir les documents dans `docs/` pour le parcours cible et la direction visuelle.
