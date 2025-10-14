#!/bin/bash

echo "🚀 Iniciando Nadro Mentoría en modo desarrollo..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar que las dependencias estén instaladas
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias del frontend...${NC}"
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias del backend...${NC}"
    cd backend && npm install && cd ..
fi

echo -e "${GREEN}✅ Dependencias listas${NC}"
echo ""

# Verificar si las tablas de DynamoDB existen
echo "🔍 Verificando configuración de AWS..."
if ! aws dynamodb describe-table --table-name NadroMentoria-Consultas &> /dev/null; then
    echo -e "${YELLOW}⚠️  Las tablas de DynamoDB no existen${NC}"
    echo "Ejecutando configuración inicial..."
    cd infrastructure && npm run setup && cd ..
fi

echo ""
echo -e "${GREEN}🚀 Iniciando servicios...${NC}"
echo ""
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Credenciales: admin@nadro.com / admin123"
echo ""

# Iniciar backend en background
cd backend
npm run dev &
BACKEND_PID=$!

# Esperar un poco para que el backend inicie
sleep 3

# Iniciar frontend
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ Servicios iniciados${NC}"
echo "Para detener: Ctrl+C"
echo ""

# Esperar a que el usuario detenga
wait $BACKEND_PID $FRONTEND_PID



