#!/bin/bash

# 🚀 Script de Despliegue PRODUCCIÓN - Nadro Mentoría
# Despliega el frontend en S3 para PRODUCCIÓN
# Uso: ./deploy-frontend-nadro-prod.sh
# ⚠️  PRECAUCIÓN: Este script despliega a PRODUCCIÓN

set -e  # Salir si hay error

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuración PRODUCCIÓN
STAGE="prod"
PROFILE="prod-nadro"
BUCKET_NAME="nadro-mentoria-frontend-prod"
REGION="us-east-1"

echo ""
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}⚠️  DESPLIEGUE A PRODUCCIÓN ⚠️${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  📋 Stage:   ${YELLOW}${STAGE}${NC}"
echo -e "  👤 Profile: ${YELLOW}${PROFILE}${NC}"
echo -e "  🪣 Bucket:  ${YELLOW}${BUCKET_NAME}${NC}"
echo -e "  🌍 Región:  ${YELLOW}${REGION}${NC}"
echo ""
echo -e "${YELLOW}⚠️  Este despliegue afectará a usuarios REALES en producción${NC}"
echo ""

# CONFIRMACIÓN OBLIGATORIA
read -p "$(echo -e ${YELLOW}¿Estás seguro de desplegar a PRODUCCIÓN? \(escribe 'SI' para continuar\): ${NC})" CONFIRM
if [ "$CONFIRM" != "SI" ]; then
    echo -e "${RED}❌ Despliegue cancelado${NC}"
    exit 1
fi
echo ""

# Verificar AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI no está instalado${NC}"
    exit 1
fi

# Verificar credenciales
echo -e "${YELLOW}🔍 Verificando credenciales...${NC}, profile: ${PROFILE}"
AWS_ACCOUNT=$(aws sts get-caller-identity --profile ${PROFILE} --query Account --output text 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: No se puede autenticar con el perfil '${PROFILE}'${NC}"
    echo -e "${YELLOW}💡 Tip: Ejecuta 'aws-mfa --profile ${PROFILE}' primero${NC}"
    exit 1
fi

# Verificar que estamos en la cuenta correcta (975130647458)
EXPECTED_ACCOUNT="767398004339"
if [ "$AWS_ACCOUNT" != "$EXPECTED_ACCOUNT" ]; then
    echo -e "${RED}❌ Error: Cuenta AWS incorrecta${NC}"
    echo -e "${RED}   Esperada: ${EXPECTED_ACCOUNT}${NC}"
    echo -e "${RED}   Actual:   ${AWS_ACCOUNT}${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Autenticado en cuenta correcta: ${AWS_ACCOUNT}${NC}"
echo ""

# Verificar rama de Git (debe ser main o master)
if command -v git &> /dev/null && [ -d .git ]; then
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
        echo -e "${RED}⚠️  Advertencia: No estás en la rama main/master${NC}"
        echo -e "${YELLOW}   Rama actual: ${CURRENT_BRANCH}${NC}"
        read -p "$(echo -e ${YELLOW}¿Continuar de todos modos? \(escribe 'SI'\): ${NC})" CONFIRM_BRANCH
        if [ "$CONFIRM_BRANCH" != "SI" ]; then
            echo -e "${RED}❌ Despliegue cancelado${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ En rama correcta: ${CURRENT_BRANCH}${NC}"
    fi
    
    # Verificar cambios sin commitear
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Tienes cambios sin commitear${NC}"
        read -p "$(echo -e ${YELLOW}¿Continuar de todos modos? \(escribe 'SI'\): ${NC})" CONFIRM_CHANGES
        if [ "$CONFIRM_CHANGES" != "SI" ]; then
            echo -e "${RED}❌ Despliegue cancelado${NC}"
            exit 1
        fi
    fi
fi
echo ""

# Paso 1: Instalar dependencias
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Instalando dependencias...${NC}"
    npm ci  # Usa 'ci' para producción (más determinista)
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
    echo ""
else
    echo -e "${BLUE}ℹ️  Dependencias ya instaladas${NC}"
    echo ""
fi

# Paso 2: Build del frontend
echo -e "${YELLOW}🏗️  Construyendo frontend de PRODUCCIÓN...${NC}"
REACT_APP_STAGE=prod npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir frontend${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build completado${NC}"
echo ""

# Paso 3: Verificar/Crear bucket S3
echo -e "${YELLOW}🪣 Verificando bucket S3...${NC}"

if aws s3api head-bucket --bucket ${BUCKET_NAME} --profile ${PROFILE} 2>/dev/null; then
    echo -e "${BLUE}ℹ️  Bucket ya existe${NC}"
    
    # BACKUP del contenido actual (solo en producción)
    BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
    echo -e "${YELLOW}💾 Creando backup del contenido actual...${NC}"
    mkdir -p ../backups/${BACKUP_DIR}
    aws s3 sync s3://${BUCKET_NAME} ../backups/${BACKUP_DIR}/ --profile ${PROFILE} --quiet
    echo -e "${GREEN}✅ Backup guardado en: ../backups/${BACKUP_DIR}${NC}"
else
    echo -e "${YELLOW}📦 Creando bucket...${NC}"
    if aws s3api create-bucket --bucket ${BUCKET_NAME} --profile ${PROFILE} 2>/dev/null; then
        echo -e "${GREEN}✅ Bucket creado${NC}"
        echo -e "${YELLOW}⏳ Esperando propagación (5 segundos)...${NC}"
        sleep 5
    else
        echo -e "${RED}❌ Error al crear bucket${NC}"
        exit 1
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
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}' 2>/dev/null && echo -e "${GREEN}✅ CORS configurado${NC}" || echo -e "${BLUE}ℹ️  CORS ya configurado${NC}"
echo ""

# Paso 6: Desbloquear acceso público
echo -e "${YELLOW}🔓 Configurando acceso público...${NC}"
aws s3api put-public-access-block --bucket ${BUCKET_NAME} --profile ${PROFILE} --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
echo -e "${GREEN}✅ Acceso público configurado${NC}"
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

# Paso 8: Subir archivos CON CONFIRMACIÓN
echo -e "${YELLOW}📤 ¿Subir archivos a S3 de PRODUCCIÓN?${NC}"
read -p "$(echo -e ${YELLOW}Escribe 'DEPLOY' para confirmar: ${NC})" CONFIRM_UPLOAD
if [ "$CONFIRM_UPLOAD" != "DEPLOY" ]; then
    echo -e "${RED}❌ Subida cancelada${NC}"
    exit 1
fi

echo -e "${YELLOW}📤 Subiendo archivos a S3...${NC}"
# Subir con cache-control para mejor rendimiento
aws s3 sync build/ s3://${BUCKET_NAME} --profile ${PROFILE} \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "asset-manifest.json" \
  --quiet

# index.html sin cache (siempre la última versión)
aws s3 cp build/index.html s3://${BUCKET_NAME}/index.html --profile ${PROFILE} \
  --cache-control "no-cache, no-store, must-revalidate" \
  --metadata-directive REPLACE \
  --quiet

echo -e "${GREEN}✅ Archivos subidos${NC}"
echo ""

# URLs
FRONTEND_URL="http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"

# Resultado
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DESPLIEGUE A PRODUCCIÓN COMPLETADO${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🌐 URLs PRODUCCIÓN:${NC}"
echo ""
echo -e "  📱 URL Principal:"
echo -e "     ${YELLOW}${FRONTEND_URL}${NC}"
echo ""
echo -e "  🔐 Login Admin:"
echo -e "     ${YELLOW}${FRONTEND_URL}/#/admin/login${NC}"
echo ""
echo -e "${GREEN}📊 Recursos PRODUCCIÓN:${NC}"
echo ""
echo -e "  🪣 Bucket:       ${YELLOW}${BUCKET_NAME}${NC}"
echo -e "  🌍 Región:       ${YELLOW}${REGION}${NC}"
echo -e "  📋 Stage:        ${YELLOW}${STAGE}${NC}"
echo -e "  👤 AWS Account:  ${YELLOW}${AWS_ACCOUNT}${NC}"
echo ""
echo -e "${MAGENTA}🔍 VERIFICACIÓN POST-DEPLOY:${NC}"
echo -e "  1. Verifica que la app cargue: ${FRONTEND_URL}"
echo -e "  2. Prueba el login con un usuario de prueba"
echo -e "  3. Verifica las funcionalidades críticas"
echo -e "  4. Monitorea los logs del backend"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🎉 ¡Frontend de PRODUCCIÓN desplegado!${NC}"
echo ""


