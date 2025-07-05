# 🚀 Deploy Your Machi Koro Game Online

## Quick Deploy to Railway (Recommended)

### Step 1: Create GitHub Repository
1. Go to https://github.com/
2. Click "New repository"
3. Name it "machi-koro-multiplayer"
4. Make it public
5. Don't initialize with README (we already have files)

### Step 2: Upload Your Files
1. In your new repository, click "uploading an existing file"
2. Drag and drop all your project files:
   - `index.html`
   - `server.js`
   - `package.json`
   - `railway.json`
   - `README.md`
3. Click "Commit changes"

### Step 3: Deploy to Railway
1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your "machi-koro-multiplayer" repository
6. Railway will automatically detect it's a Node.js app
7. Click "Deploy Now"

### Step 4: Get Your Public URL
1. Once deployed, Railway will give you a URL like:
   `https://your-app-name.railway.app`
2. This URL will work worldwide!

## Alternative: Deploy to Render

### Step 1: Create Render Account
1. Go to https://render.com/
2. Sign up with GitHub

### Step 2: Create Web Service
1. Click "New +"
2. Select "Web Service"
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Click "Create Web Service"

### Step 3: Get Your URL
1. Render will give you a URL like:
   `https://your-app-name.onrender.com`

## 🎮 After Deployment

Once deployed, your friends can:
1. Go to your public URL
2. Enter their name
3. Join your game with the code you share
4. Play from anywhere in the world!

## 🔧 Troubleshooting

**If deployment fails:**
- Make sure all files are uploaded to GitHub
- Check that `package.json` has the correct dependencies
- Verify `server.js` is the main file

**If the game doesn't work:**
- Check the deployment logs
- Make sure the port is set correctly (Railway/Render will set PORT environment variable)

## 📱 Benefits of Cloud Deployment

✅ **Always accessible** - No need to keep your computer running  
✅ **Reliable connections** - Works from anywhere in the world  
✅ **No tunneling issues** - Direct internet access  
✅ **Free hosting** - Both Railway and Render have free tiers  
✅ **Automatic scaling** - Handles multiple players easily 