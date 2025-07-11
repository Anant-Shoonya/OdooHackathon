# HackToHell Setup Guide

## ✅ Backend Setup

1. Created `backend/` folder
2. In backend, Ran:
   npm init -y
   npm install express mongoose cors dotenv
   npm install --save-dev nodemon

3. Created folder structure:
   backend/
   ├── index.js
   ├── .env
   ├── routes/
   ├── controllers/
   ├── models/
   ├── middleware/
   ├── utils/

4. Scripts added in `package.json`:
   "scripts": {
   "start": "node index.js",
   "dev": "nodemon index.js"
   }

5. To run backend:
   npm run dev

---

## ✅ Frontend Setup

1. Created `frontend/` folder
2. In frontend, Ran:
   npm create vite@latest .

3. During prompts:

- Select React
- Select JavaScript

4. Then:
   npm install
   npm run dev
