# Plan produit de lew

## Objectif
Piloter plusieurs projets et agents depuis un espace cohérent, retrouver le contexte de chaque tâche et poursuivre le travail sur desktop ou mobile.

## Modèle
- Projet : objectifs, instructions, décisions, documentation et un ou plusieurs repos.
- Espace de travail : tâche et environnement Git isolé. Une discussion sans repo reste possible.
- Conversation : échanges de planification, développement ou revue.
- Exécution : intervention de l'agent, événements, actions, vérifications et résultat.
- PR : livrable GitHub associé à un espace de travail.

Une conversation peut contenir plusieurs exécutions. Une branche Git et une conversation restent des objets distincts. Les identifiants du fournisseur sont conservés sans devenir les identifiants métier de lew.

## Parcours principal
1. Choisir un projet et créer une tâche.
2. Choisir le repo et la branche de départ.
3. Préparer un worktree distinct et démarrer une conversation.
4. Donner une instruction et suivre les événements.
5. Passer à un autre espace sans modifier l'environnement de la tâche active.
6. Revenir, consulter les changements et demander une correction.
7. Créer une PR et suivre sa CI.
8. Retrouver la tâche sur téléphone et poursuivre.

## Écrans
- Accueil : éléments qui demandent une réponse, PR à relire, erreurs CI, exécutions actives.
- Projet : tâches, branches, PR, décisions et activité.
- Espace de travail : conversation, progression, diff, tests, fichiers et contexte courant.
- Recherche globale : projets, tâches, conversations et PR ; filtres projet, repo, branche, statut.

## Contexte
Préférences personnelles, instructions du projet et décisions de la tâche sont stockées séparément. L'état Git est relu à la reprise. Un résumé contient objectif, décisions, avancement, blocages et prochaine action, avec ses sources et sa date.

Créer une variante prépare une nouvelle conversation et une nouvelle branche à partir d'un point explicite. Le contexte repris est visible et modifiable.

## Exécutions
États : en attente, en cours, attend une réponse, terminée, interrompue, échouée. Une interruption n'est pas une réussite. Le statut de l'agent reste distinct de celui de la tâche et de la PR.

La fermeture du navigateur ne termine pas une exécution. Une reconnexion recharge les événements persistés avant de reprendre le flux. Une seule exécution modificatrice par worktree au départ. Les validations portent sur une action et une version précises ; un changement du diff invalide une ancienne validation.

## Périmètre V1
Utilisateur unique, GitHub, un moteur Codex, plusieurs projets, tâches isolées, contexte persistant, diff, PR, CI, interruption, reprise et interface responsive.

Les agents spécialisés, les intégrations supplémentaires et les automatisations complexes viendront après validation du parcours principal.

## Critère de réussite
Lancer une tâche sur un projet, passer à un autre, fermer le navigateur et reprendre depuis un téléphone sans perdre le contexte ni confondre les branches.
