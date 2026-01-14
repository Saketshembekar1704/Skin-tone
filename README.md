# Virtual Try-On Project

This project contains a virtual try-on application with skin tone detection powered by machine learning.

## 🚀 Quick Start

### Option 1: Using PowerShell Script (Recommended for Windows)
```powershell
.\start.ps1
```

### Option 2: Using Batch File
```cmd
start.bat
```

### Option 3: Manual Start (Old Way)

**Terminal 1 - Backend:**
```bash
cd skin-tone-backend/fast-api
# Activate virtual environment
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # Linux/Mac

# Start backend
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd skin-tone-frontend
npm run dev
```

## 📁 Project Structure

```
Skin-tone/
├── skin-tone-backend/      # FastAPI backend
│   └── fast-api/          # API implementation
├── skin-tone-frontend/     # React frontend
├── start.ps1              # PowerShell startup script
└── start.bat              # Batch startup script
```

## 🌐 Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://127.0.0.1:8000
- **API Docs:** http://127.0.0.1:8000/docs

## 🛠️ Requirements

### Backend
- Python 3.8+
- Virtual environment with dependencies installed
- FastAPI
- Uvicorn

### Frontend
- Node.js 16+
- npm or yarn

## 📝 Features

- AI-powered skin tone detection
- Virtual try-on color recommendations
- Modern, responsive UI with glassmorphism design
- Real-time image processing
- Interactive canvas for region selection

## 🎨 Tech Stack

**Backend:**
- FastAPI
- Python ML libraries
- OpenCV

**Frontend:**
- React
- Vite
- Modern CSS with animations

## 💡 Tips

- Use the startup scripts (`start.ps1` or `start.bat`) for the easiest development experience
- The scripts will automatically activate the virtual environment and start both servers
- Both servers support hot-reload for development

## 🐛 Troubleshooting

If the scripts don't work:
1. Make sure Python virtual environment is created and dependencies are installed
2. Ensure Node.js dependencies are installed (`npm install` in frontend directory)
3. Check that ports 8000 and 5173 are not in use
4. For PowerShell script issues, you may need to enable script execution:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
