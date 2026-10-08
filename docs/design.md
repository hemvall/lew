# Direction visuelle

## Intention
Une application de travail calme, inspirée des conventions de macOS : sidebar, barre d'outils, liste et inspecteur. Les informations de projet et de branche restent visibles.

## Desktop
- Sidebar de 240 px environ, redimensionnable : accueil, projets, favoris et travaux récents.
- Barre d'outils compacte : navigation, projet, repo, branche, recherche et actions.
- Zone centrale : conversation ou liste des travaux.
- Inspecteur optionnel de 320 à 420 px : diff, contexte, tests et PR.
- Panneaux redimensionnables et préférence de disposition conservée.

## Style
- Fond clair gris chaud, surfaces presque blanches ; mode sombre équivalent.
- Translucidité légère dans la sidebar et la barre d'outils avec fond opaque de secours.
- Accent bleu pour sélection et action principale.
- Typographie système : -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif.
- Police monospace pour branches, commandes et diffs.
- Bordures fines, ombres légères, arrondis de 10 à 14 px, espacement fondé sur 4 et 8 px.
- Icônes cohérentes, simples, accompagnées de labels pour les actions importantes.
- Aucun faux bouton de fenêtre macOS dans l'application web.

## Interaction
Une action principale par vue. Les détails techniques se déplient à la demande. Les statuts ont un libellé et ne reposent jamais uniquement sur une couleur.
Recherche rapide via Cmd/Ctrl+K, navigation clavier, focus visible et respect de la réduction des animations.

## Mobile
Sous 768 px, affichage d'un panneau à la fois. Navigation Projets, Activité et À traiter ; dans une tâche, onglets Conversation, Changements et Contexte.
Actions tactiles de 44 px minimum, saisie qui reste accessible avec le clavier, contenu sans débordement horizontal sauf les blocs de code.
Le repo et la branche apparaissent avant toute action qui modifie le travail.

## Contrôle visuel
Valider les vues à 1440 px et 390 px, en clair et sombre, avec titres longs, beaucoup de tâches, chargement, erreur, liste vide et agent en attente.
