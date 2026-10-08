# Direction visuelle

## Intention
La référence fournie le 8 octobre 2026 remplace la direction initiale : un bureau macOS sombre avec wallpaper à courbes, widgets translucides, barre de menus supérieure et dock. Les projets et conversations s’ouvrent dans une fenêtre avec sidebar et inspecteur. Les informations de repo et de branche restent visibles.

## Desktop
- Sidebar de 240 px environ, redimensionnable : accueil, projets, favoris et travaux récents.
- Barre d'outils compacte : navigation, projet, repo, branche, recherche et actions.
- Zone centrale : conversation ou liste des travaux.
- Inspecteur optionnel de 320 à 420 px : diff, contexte, tests et PR.
- Panneaux redimensionnables et préférence de disposition conservée.

## Style
- Fond sombre à courbes et reflets bleus/violets, réalisé en SVG local. Mode sombre par défaut ; apparence claire disponible pour la fenêtre.
- Widgets et dock en verre sombre avec blur, contours fins et ombres. Fenêtre plus opaque pour préserver la lisibilité des conversations et diffs.
- Accent violet pour les actions ; icônes de dock en bleu, violet, rose et gris.
- Typographie système : -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif.
- Police monospace pour branches, commandes et diffs.
- Bordures fines, ombres légères, arrondis de 10 à 14 px, espacement fondé sur 4 et 8 px.
- Icônes cohérentes, simples, accompagnées de labels pour les actions importantes.
- Contrôles de fenêtre fonctionnels : retour au bureau, réduction au bureau et agrandissement de la fenêtre.

## Interaction
Une action principale par vue. Les détails techniques se déplient à la demande. Les statuts ont un libellé et ne reposent jamais uniquement sur une couleur.
Recherche rapide via Cmd/Ctrl+K, navigation clavier, focus visible et respect de la réduction des animations.

## Mobile
Sous 800 px, widgets réorganisés sur deux colonnes, dock tactile fixe et fenêtre avec un panneau à la fois. Navigation Bureau, Projets, Activité, À traiter et Compte ; dans une tâche, onglets Conversation et Changements & contexte.
Actions tactiles de 44 px minimum, saisie qui reste accessible avec le clavier, contenu sans débordement horizontal sauf les blocs de code.
Le repo et la branche apparaissent avant toute action qui modifie le travail.

## Contrôle visuel
Valider les vues à 1440 px et 390 px, en clair et sombre, avec titres longs, beaucoup de tâches, chargement, erreur, liste vide et agent en attente.
