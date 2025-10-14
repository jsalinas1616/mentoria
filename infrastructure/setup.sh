#!/bin/bash

echo "🚀 Configurando Nadro Mentoría - Sistema de Consulta Integral"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI no está instalado${NC}"
    echo "Por favor instala AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI encontrado${NC}"

# Verificar credenciales de AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ Credenciales de AWS no configuradas${NC}"
    echo "Ejecuta: aws configure"
    exit 1
fi

echo -e "${GREEN}✅ Credenciales de AWS configuradas${NC}"
echo ""

# Crear tablas de DynamoDB
echo "📦 Creando tablas de DynamoDB..."
cd infrastructure
node create-dynamodb-tables.js

echo ""
echo "👤 Creando usuario inicial..."
node create-initial-user.js

echo ""
echo -e "${GREEN}✅ Configuración completada${NC}"
echo ""
echo "📝 Próximos pasos:"
echo "1. Backend: cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm start"
echo "3. Abre http://localhost:3000 en tu navegador"
echo ""
echo "🔐 Credenciales de acceso inicial:"
echo "   Email: admin@nadro.com"
echo "   Password: admin123"



