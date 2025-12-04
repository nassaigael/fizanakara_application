# 🧩 `/components` - Composants React Réutilisables

## 📋 Description

Contient tous les composants React réutilisables, organisés en trois sous-dossiers.

## 📂 Structure

### `ui/`
Composants UI primitifs et simples:
- **Button** - Bouton réutilisable avec variants
- **Input** - Champ texte avec validation
- **Select** - Sélecteur dropdown
- **Card** - Conteneur stylisé
- **Alert** - Modales d'alerte
- **ActionBtn** - Bouton d'action pour listes
- **ProgressCard** - Carte de progression
- **RiskMemberCard** - Carte membre à risque
- **SearchInput** - Champ de recherche
- **ScreenLoading** - Écran de chargement

### `shared/`
Composants spécifiques métier et modales:
- **management/** - Formulaires de gestion (AdminRegisterForm, etc.)
- **members/** - Composants membres
- **payments/** - Composants paiements
- **modals/** - Modales réutilisables

### `layout/`
Composants de mise en page:
- **MainLayout** - Layout principal avec sidebar
- **Navbar** - Barre de navigation
- **Sidebar** - Barre latérale

## 💡 Conventions

- Composants fonctionnels avec hooks
- Props typées avec TypeScript
- Styling avec Tailwind CSS
- Memoization si besoin (memo, useMemo)
