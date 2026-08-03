# Convertisseur d'Images — PixelShift

Application web de conversion d'images avec architecture distribuée :

- **Frontend** : Conversion des images côté client (React + Canvas API)
- **Backend** : Stockage temporaire des fichiers et distribution (Express.js)

---

## Architecture

### Frontend

- Sélection et prévisualisation de l'image
- Conversion locale des images (JPEG, PNG, WebP, GIF, BMP, HEIC/HEIF)
- Téléchargement du fichier converti vers le backend (optionnel)
- Affichage de l'URL de téléchargement

### Backend

- Stockage temporaire des fichiers convertis
- Nettoyage automatique des fichiers expirés (30 minutes)
- Distribution des fichiers via des URLs

---

## Installation locale

### Backend

```bash
cd backend
npm install
npm start
```

Port : `5000`

### Frontend

```bash
cd frontend
npm install
```

### Variables d'environnement frontend

Copier `.env.example` :

```bash
cp .env.example .env.local
```

Modifier `REACT_APP_API_URL` si le backend tourne sur une autre adresse :

```
REACT_APP_API_URL=http://localhost:5000
```

### Lancement

```bash
# Backend (port 5000)
cd backend
npm start

# Frontend (port 3000)
cd frontend
npm start
```

Accéder à `http://localhost:3000`.

---

## Utilisation

1. Ouvrez `http://localhost:3000` dans votre navigateur
2. Sélectionnez une image à convertir
3. Choisissez le format de destination
4. Cliquez sur "Convertir" (la conversion s'effectue localement dans le navigateur)
5. (Optionnel) Envoyez le fichier converti au serveur pour le partager
6. Téléchargez le fichier via le lien fourni

---

## Configuration

### Backend

| Paramètre | Valeur |
|-----------|--------|
| Port | 5000 |
| Dossier de stockage | `backend/storage/` |
| Dossier temporaire | `backend/temp_uploads/` |
| Expiration des fichiers | 30 minutes |
| Intervalle de nettoyage | 10 minutes |

Ces paramètres peuvent être modifiés dans `backend/src/services/file.service.js`.

### Frontend

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | URL de l'API backend |

---

## Déploiement

### Option A : Frontend sur Vercel, Backend ailleurs (recommandé)

#### Frontend (Vercel)

1. Push du code sur GitHub
2. Importer le projet sur [Vercel](https://vercel.com)
3. Vercel détecte automatiquement le frontend via `vercel.json`
4. Ajouter la variable d'environnement `REACT_APP_API_URL` pointant vers votre backend déployé

#### Backend (Railway / Render / Heroku)

1. Push du code sur GitHub
2. Créer un nouveau projet sur Railway / Render / Heroku
3. Configurer la commande de build : `npm install && npm start`
4. Le backend écoute sur le port configuré (Vercel/ Railway fournit `PORT` via `process.env.PORT`)

### Option B : Monorepo avec Vercel (backend en serverless)

> ⚠️ Nécessite un refactoring du backend pour utiliser des fonctions serverless au lieu d'un serveur Express persistant. Le stockage filesystem local doit être remplacé par un service cloud (S3, Cloudinary, etc.).

---

## Technologies utilisées

- **Frontend** : React 19, Axios, Canvas API, Tailwind CSS, heic2any
- **Backend** : Express.js, Multer, fs-extra, uuid, CORS

---

## Tests

### Frontend

```bash
cd frontend
npm test
```

### Backend

```bash
cd backend
npm test
```
