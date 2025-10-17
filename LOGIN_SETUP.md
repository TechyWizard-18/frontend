# 🔐 Login System Setup Guide

## Quick Start - Create Admin Credentials

### Step 1: Make sure your MongoDB connection is working
Your server should be running on `http://localhost:5000`

### Step 2: Create a new admin user

Open a **NEW terminal** in the `server` folder and run:

```bash
cd server
node createUser.js admin1 admin123
```

Replace `admin` and `admin123` with your desired username and password.

**Example Output:**
```
✅ Connected to MongoDB
✅ User created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Username: admin
🔑 Password: admin123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ You can now login with these credentials!
```

### Step 3: Restart Your Frontend Dev Server

**IMPORTANT:** You must restart your frontend for the environment variables to work!

```bash
npm run dev
```

### Step 4: Login

Go to `http://localhost:5173/login` (or your frontend URL) and login with the credentials you created.

---

## Troubleshooting

### ❌ "Cannot read properties of undefined"
- **Solution:** Restart your frontend dev server (`npm run dev`)
- The `.env` file needs a fresh server restart to load

### ❌ "User already exists"
- **Solution:** The username is already taken. Choose a different username or login with existing credentials

### ❌ "Invalid username or password"
- **Solution:** Double-check your username and password. Usernames are case-insensitive

### ❌ "Server Error" 
- **Solution:** Make sure MongoDB is connected. Check your `MONGO_URI` in `server/.env`

---

## Alternative: Use API to Create User

You can also use Postman or any HTTP client:

**POST** `http://localhost:5000/api/users/register`

**Body (JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

---

## Security Notes

- Passwords are hashed using bcrypt before storing
- JWT tokens expire after 30 days
- Usernames are stored in lowercase
- Minimum password length: 6 characters

