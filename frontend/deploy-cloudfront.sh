#!/bin/bash

# Script de despliegue para Frontend con CloudFront
# Nadro Mentoría - Sistema Integral

set -e

BUCKET_NAME="nadro-mentoria-frontend-1760378806"
CLOUDFRONT_ID="E26HPGOKVFK2W3"
CLOUDFRONT_URL="https://d2y013h5yg35nu.cloudfront.net"

echo "🚀 Desplegando Frontend de Nadro Mentoría..."
echo ""

# 1. Build
echo "📦 Paso 1: Construyendo aplicación..."
npm run build
echo "✅ Build completado"
echo ""

# 2. Sync a S3
echo "☁️  Paso 2: Subiendo archivos a S3..."
aws s3 sync build/ s3://${BUCKET_NAME} --delete --region us-east-1
echo "✅ Archivos subidos a S3"
echo ""

# 3. Invalidar caché de CloudFront
echo "🔄 Paso 3: Invalidando caché de CloudFront..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id ${CLOUDFRONT_ID} \
  --paths "/*" \
  --region us-east-1 \
  --query 'Invalidation.Id' \
  --output text)

echo "✅ Invalidación creada: ${INVALIDATION_ID}"
echo ""

# 4. Verificar estado
echo "📊 Verificando estado de CloudFront..."
STATUS=$(aws cloudfront get-distribution \
  --id ${CLOUDFRONT_ID} \
  --query "Distribution.Status" \
  --output text \
  --region us-east-1)

echo "   Estado: ${STATUS}"
echo ""

# 5. Resumen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Despliegue completado exitosamente"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 URL de producción:"
echo "   ${CLOUDFRONT_URL}"
echo ""
echo "⏰ La caché se invalidará en 1-2 minutos"
echo ""
echo "💡 Tip: Puedes verificar el estado con:"
echo "   aws cloudfront get-distribution --id ${CLOUDFRONT_ID}"
echo ""

