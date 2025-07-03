---
title: Document d'analyse des besoins
---

Titre du projet : SchoolBag -- Assistant Scolaire Intelligent

Équipe : LahoumaBarik (Mohammed Ali Atmani, Mazguene Lyna, Rihame
Allali)

Date : 2025-05-29

Cours : Documentation technique

Enseignant : Safouen Bani

# 1. Introduction {#introduction}

Objectif du document : Ce document a pour but de détailler de manière
claire et structurée l'ensemble des besoins liés au développement de
l'application SchoolBag. Il permet d\'assurer une vision commune entre
les développeurs, les utilisateurs finaux et les parties prenantes, pour
le bon déroulement du projet.

Contexte du projet : La majorité des étudiants du collégial et de
l'université doivent jongler avec plusieurs plateformes (Moodle, Google
Calendar, fichiers papier, etc.) pour gérer leurs tâches, devoirs,
examens et projets. Cela mène à de la confusion, de l'oubli, et un
stress inutile. SchoolBag propose une application intelligente et
centralisée capable d'organiser leur agenda, de les assister via
l'intelligence artificielle (IA), et de faciliter la collaboration entre
étudiants via le partage d'événements.

# 2. Description générale du système {#description-générale-du-système}

But principal : Offrir un assistant scolaire intelligent et interactif,
capable de comprendre des commandes naturelles (texte et voix), de
planifier automatiquement les tâches, de suggérer des priorités, et
d'afficher un calendrier clair avec heatmap de charge.

Utilisateurs visés : Étudiants du collégial et de l'université qui
souhaitent centraliser et simplifier la gestion de leurs tâches
académiques.

Contraintes techniques initiales :  
- Frontend Web : React.js  
- Frontend Mobile : React Native (Expo)  
- Backend : Node.js avec Express  
- Base de données : MongoDB Atlas  
- Intelligence Artificielle : OpenAI API  
- Reconnaissance vocale : Web Speech API / Expo Speech  
- Authentification : JWT  
- Stockage des tâches en temps réel (Redux)

# 3. Exigences fonctionnelles {#exigences-fonctionnelles}

| ID  | Description de l'exigence fonctionnelle                                                           | Priorité |
|-----|---------------------------------------------------------------------------------------------------|----------|
| EF1 | L'utilisateur peut créer un compte et se connecter.                                               | Haute    |
| EF2 | L'utilisateur peut créer, modifier et supprimer une tâche.                                        | Haute    |
| EF3 | Les tâches sont affichées dans un calendrier avec heatmap de charge.                              | Haute    |
| EF4 | L'utilisateur peut importer/exporter ses données au format .ics ou .json.                         | Moyenne  |
| EF5 | L'utilisateur peut partager une ou plusieurs tâches avec d'autres utilisateurs.                   | Haute    |
| EF6 | L'IA comprend les commandes en langage naturel (texte ou vocal) pour créer ou filtrer des tâches. | Haute    |
| EF7 | Le système affiche des statistiques de productivité.                                              | Moyenne  |
| EF8 | L'utilisateur peut écrire et conserver des notes personnelles dans un vault par matière.          | Basse    |

# 4. Exigences non fonctionnelles {#exigences-non-fonctionnelles}

| ID   | Description de l'exigence non fonctionnelle                                   | Priorité |
|------|-------------------------------------------------------------------------------|----------|
| ENF1 | L'application doit répondre aux actions en moins de 2 secondes.               | Haute    |
| ENF2 | L'interface doit être responsive sur mobile et bureau.                        | Haute    |
| ENF3 | Les échanges entre client et serveur doivent être sécurisés via HTTPS et JWT. | Haute    |
| ENF4 | L'IA doit fournir des réponses structurées exploitables directement.          | Haute    |
| ENF5 | Le système doit pouvoir supporter plusieurs utilisateurs en simultané.        | Moyenne  |
| ENF6 | L'interface utilisateur doit être claire, intuitive et agréable à utiliser.   | Haute    |

# 5. Cas d'utilisation {#cas-dutilisation}

