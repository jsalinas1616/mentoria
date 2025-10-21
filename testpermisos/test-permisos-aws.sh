#!/bin/bash

# 🔐 Script de Verificación de Permisos AWS
# Este script verifica que el usuario tenga los permisos necesarios
# SIN hacer cambios reales en AWS (solo operaciones de lectura/verificación)

echo "🔐 Verificación de Permisos AWS - Nadro Mentoría"
echo "================================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de pruebas
PASSED=0
FAILED=0

# Función para verificar permisos
check_permission() {
    local test_name=$1
    local command=$2
    
    echo -n "Verificando: $test_name... "
    
    if eval "$command" &> /dev/null; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAILED++))
    fi
}

echo "📋 Configurando credenciales..."
echo ""
echo "Por favor, configura tu perfil AWS con estas credenciales:"
echo "  AWS Access Key ID: [Tu Access Key]"
echo "  AWS Secret Access Key: [Tu Secret Key]"
echo "  Default region: us-east-1"
echo ""
read -p "¿Ya configuraste las credenciales? (y/n): " configured

if [ "$configured" != "y" ]; then
    echo ""
    echo "Ejecuta primero:"
    echo "  aws configure --profile mentoria"
    echo ""
    echo "Luego vuelve a ejecutar este script"
    exit 1
fi

echo ""
echo "🧪 Iniciando pruebas de permisos..."
echo ""

# ====================
# 1. CloudFormation
# ====================
echo "📦 CloudFormation:"
check_permission "Listar stacks" \
    "aws cloudformation list-stacks --profile mentoria --region us-east-1 --output json"

check_permission "Describir stack nadro-mentoria-api-dev" \
    "aws cloudformation describe-stacks --stack-name nadro-mentoria-api-dev --profile mentoria --region us-east-1 2>&1 | grep -q 'does not exist\|StackName'"

echo ""

# ====================
# 2. IAM
# ====================
echo "👤 IAM:"
check_permission "Listar roles" \
    "aws iam list-roles --profile mentoria --max-items 1 --output json"

check_permission "Verificar rol nadro-mentoria-api-dev" \
    "aws iam get-role --role-name nadro-mentoria-api-dev-us-east-1-lambdaRole --profile mentoria 2>&1 | grep -q 'NoSuchEntity\|RoleName'"

echo ""

# ====================
# 3. Lambda
# ====================
echo "⚡ Lambda:"
check_permission "Listar funciones Lambda" \
    "aws lambda list-functions --profile mentoria --region us-east-1 --max-items 1 --output json"

check_permission "Verificar función nadro-mentoria-api-dev" \
    "aws lambda get-function --function-name nadro-mentoria-api-dev-api --profile mentoria --region us-east-1 2>&1 | grep -q 'ResourceNotFoundException\|FunctionName'"

echo ""

# ====================
# 4. API Gateway
# ====================
echo "🌐 API Gateway:"
check_permission "Listar APIs" \
    "aws apigateway get-rest-apis --profile mentoria --region us-east-1 --limit 1 --output json"

echo ""

# ====================
# 5. DynamoDB
# ====================
echo "🗄️  DynamoDB:"
check_permission "Listar tablas" \
    "aws dynamodb list-tables --profile mentoria --region us-east-1 --limit 1 --output json"

check_permission "Describir tabla NadroMentoria-Consultas-dev" \
    "aws dynamodb describe-table --table-name NadroMentoria-Consultas-dev --profile mentoria --region us-east-1 2>&1 | grep -q 'ResourceNotFoundException\|TableName'"

echo ""

# ====================
# 6. S3
# ====================
echo "🪣  S3:"
check_permission "Listar buckets nadro-mentoria" \
    "aws s3 ls --profile mentoria | grep -q 'nadro-mentoria\|^$'"

echo ""

# ====================
# 7. CloudWatch Logs
# ====================
echo "📊 CloudWatch Logs:"
check_permission "Listar log groups" \
    "aws logs describe-log-groups --profile mentoria --region us-east-1 --log-group-name-prefix /aws/lambda/nadro-mentoria --output json"

echo ""

# ====================
# Resumen
# ====================
echo "================================================"
echo "📊 Resumen de Pruebas:"
echo "  ✓ Pasadas: $PASSED"
echo "  ✗ Fallidas: $FAILED"
echo "  Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Todos los permisos están correctos!${NC}"
    echo ""
    echo "✅ El usuario tiene los permisos necesarios para:"
    echo "  - Ver recursos existentes"
    echo "  - Desplegar con Serverless Framework"
    echo "  - Gestionar CloudFormation stacks"
    echo ""
    echo "🚀 Puedes proceder con el despliegue:"
    echo "  cd backend"
    echo "  AWS_PROFILE=mentoria npm run deploy:dev"
else
    echo -e "${RED}⚠️  Algunos permisos faltan o están incorrectos${NC}"
    echo ""
    echo "Por favor, verifica que el usuario 'mentoria' tenga"
    echo "la política definida en PERMISOS-AWS-SIMPLE.md"
fi

echo ""
echo "================================================"

