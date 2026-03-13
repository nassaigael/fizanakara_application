# Fizanakara - Fee Management Application

A modern, vibrant fee management application built with the **MERN** stack (PostgreSQL instead of Mongo). This application follows the "Duolingo" design aesthetic with bold colors and 3D UI elements.

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, React Query, React Router, Axios, React Hot Toast
- **Backend**: Spring Boot, PostgreSQL, JWT, Spring Security, JPA/Hibernate

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Java 17+
- PostgreSQL

### Frontend Configuration
1. Clone the repository
2. Navigate to `/client`:
   ```bash
   cd client
   npm install
   ```
3. Create a `.env` file in `/client`:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
client/src/
├── components/     # Reusable UI components
├── context/        # Auth and global state
├── hooks/          # Custom React hooks (React Query)
├── lib/            # Types, constants, and validators
├── pages/          # Main application views
├── services/       # API services and axios config
└── styles/         # Global styles and theme tokens
```

## 🔑 Key Features

### For SuperAdmins
- **Dashboard**: Global statistics on admins, districts, and tributes.
- **Admin Management**: Create and manage branch administrators.
- **Location Management**: Define districts and tributes for member organization.
- **Global Profile**: Manage system-wide identity and security.

### For Admins
- **Member Management**: Register and track branch members and their families.
- **Finance Tracking**: Manage monthly/yearly contributions and partial payments.
- **Status Alerts**: Identify members with overdue payments at a glance.

## 🎨 Design Principles

- **Duolingo Aesthetic**: Strong primary colors (#FF4B4B), thick borders (3D effect), and rounded corners (3rem/4xl).
- **English First**: 100% of the UI and codebase documentation is in English.
- **Responsive**: Fully optimized for mobile, tablet, and desktop views.

## 📄 License

Proprietary - Developed for Fizanakara.
