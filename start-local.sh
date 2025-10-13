#!/bin/bash

# Script para iniciar el proyecto en LOCAL
# Uso: ./start-local.sh

echo "🚀 Iniciando Nadro Mentoría en LOCAL..."
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instálalo desde https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js versión: $(node -v)"
echo ""

# Backend
echo "📦 Iniciando Backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias del backend..."
    npm install
fi

# Iniciar backend en background
npm run dev &
BACKEND_PID=$!
echo "✅ Backend iniciado (PID: $BACKEND_PID) en http://localhost:3001"
echo ""

# Esperar 3 segundos para que el backend inicie
sleep 3

# Frontend
echo "📦 Iniciando Frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias del frontend..."
    npm install
fi

echo "✅ Frontend iniciando en http://localhost:3000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 URLs disponibles:"
echo "   Formulario público: http://localhost:3000/"
echo "   Login admin:        http://localhost:3000/admin/login"
echo "   API Backend:        http://localhost:3001/api"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  Para detener, presiona Ctrl+C"
echo ""

# Iniciar frontend (esto bloqueará el terminal)
npm start

# Cuando se interrumpa el frontend, matar el backend
kill $BACKEND_PID
echo "🛑 Aplicación detenida"

