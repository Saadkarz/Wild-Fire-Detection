@echo off
chcp 65001 >nul
title 🔥 WildfireGuard AI - Launcher

:: ============================================================
::     WildfireGuard AI - Application Launcher
::     Détection de Feux de Forêt par Intelligence Artificielle
:: ============================================================

color 0A

echo.
echo  ╔═══════════════════════════════════════════════════════════════╗
echo  ║                                                               ║
echo  ║   🔥🌲  W I L D F I R E G U A R D   A I  🌲🔥                ║
echo  ║                                                               ║
echo  ║   Advanced Wildfire Detection System                         ║
echo  ║   Powered by TensorFlow ^& YOLOv8                             ║
echo  ║                                                               ║
echo  ╚═══════════════════════════════════════════════════════════════╝
echo.

:: Définir le chemin du projet
set PROJECT_PATH=C:\Users\karzo\OneDrive\Bureau\study\PFA\Wild-Fire-Detection

:: Vérifier si le dossier existe
if not exist "%PROJECT_PATH%" (
    color 0C
    echo  ❌ ERREUR: Le dossier du projet n'existe pas!
    echo     Chemin: %PROJECT_PATH%
    echo.
    pause
    exit /b 1
)

echo  📂 Projet trouvé: %PROJECT_PATH%
echo.

:: ============================================================
:: Étape 1: Démarrer le Backend (FastAPI)
:: ============================================================
echo  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  🚀 Démarrage du Backend (FastAPI sur port 8000)...
echo  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

:: Lancer le backend dans une nouvelle fenêtre
start "🔧 WildfireGuard Backend" cmd /k "cd /d %PROJECT_PATH%\backend && call venv\Scripts\activate && echo. && echo  ✅ Environnement virtuel activé && echo  🌐 Démarrage de uvicorn... && echo. && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Attendre que le backend démarre
echo  ⏳ Attente du démarrage du backend (10 secondes)...
timeout /t 10 /nobreak >nul

:: ============================================================
:: Étape 2: Démarrer le Frontend (Vite/React)
:: ============================================================
echo.
echo  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  🎨 Démarrage du Frontend (React/Vite sur port 5173)...
echo  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

:: Lancer le frontend dans une nouvelle fenêtre
start "🎨 WildfireGuard Frontend" cmd /k "cd /d %PROJECT_PATH%\frontend && echo. && echo  📦 Démarrage de Vite... && echo. && npm run dev"

:: Attendre que le frontend démarre
echo  ⏳ Attente du démarrage du frontend (8 secondes)...
timeout /t 8 /nobreak >nul

:: ============================================================
:: Étape 3: Ouvrir le navigateur
:: ============================================================
echo.
echo  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  🌐 Ouverture de l'application dans le navigateur...
echo  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

:: Ouvrir l'application frontend
start "" "http://localhost:5173"

:: Ouvrir la documentation API (optionnel)
:: start "" "http://localhost:8000/docs"

:: ============================================================
:: Afficher les informations
:: ============================================================
echo.
echo  ╔═══════════════════════════════════════════════════════════════╗
echo  ║                  ✅ APPLICATION LANCÉE !                      ║
echo  ╠═══════════════════════════════════════════════════════════════╣
echo  ║                                                               ║
echo  ║   🌐 Frontend:     http://localhost:5173                      ║
echo  ║   🔧 Backend API:  http://localhost:8000                      ║
echo  ║   📖 API Docs:     http://localhost:8000/docs                 ║
echo  ║                                                               ║
echo  ╠═══════════════════════════════════════════════════════════════╣
echo  ║                                                               ║
echo  ║   💡 Pour arrêter l'application:                              ║
echo  ║      Fermez les fenêtres Backend et Frontend                  ║
echo  ║                                                               ║
echo  ╚═══════════════════════════════════════════════════════════════╝
echo.

color 0B
echo  🔥 WildfireGuard AI est prêt à détecter les feux de forêt!
echo.

:: Garder cette fenêtre ouverte
pause
