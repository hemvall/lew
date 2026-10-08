# Plan de réalisation

## Architecture proposée
Interface web responsive installable, backend de coordination, base persistante, worker sur machine persistante, adaptateur Codex et intégration GitHub.

Le worker exécute Git, Codex et les tests. Il reste indépendant du serveur qui sert l'interface. Le navigateur ne reçoit pas les secrets GitHub ou du fournisseur.

Le premier worker sera distant pour permettre de travailler avec le PC éteint. Un worker Windows/local pourra être ajouté pour les projets qui l'exigent.

## Décisions ouvertes
- Valider authentification Codex et mode de facturation pour le compte utilisé.
- Choisir la stack web, la base et l'hébergement après le prototype moteur.
- Inspecter Agent Runtime avant de décider quels composants réutiliser.
- Définir les droits GitHub et les règles par projet pour push, création de PR et merge.
- Définir les outils et instructions à installer : les connecteurs et la mémoire de ChatGPT ne sont pas présumés transférables.

## Étape 1 : moteur
Démarrer une conversation via Codex App Server, recevoir les événements, interrompre, reprendre et traiter une demande de validation.
Validation : reprise après redémarrage du service et gestion explicite d'une exécution échouée ou interrompue.

## Étape 2 : espaces de travail
Connexion GitHub, projets, tâches et worktrees.
Validation : deux tâches sur le même repo, fichiers différents, changements isolés et switch sans effet sur l'autre exécution.

## Étape 3 : livraison GitHub
Diff, commandes de vérification, création de PR et récupération de CI.
Validation : PR associée à la bonne branche ; merge externe reflété après synchronisation. La création de PR ne déclenche pas implicitement son merge.

## Étape 4 : continuité mobile
Historique d'événements durable, reconnexion, interface responsive.
Validation : fermeture du navigateur pendant une exécution, reprise sur un autre appareil sans duplication du travail.

## Étape 5 : pilotage
Filtres, recherche, résumés de contexte, projets multi-repos et notifications utiles.
Validation : retrouver rapidement un travail par projet, branche ou PR et identifier ce qui demande une réponse.

## Données minimales
Project, Repository, Workspace, Conversation, Run, Event, Decision, Approval et PullRequestLink.
Un workspace enregistre le repo, la branche, le commit de départ, le chemin du worktree et le worker.
Les événements ont un identifiant et un ordre persistants pour permettre la reconnexion.
Les commandes de démarrage sont idempotentes afin qu'un retry ne lance pas deux agents.

## Références à revalider pendant l'implémentation
- Codex App Server : https://learn.chatgpt.com/docs/app-server
- Limites du parcours Sign in with ChatGPT : https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations

Ce document décrit des choix proposés et des validations à réaliser, pas des capacités déjà implémentées.
