# lew

Votre espace pour piloter des projets avec Codex, retrouver le contexte d’une tâche et passer entre ses branches et ses conversations, sur desktop et mobile.

## Première version

- Bureau inspiré de la référence macOS : fond sombre avec courbes, widgets translucides, barre de menus, dock et fenêtre de travail. Interface responsive et recherche Cmd/Ctrl+K.
- Projets GitHub avec leurs instructions modifiables, branches et PR ouvertes.
- Une branche et un worktree isolé par tâche.
- Conversations, événements et états persistés dans Supabase Postgres.
- Adaptateur Codex App Server : création/reprise de thread, messages, interruption, demandes de validation.
- Connexion au compte Codex par code d’appareil, compatible avec un worker distant et un téléphone.
- Livraison : sélection des fichiers, commit, push sans force, création de PR en brouillon et suivi de CI.

## Sur votre PC Windows

Depuis le dossier du repo, par exemple `D:\repos\lew` :

```bat
cd /d D:\repos\lew
npm install -g @openai/codex
npm ci
start-local.cmd
```

Au premier lancement, le script crée `.env` et l’ouvre dans le Bloc-notes. Renseignez `DATABASE_URL`, enregistrez puis relancez `start-local.cmd`. Ouvrez http://localhost:3000 et connectez Codex depuis le dock.

Le lanceur se place automatiquement dans le dossier de lew. Les installations npm de Codex sous Windows sont résolues vers leur script Node officiel, sans dépendre de l’exécution d’un shim `.cmd` par le serveur.

Votre PC héberge le worker. Les tâches continuent lorsque vous fermez le navigateur, tant que le serveur reste lancé et que le PC reste éveillé. La base reste sur Supabase et les worktrees/historiques Codex restent sur votre PC.

## Démarrer manuellement

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

Les tests contrôlent le protocole Codex avec un processus simulé, les erreurs et accès API, les commits sélectifs et la publication de PR réessayable avec de vrais repos Git temporaires et un transport GitHub simulé. Ils ne remplacent pas une exécution réelle sur votre worker ni un test de connexion à votre Postgres.

## Livraison GitHub

Dans une tâche, ouvrez **Livraison** dans l’inspecteur. Relisez les modifications, choisissez les fichiers et créez un commit. La revue est invalidée si les fichiers ont changé entre-temps. Les fichiers non suivis sont inclus dans la sélection ; le diff textuel actuel concerne les fichiers suivis.

**Créer une PR** envoie les commits sur la branche de la tâche et ouvre une PR en brouillon par défaut. Une PR déjà ouverte pour cette branche est réutilisée. Les modifications locales non commitées restent sur le worker. La CI est relue avec **Actualiser** ; un accès incomplet aux contrôles est affiché explicitement. Le merge se fait pour l’instant sur GitHub.

Configurez un token GitHub côté serveur avec accès au repo : Pull requests en écriture, Checks et Commit statuses en lecture. Configurez également le credential helper Git pour le push et l’identité de commit du compte lew. Le token API ne configure pas automatiquement les identifiants Git.

## Installation sur un VPS

Les fichiers dans `deploy/` préparent une installation Linux avec systemd et HTTPS via Caddy. Ils ne provisionnent pas de serveur.

1. Installez Node 22+, npm, Git et Caddy sur le serveur.
2. Depuis un checkout de lew, lancez `sudo bash deploy/install.sh`. Le script crée un utilisateur lew et installe Codex 0.159.2.
3. Configurez `/etc/lew/lew.env` : connexion Supabase, un long `LEW_ACCESS_TOKEN`, puis éventuellement `GITHUB_TOKEN`.
4. Configurez l’identité et les identifiants Git pour l’utilisateur lew.
5. Configurez votre domaine dans `deploy/Caddyfile`, pointez-le vers le serveur et rechargez Caddy.
6. Lancez `sudo systemctl enable --now lew` puis consultez `sudo journalctl -u lew -f` si nécessaire.
7. Ouvrez votre domaine, entrez le code d’accès lew et connectez Codex par code d’appareil.

Le service tourne sous l’utilisateur lew. Les worktrees et les données Codex doivent rester sur un disque persistant. Le script ne remplace pas votre configuration existante et ne démarre pas le service avant que vous ayez renseigné la connexion.

## Prochaines étapes

Pagination des événements, reprise idempotente des commandes, résumés de conversations et variantes sur une nouvelle branche. Une exécution réelle complète et la connexion Postgres du worker cible restent à valider après installation.

Voir les documents dans `docs/` pour le parcours cible et la direction visuelle.
