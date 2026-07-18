# 💰 FinTrack AI – AI-Powered Expense Ledger (Server)

A RESTful backend API for FinTrack AI that handles authentication, expense management, and AI-powered expense classification and analysis using Groq AI.

## 🌐 Live API

https://fintrack-ai-backend-u4u2.onrender.com

## 🔗 Client Repository

https://github.com/rakibmur420-source/FinTrack-AI-client

---

## ✨ Key Features

- JWT Authentication
- Email & Password Login
- Google OAuth Login
- Demo Account Login
- Expense CRUD Operations
- Search, Filter, Sort & Pagination
- AI Expense Classification
- AI Bulk Classification
- AI Expense Analysis
- CSV Upload Support
- Password Hashing with bcrypt
- Protected API Routes
- MongoDB Database
- RESTful API Architecture

---

## 📌 API Routes

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register User |
| POST | `/api/auth/login` | Login User |
| POST | `/api/auth/google` | Google Login |
| POST | `/api/auth/demo-login` | Demo Account Login |

---

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get All Expenses |
| GET | `/api/expenses/mine` | Current User Expenses |
| GET | `/api/expenses/:id` | Expense Details |
| POST | `/api/expenses` | Add Expense |
| DELETE | `/api/expenses/:id` | Delete Expense |

---

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/classify` | AI Classify Expense |
| POST | `/api/ai/classify/bulk` | AI Bulk Classification |
| POST | `/api/ai/analyze` | AI Expense Analysis |

---

## 📦 Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- Groq SDK
- Multer
- CSV Parse

---

## 📦 NPM Packages

| Package | Purpose |
|----------|---------|
| express | Web Framework |
| typescript | Type Safety |
| mongoose | MongoDB ODM |
| jsonwebtoken | JWT Authentication |
| bcryptjs | Password Hashing |
| google-auth-library | Google OAuth |
| groq-sdk | AI Processing |
| multer | File Upload |
| csv-parse | CSV Parsing |
| cors | Cross-Origin Requests |
| dotenv | Environment Variables |

---

## 🔐 Environment Variables

Create a `.env` file.

```env
PORT=5000

MONGODB_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

JWT_EXPIRES_IN=7d

GROQ_API_KEY=your_groq_api_key

GOOGLE_CLIENT_ID=your_google_client_id

CLIENT_URL=your_frontend_url
```

---

## 🚀 Getting Started

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Build project

```bash
npm run build
```

Run production server

```bash
npm start
```

---

## 💻 Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- Groq AI

---

Built for **SCIC-13 Assignment 5 — Agentic AI Project**
