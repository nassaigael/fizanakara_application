# 🚀 Fizanakara Admin App

## Description
Fizanakara Admin est une solution moderne dédiée à la gestion des cotisations annuelles des membres de l'organisation Fizanakara. L'application a été conçue avec un accent particulier sur la simplicité et l'engagement de l'expérience utilisateur (UI/UX).

## 🛠 Technologies Utilisées
L'application repose sur une stack technologique robuste et typée pour garantir performance et maintenabilité :

* **React** - Bibliothèque principale pour une interface dynamique.
  * Bibliothèques clés : `react-router-dom` (navigation), `react-toastify` (notifications).
* **TypeScript** - Pour un code sécurisé, structuré et une meilleure expérience de développement.
* **Tailwind CSS** - Pour un design moderne, réactif et des effets visuels avancés.

## ✨ Fonctionnalités Clés
* Gestion des Membres : Suivi détaillé de chaque membre de l'organisation.
* Suivi des Cotisations : Enregistrement et historique des paiements annuels.
* Interface Intuitive : Design épuré pour une prise en main rapide par les administrateurs.
* Notifications en temps réel : Feedback visuel via des "toasts" pour chaque action effectuée.

## ⚙️ Installation et Lancement
1. Cloner le dépôt :
    ```bash
    git clone https://github.com/votre-utilisateur/fizanakara-admin.git
    ```
2. Se placer dans le dossier client et installer les dépendances :
    ```bash
    cd fizanakara_application/client
    npm install
    ```
3. Configurer l'adresse du backend (fichier `.env` déjà présent) :
    ```env
    VITE_API_BASE_URL=http://localhost:3001
    ```
   Adaptez cette URL si vous exécutez le serveur Spring Boot sur un autre port ou en production.
4. Démarrer le serveur de développement :
    ```bash
    npm run dev
    ```

L'application frontend tournera alors habituellement sur `http://localhost:5173`.

> **Note** : tant que le backend n'est pas déployé, la connexion est dirigée vers l'URL locale définie dans `.env`.
