# El Mazraa Workflow Management

## Présentation

**El Mazraa Workflow Management** est une application web développée dans le cadre de mon stage chez **El Mazraa**.

L'application a pour objectif de digitaliser et de centraliser la gestion des articles ainsi que leur processus de traitement et de validation. Elle permet aux différents utilisateurs de gérer les articles, suivre leur état d'avancement, échanger des commentaires et consulter l'historique des opérations.

## Fonctionnalités principales

* Authentification et connexion des utilisateurs
* Gestion des utilisateurs et des rôles
* Gestion des autorisations selon le rôle
* Création et modification des articles
* Consultation et suivi des articles
* Validation et rejet des articles
* Ajout et gestion des commentaires
* Historique des opérations
* Système de notifications
* Tableau de bord et statistiques
* Gestion des fichiers
* Export des données
* Notifications par e-mail
* Suivi de l'état des articles

## Gestion des utilisateurs

L'application intègre un système de gestion des rôles permettant de contrôler les fonctionnalités accessibles à chaque utilisateur.

Selon son rôle, un utilisateur peut notamment :

* Créer et modifier des articles
* Soumettre des articles pour validation
* Consulter les articles
* Valider ou rejeter des articles
* Ajouter des commentaires
* Consulter l'historique des opérations
* Recevoir et consulter les notifications

## Technologies utilisées

### Frontend

* Vue.js
* JavaScript
* HTML5
* CSS3
* Vue Router

### Backend

* Node.js
* Express.js
* API REST
* JWT
* Mongoose

### Base de données

* MongoDB

### Outils

* Git
* GitHub
* Visual Studio Code
* Postman

## Architecture

L'application est organisée selon une architecture séparant le frontend, le backend et la base de données.

Le **frontend** développé avec Vue.js assure l'interface utilisateur et la communication avec l'API.

Le **backend** développé avec Node.js et Express.js fournit les API REST, gère la logique métier, l'authentification, les autorisations et les interactions avec la base de données.

La **base de données MongoDB** permet de stocker les utilisateurs, les articles, les commentaires, les notifications et les différentes informations nécessaires au fonctionnement de l'application.

## Installation

### Prérequis

Avant de lancer le projet, il est nécessaire d'avoir installé :

* Node.js
* npm
* MongoDB
* Git

### Installation du backend

```bash
cd backend
npm install
```

Créer ensuite un fichier `.env` à partir du fichier `.env.example` et renseigner les variables d'environnement nécessaires.

Puis lancer le serveur :

```bash
npm start
```

### Installation du frontend

Dans un autre terminal :

```bash
cd frontend
npm install
```

Lancer ensuite l'application :

```bash
npm run serve
```

L'application sera généralement accessible à l'adresse :

```text
http://localhost:8080
```

## Documentation

La documentation technique du projet est disponible dans le dossier `docs`.

Elle contient notamment :

* La documentation de l'API
* L'architecture de l'application
* Les diagrammes du projet

## Contexte du stage

Ce projet a été réalisé dans le cadre de mon stage chez **El Mazraa**.

J'ai travaillé sur différentes étapes de réalisation du projet, notamment :

* Analyse des besoins
* Conception et modélisation UML
* Conception de l'architecture
* Développement du backend
* Développement du frontend
* Conception de la base de données
* Mise en place de l'authentification et des autorisations
* Développement des fonctionnalités de gestion des articles
* Mise en place des notifications
* Tests et correction des erreurs
* Documentation du projet

## Auteur

**Mohamed Aziz Jouini**

Étudiant en Technologie de l'Informatique — ISET Bizerte

GitHub : [azizjouini724](https://github.com/azizjouini724)

---

Projet réalisé dans le cadre d'un stage chez **El Mazraa**.
