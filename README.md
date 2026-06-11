# Unified Social Media OS (APSM)

A modern, full-stack application designed to unify social media management and analytics. This repository contains a Node.js/Express backend API and a premium React frontend dashboard configured to manage authentications and integrate OAuth channel connections (e.g. YouTube).

---

## 🚀 Project Status & Features

The project is structured as a monorepo with separate `backend` and `frontend` environments. The following core features have been fully implemented and verified:

### 1. Security & Authentication
- **User Authentication**: Secure Signup (`POST /auth/register`) and Login (`POST /auth/login`) workflows with password hashing via `bcrypt`.
- **JWT Authorization**: User sessions are authenticated using JSON Web Tokens (JWT) stored in the client's `localStorage` and sent in the HTTP `Authorization` header.
- **Middleware Fallback**: Express authentication middleware (`requireAuth`) supports token extraction from both the `Authorization` header and request query parameters (`?token=...`), which enables standard browser redirects to authenticate.

### 2. Platform Integrations (OAuth 2.0)
- **Initiation**: A "Connect YouTube" action triggers browser navigation to `GET /auth/youtube` to initiate Google's OAuth consent loop.
- **CSRF State Guarding**: Backend generates cryptographically secure, random state strings stored in a short-lived memory map (`pendingStates`) to prevent CSRF spoofing.
- **Exchange & Sync**: The OAuth callback exchanges authorization codes for tokens, queries the channel title, and upserts integration credentials.
- **Encrypted Storage**: Stored social credentials (access and refresh tokens) are encrypted inside MongoDB using **AES-256-CBC** with a secure `ENCRYPTION_KEY` configured in `.env`.
- **Token Refresh**: An automated token manager check runs prior to API requests. If a token is expired, it decrypts the refresh token, requests a new access token from Google, and updates the database.

### 3. User Interface (UI)
- **Design System**: A dark-theme glassmorphism interface styled using Tailwind CSS, implementing the custom Google Font `Inter`.
- **Views**:
  - **Login Page**: Credentials entry with loaders, validation, and error alert banners.
  - **Signup Page**: Matching layout supporting full names, emails, passwords, and password confirmation.
  - **Dashboard Page**: Renders user profile information and integration connection statuses (YouTube, Facebook, Instagram). Shows connected channel usernames, connection dates, and validation badges.
  - **Settings Page**: Acts as the landing pad for OAuth callbacks. Displays success/failure alerts based on callback queries and triggers a 5-second automatic countdown redirect to the dashboard.

---

## 📁 Repository Directory Structure

```text
APSM-incubien/
├── backend/                  # Express API Server
│   ├── config/               # Database and Platform Configs
│   ├── middleware/           # Auth and Error Handling Middlewares
│   ├── models/               # MongoDB Mongoose User Schema
│   ├── routes/               # Express auth and user endpoints
│   ├── utils/                # Token management / Auto-refresh
│   ├── .env.example          # Sample environment configurations
│   ├── server.js             # Main server entry point
│   └── package.json
│
├── frontend/                 # React SPA Client
│   ├── public/               # Static icons and assets
│   ├── src/
│   │   ├── components/       # Layouts (Navbar, Route Guards, SVGs)
│   │   ├── context/          # Auth state provider (AuthContext)
│   │   ├── pages/            # Login, Signup, Dashboard, Settings
│   │   ├── services/         # Axios API client (api.js)
│   │   ├── App.jsx           # Routing paths setup
│   │   └── main.jsx          # DOM entry point
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── vite.config.js        # Vite port configurations
│   └── package.json
│
└── README.md                 # Project Documentation (This file)
```

---

## ⚙️ Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JSON Web Tokens (JWT), Crypto, Axios.
- **Frontend**: React 19 (Hooks & Context API), React Router, Axios, Tailwind CSS (v3), Lucide React.
- **Bundler**: Vite.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18.0+)
- NPM
- A running MongoDB instance (or Atlas connection URI)

### 1. Clone & Checkout Branch
To run the setup created by Himanshu, checkout the `himanshu` branch:
```bash
git fetch origin
git checkout himanshu
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and configure the values:
   ```env
   PORT=5000
   BASE_URL=http://localhost:5000
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ENCRYPTION_KEY=your_aes_32_byte_hex_key
   YOUTUBE_CLIENT_ID=your_google_client_id
   YOUTUBE_CLIENT_SECRET=your_google_client_secret
   ```
   > Note: To generate a secure AES Encryption Key (64-character hex string representing 32 bytes), you can run:  
   > `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The API will listen at **`http://localhost:5000`**. You can verify that it is alive by visiting `http://localhost:5000/health`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The client will run on **`http://localhost:3000`** (strictly locked to port 3000 in `vite.config.js`).

---