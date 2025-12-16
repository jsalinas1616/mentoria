#!/bin/bash

# 🚀 Script de Despliegue Frontend - Nadro Mentoría
# Despliega el frontend en S3
# Uso: ./deploy-frontend.sh [stage] [profile]
# Ejemplo: ./deploy-frontend.sh dev-jul mentoria

set -e  # Salir si hay error

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
STAGE=${1:-dev}
PROFILE=${2:-mentoria}
# Permitir sobreescribir el bucket por variable de entorno (BUCKET_NAME)
BUCKET_NAME=${BUCKET_NAME:-nadro-mentoria-frontend-${STAGE}}
REGION="us-east-1"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Desplegando Frontend - Nadro Mentoría${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  📋 Stage:   ${YELLOW}${STAGE}${NC}"
echo -e "  👤 Profile: ${YELLOW}${PROFILE}${NC}"
echo -e "  🪣 Bucket:  ${YELLOW}${BUCKET_NAME}${NC}"
echo -e "  🌍 Región:  ${YELLOW}${REGION}${NC}"
echo ""

# Verificar AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI no está instalado${NC}"
    exit 1
fi

# Verificar credenciales
echo -e "${YELLOW}🔍 Verificando credenciales...${NC}"
AWS_ACCOUNT=$(aws sts get-caller-identity --profile ${PROFILE} --query Account --output text 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: No se puede autenticar con el perfil '${PROFILE}'${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Autenticado en cuenta: ${AWS_ACCOUNT}${NC}"
echo ""

# Paso 1: Instalar dependencias
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Instalando dependencias...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
    echo ""
fi

# Paso 2: Build del frontend
echo -e "${YELLOW}🏗️  Construyendo frontend...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir frontend${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build completado${NC}"
echo ""

# Paso 3: Verificar/Crear bucket S3
echo -e "${YELLOW}🪣 Verificando bucket S3...${NC}"

# Usar HeadBucket en lugar de ListBucket (no requiere s3:ListAllMyBuckets)
if aws s3api head-bucket --bucket ${BUCKET_NAME} --profile ${PROFILE} 2>/dev/null; then
    echo -e "${BLUE}ℹ️  Bucket ya existe${NC}"
else
    echo -e "${YELLOW}📦 Creando bucket...${NC}"
    if aws s3api create-bucket --bucket ${BUCKET_NAME} --profile ${PROFILE} --region ${REGION} 2>/dev/null; then
        echo -e "${GREEN}✅ Bucket creado${NC}"
        echo -e "${YELLOW}⏳ Esperando propagación (3 segundos)...${NC}"
        sleep 3
    else
        echo -e "${RED}❌ Error al crear bucket${NC}"
        echo -e "${YELLOW}Intentando continuar de todos modos...${NC}"
    fi
fi
echo ""

# Paso 4: Configurar hosting estático
echo -e "${YELLOW}🌐 Configurando hosting estático...${NC}"
aws s3 website s3://${BUCKET_NAME} \
  --index-document index.html \
  --error-document index.html \
  --profile ${PROFILE}
echo -e "${GREEN}✅ Hosting estático configurado${NC}"
echo ""

# Paso 5: Configurar CORS
echo -e "${YELLOW}🔗 Configurando CORS...${NC}"
aws s3api put-bucket-cors --bucket ${BUCKET_NAME} --profile ${PROFILE} --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"]
    }
  ]
}' 2>/dev/null && echo -e "${GREEN}✅ CORS configurado${NC}" || echo -e "${BLUE}ℹ️  CORS ya configurado${NC}"
echo ""

# Paso 6: Desbloquear acceso público
echo -e "${YELLOW}🔓 Desbloqueando acceso público...${NC}"
aws s3api put-public-access-block --bucket ${BUCKET_NAME} --profile ${PROFILE} --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
echo -e "${GREEN}✅ Acceso público desbloqueado${NC}"
echo ""

# Paso 7: Configurar política de bucket público
echo -e "${YELLOW}🔐 Configurando política pública...${NC}"
aws s3api put-bucket-policy --bucket ${BUCKET_NAME} --profile ${PROFILE} --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [
    {
      \"Sid\": \"PublicReadGetObject\",
      \"Effect\": \"Allow\",
      \"Principal\": \"*\",
      \"Action\": \"s3:GetObject\",
      \"Resource\": \"arn:aws:s3:::${BUCKET_NAME}/*\"
    }
  ]
}"
echo -e "${GREEN}✅ Política configurada${NC}"
echo ""

# Paso 8: Subir archivos
echo -e "${YELLOW}📤 Subiendo archivos a S3...${NC}"
aws s3 sync build/ s3://${BUCKET_NAME} --profile ${PROFILE} --delete --quiet
echo -e "${GREEN}✅ Archivos subidos${NC}"
echo ""

# URLs
FRONTEND_URL="http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"

# Resultado
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DESPLIEGUE COMPLETADO EXITOSAMENTE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🌐 URLs de tu aplicación:${NC}"
echo ""
echo -e "  📱 Formulario Público:"
echo -e "     ${YELLOW}${FRONTEND_URL}${NC}"
echo ""
echo -e "  🔐 Login Admin:"
echo -e "     ${YELLOW}${FRONTEND_URL}/#/admin/login${NC}"
echo ""
echo -e "${GREEN}📊 Información de recursos:${NC}"
echo ""
echo -e "  🪣 Bucket S3:    ${YELLOW}${BUCKET_NAME}${NC}"
echo -e "  🌍 Región:       ${YELLOW}${REGION}${NC}"
echo -e "  📋 Stage:        ${YELLOW}${STAGE}${NC}"
echo -e "  👤 AWS Account:  ${YELLOW}${AWS_ACCOUNT}${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🎉 ¡Frontend desplegado con éxito!${NC}"
echo ""
