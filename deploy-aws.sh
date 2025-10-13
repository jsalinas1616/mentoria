#!/bin/bash

# Script para desplegar el proyecto a AWS Lambda
# Uso: ./deploy-aws.sh

echo "☁️  Desplegando Nadro Mentoría a AWS Lambda..."
echo ""

# Verificar AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI no está instalado. Instálalo desde:"
    echo "   https://aws.amazon.com/cli/"
    exit 1
fi

# Verificar configuración AWS
echo "🔍 Verificando configuración de AWS..."
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ AWS CLI no está configurado correctamente."
    echo "   Ejecuta: aws configure"
    exit 1
fi

echo "✅ AWS Account: $AWS_ACCOUNT"
AWS_REGION=$(aws configure get region)
echo "✅ AWS Region: $AWS_REGION"
echo ""

# Verificar Serverless Framework
if ! command -v serverless &> /dev/null; then
    echo "📦 Instalando Serverless Framework..."
    npm install -g serverless
fi

# ==========================================
# PASO 1: Desplegar Backend (Lambda)
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 PASO 1: Desplegando Backend a Lambda"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd backend

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias..."
    npm install
fi

# Deploy
echo "🚀 Desplegando Lambda..."
serverless deploy

if [ $? -ne 0 ]; then
    echo "❌ Error al desplegar backend"
    exit 1
fi

# Obtener la URL del API Gateway
API_URL=$(serverless info --verbose | grep -oP 'https://[^ ]+' | head -1)
echo ""
echo "✅ Backend desplegado exitosamente"
echo "   API URL: $API_URL"
echo ""

# Guardar URL para el frontend
echo "$API_URL" > ../frontend/.api-url.tmp

# ==========================================
# PASO 2: Build del Frontend
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 PASO 2: Building Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd ../frontend

# Crear archivo .env.production con la URL del API
echo "REACT_APP_API_URL=${API_URL}/api" > .env.production
echo "✅ Configuración de producción creada"

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias..."
    npm install
fi

# Build
echo "🏗️  Creando build de producción..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error al crear build del frontend"
    exit 1
fi

echo "✅ Build completado"
echo ""

# ==========================================
# PASO 3: Desplegar Frontend a S3
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 PASO 3: Desplegando Frontend a S3"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Nombre del bucket (puedes cambiarlo)
BUCKET_NAME="nadro-mentoria-frontend-$(date +%s)"

echo "🪣 Creando bucket S3: $BUCKET_NAME"
aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION 2>/dev/null || echo "   Bucket ya existe o error al crear"

echo "⚙️  Configurando bucket como sitio web..."
aws s3 website s3://$BUCKET_NAME \
    --index-document index.html \
    --error-document index.html

echo "📤 Subiendo archivos..."
aws s3 sync build/ s3://$BUCKET_NAME --delete

echo "🌐 Configurando permisos públicos..."
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [
    {
      \"Sid\": \"PublicReadGetObject\",
      \"Effect\": \"Allow\",
      \"Principal\": \"*\",
      \"Action\": \"s3:GetObject\",
      \"Resource\": \"arn:aws:s3:::$BUCKET_NAME/*\"
    }
  ]
}"

FRONTEND_URL="http://${BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETADO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 URLs de tu aplicación:"
echo ""
echo "   🌐 Frontend (Usuarios):"
echo "      $FRONTEND_URL"
echo ""
echo "   🌐 Frontend Admin:"
echo "      $FRONTEND_URL/admin/login"
echo ""
echo "   🔌 Backend API:"
echo "      $API_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💾 Guardando URLs en urls-produccion.txt..."
cat > ../URLS-PRODUCCION.txt << EOF
# URLs de Producción - Nadro Mentoría
# Generado el: $(date)

## Frontend
Formulario público: $FRONTEND_URL
Login Admin:        $FRONTEND_URL/admin/login

## Backend
API URL:            $API_URL

## AWS Resources
S3 Bucket:          $BUCKET_NAME
Lambda Function:    nadro-mentoria-api-dev (o similar)
Region:             $AWS_REGION
EOF

echo "✅ URLs guardadas en URLS-PRODUCCION.txt"
echo ""
echo "🎉 ¡Deployment completado exitosamente!"
echo ""

# Cleanup
rm -f ../frontend/.api-url.tmp

cd ..

