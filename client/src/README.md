# 📁 `/src` - Frontend Application Source

## 📋 Structure Globale

Ce dossier contient toute l'application React TypeScript, organisée en couches bien définies.

```
src/
├── main.tsx              -- Point d'entrée de l'application
├── App.tsx               -- Composant principal et routeur
├── api/                  -- Configuration Axios et clients API
├── components/           -- Composants React réutilisables
├── context/              -- Contextes React (globalstate)
├── hooks/                -- Custom hooks personnalisés
├── lib/                  -- Utilitaires, types, et helpers
├── routes/               -- Configuration et protection des routes
├── services/             -- Couche métier et appels API
├── styles/               -- Thèmes et styles globaux
└── views/                -- Pages/vues principales
```

## 🎯 Points Clés

- **TypeScript Strict**: Tout le code est typé pour la sécurité
- **React Hooks**: Gestion d'état avec hooks personnalisés
- **TanStack Query**: Gestion du cache et sync serveur/client
- **Tailwind CSS**: Styles utility-first
- **React Router**: Navigation et protection des routes

## 📂 Description des Dossiers

Voir les `README.md` spécifiques dans chaque sous-dossier pour plus de détails.
