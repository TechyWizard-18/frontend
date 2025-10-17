# Deployment Guide for Render

## Issue Found: Frontend Environment Variable

The main issue causing the "server error" during login was that the frontend `.env` file was pointing to `http://localhost:5000` instead of your production backend URL.

## Step-by-Step Deployment Fix

### 1. Frontend Environment Variables (.env in root folder)

**For Production (Render):**
```env
VITE_API_URL=https://your-backend-app-name.onrender.com
```

**For Local Development:**
```env
VITE_API_URL=http://localhost:5000
```

**Important:** Replace `your-backend-app-name` with your actual Render backend service URL.

### 2. Backend Environment Variables (On Render Dashboard)

Make sure these are set in your Render backend service:

```
MONGO_URI=mongodb+srv://ZeissTstar:8tQl4Zea4rOZ8OQM@cluster-0.ugyffj8.mongodb.net/customer_db?retryWrites=true&w=majority&appName=Cluster-0
JWT_SECRET=your_super_long_random_secret_string_here_12345
NODE_ENV=production
PORT=5000
```

### 3. Frontend Environment Variables (On Render Dashboard)

Make sure to set this in your Render frontend service:

```
VITE_API_URL=https://your-backend-app-name.onrender.com
```

### 4. CORS Configuration Check

Your backend already has the correct CORS setup in `server.js`:

```javascript
const allowedOrigins = [
    'https://frontend-mx20.onrender.com', // Your deployed frontend URL
    'http://localhost:5173',
    'http://localhost:3000'
];
```

Make sure this frontend URL matches your actual Render frontend URL.

### 5. After Making Changes

1. **Update the `.env` file** with your production backend URL
2. **Rebuild your frontend** on Render (or trigger a new deployment)
3. **Check the backend logs** on Render for any errors
4. **Check the browser console** for detailed error messages

### 6. Testing the Fix

1. Open your deployed frontend
2. Open browser DevTools (F12) → Console tab
3. Try to login
4. You should see: "Attempting login to: https://your-backend-app-name.onrender.com/api/users/login"
5. Check for any CORS errors or connection issues

## Common Issues and Solutions

### Issue: Still seeing "localhost" in requests
- **Solution:** Clear your browser cache and do a hard refresh (Ctrl+F5)
- **Solution:** Make sure you rebuilt the frontend after changing the .env file

### Issue: CORS error
- **Solution:** Verify the frontend URL is in the `allowedOrigins` array in server.js
- **Solution:** Redeploy the backend after making changes

### Issue: "Cannot connect to server"
- **Solution:** Make sure the backend service is running on Render
- **Solution:** Check if the VITE_API_URL is correct (no trailing slash)

### Issue: "JWT_SECRET is not defined"
- **Solution:** Add JWT_SECRET to backend environment variables on Render

## How to Check Logs on Render

1. Go to your Render dashboard
2. Click on your backend service
3. Go to "Logs" tab
4. Look for console.log messages like "Login attempt for username: ..."
5. Check for any error messages

## Security Notes

- Never commit `.env` files to git
- Always use environment variables for sensitive data
- In production, disable the `/register` endpoint (already done)
- Use strong JWT_SECRET in production