**EF1**  
**Acteur** : Utilisateur  
**Cas d'utilisation** : Créer un compte  
**Scénario principal** :

- Le visiteur accède à la page d'inscription

- Il saisit ses informations personnelles (nom, email, mot de passe)

- Il soumet le formulaire

- Le compte est créé et l'utilisateur est redirigé vers la page
  d'accueil

**Alternatives** :

- Email déjà utilisé : affichage d'un message d'erreur

**EF2A**  
**Acteur** : Étudiant  
**Cas d'utilisation** : Créer une tâche  
**Scénario principal** :

- L'utilisateur clique sur \'Nouvelle tâche\'

- Il remplit les champs requis

- Il clique sur \'Enregistrer\'

- La tâche apparaît dans le calendrier

**Alternatives** :

- Champs incomplets : affichage d'un message

**EF2B**  
**Acteur** : Étudiant  
**Cas d'utilisation** : Modifier une tâche  
**Scénario principal** :

- L'utilisateur sélectionne une tâche existante

- Il modifie les champs souhaités

- Il clique sur \'Mettre à jour\'

- La tâche est modifiée avec succès

**Alternatives** :

- Mauvais format de date : message d'erreur

**EF2C**  
**Acteur** : Étudiant  
**Cas d'utilisation** : Supprimer une tâche  
**Scénario principal** :

- L'utilisateur sélectionne une tâche

- Il clique sur \'Supprimer\'

- Une confirmation apparaît

- Il confirme et la tâche est supprimée

**EF3**  
**Acteur** : Étudiant  
**Cas d'utilisation** : Consulter le calendrier  
**Scénario principal** :

- L'utilisateur accède à l'onglet calendrier

- Il voit les jours avec plus de tâches en couleur

- Il clique sur une date pour voir les tâches associées

**EF4A**  
**Acteur** : Étudiant  
**Cas d'utilisation** : Importer un fichier  
**Scénario principal** :

- L'utilisateur clique sur \'Importer un fichier\'

- Il sélectionne le fichier

- Les tâches sont ajoutées automatiquement  
  **Alternatives** :

- Format non pris en charge : message d'erreur

**EF4B**  
**Acteur** : Étudiant  
**Cas d'utilisation** : Exporter ses tâches  
**Scénario principal** :

- L'utilisateur accède à la section exportation

- Il choisit un format de fichier

- Il clique sur \'Exporter\'

- Le fichier est généré et téléchargé

**EF5**  
**Acteur** : Étudiant  
**Cas d'utilisation** : Partager une tâche  
**Scénario principal** :

- Il clique sur une tâche

- Il entre l'email d'un collaborateur

- Il clique sur \'Partager\'

**Alternatives** :

- Email invalide : message d'erreur

**EF6**  
**Acteur** : Étudiant  
**Cas d'utilisation** : Ajouter une tâche avec l'IA  
**Scénario principal** :

- Il tape ou dicte une commande

- L'IA l'interprète et propose une tâche

- Il confirme l'ajout

**Alternatives** :

- Message incompréhensible : message d'erreur

**EF7**  
**Acteur** : Étudiant  
**Cas d'utilisation** : Consulter ses statistiques  
**Scénario principal** :

- Il accède à la section statistiques

- Il voit les tâches accomplies, en retard, etc.

**EF8**  
**Acteur** : Étudiant  
**Cas d'utilisation** : Ajouter une note dans le vault  
**Scénario principal** :

- Il ouvre le vault

- Il clique sur \'Nouvelle note\'

- Il écrit et sauvegarde

**EF9**  
**Acteur** : Étudiant  
**Cas d'utilisation** : Recevoir un rappel  
**Scénario principal** :

- Lors de l'ajout d'une tâche, il active les rappels

- Il reçoit une notification 1h avant

**EF10**  
**Acteur** : Étudiant  
**Cas d'utilisation** : Ajouter une tâche par la voix  
**Scénario principal** :

- Il appuie sur le micro

- Il dicte la tâche

- Il valide la proposition

**Alternatives** :

- Voix non reconnue : affichage d'un message


