# 🧪 Guía de Prueba de Permisos AWS

## 📋 **Información de Acceso**

- **Console URL**: https://julian-salinas.signin.aws.amazon.com/console
- **Usuario**: `mentoria`
- **Password**: `gBR38@]*`
- **Cuenta AWS**: `975130647458`
- **Región**: `us-east-1`

---

## 🎯 **Objetivo**

Verificar que el usuario `mentoria` tiene los permisos correctos definidos en `PERMISOS-AWS-SIMPLE.md` para desplegar el sistema con Serverless Framework.

---

## 🔧 **Opción 1: Prueba Rápida con Script (Recomendado)**

### **Paso 1: Configurar AWS CLI**

```bash
# Configurar perfil AWS
aws configure --profile mentoria

# Ingresa cuando te lo pida:
# AWS Access Key ID: [Solicítalo al administrador]
# AWS Secret Access Key: [Solicítalo al administrador]
# Default region name: us-east-1
# Default output format: json
```

### **Paso 2: Ejecutar Script de Prueba**

```bash
# Dar permisos de ejecución
chmod +x test-permisos-aws.sh

# Ejecutar prueba
./test-permisos-aws.sh
```

### **Paso 3: Interpretar Resultados**

El script verificará:
- ✅ **CloudFormation**: Listar y describir stacks
- ✅ **IAM**: Listar roles y verificar roles específicos
- ✅ **Lambda**: Listar funciones y verificar funciones específicas
- ✅ **API Gateway**: Listar APIs
- ✅ **DynamoDB**: Listar y describir tablas
- ✅ **S3**: Listar buckets
- ✅ **CloudWatch Logs**: Listar log groups

**Resultado Esperado:**
```
📊 Resumen de Pruebas:
  ✓ Pasadas: 12
  ✗ Fallidas: 0
  Total: 12

🎉 ¡Todos los permisos están correctos!
```

---

## 🖥️ **Opción 2: Prueba Manual con AWS CLI**

Si prefieres probar manualmente, ejecuta estos comandos uno por uno:

### **1. CloudFormation**
```bash
# Listar stacks
aws cloudformation list-stacks \
  --profile mentoria \
  --region us-east-1

# Describir stack específico (si existe)
aws cloudformation describe-stacks \
  --stack-name nadro-mentoria-api-dev \
  --profile mentoria \
  --region us-east-1
```

**✅ Esperado**: Lista de stacks o mensaje "does not exist" (ambos son OK)

---

### **2. IAM**
```bash
# Listar roles
aws iam list-roles \
  --profile mentoria \
  --max-items 5

# Verificar rol específico (si existe)
aws iam get-role \
  --role-name nadro-mentoria-api-dev-us-east-1-lambdaRole \
  --profile mentoria
```

**✅ Esperado**: Lista de roles o mensaje "NoSuchEntity" (ambos son OK)

---

### **3. Lambda**
```bash
# Listar funciones
aws lambda list-functions \
  --profile mentoria \
  --region us-east-1

# Verificar función específica (si existe)
aws lambda get-function \
  --function-name nadro-mentoria-api-dev-api \
  --profile mentoria \
  --region us-east-1
```

**✅ Esperado**: Lista de funciones o mensaje "ResourceNotFoundException" (ambos son OK)

---

### **4. API Gateway**
```bash
# Listar APIs
aws apigateway get-rest-apis \
  --profile mentoria \
  --region us-east-1
```

**✅ Esperado**: Lista de APIs (puede estar vacía)

---

### **5. DynamoDB**
```bash
# Listar tablas
aws dynamodb list-tables \
  --profile mentoria \
  --region us-east-1

# Describir tabla específica (si existe)
aws dynamodb describe-table \
  --table-name NadroMentoria-Consultas-dev \
  --profile mentoria \
  --region us-east-1
```

**✅ Esperado**: Lista de tablas o mensaje "ResourceNotFoundException" (ambos son OK)

---

### **6. S3**
```bash
# Listar buckets
aws s3 ls --profile mentoria

# Listar objetos en bucket específico (si existe)
aws s3 ls s3://nadro-mentoria-frontend-dev/ \
  --profile mentoria
```

**✅ Esperado**: Lista de buckets (puede estar vacía)

---

### **7. CloudWatch Logs**
```bash
# Listar log groups
aws logs describe-log-groups \
  --profile mentoria \
  --region us-east-1 \
  --log-group-name-prefix /aws/lambda/nadro-mentoria
```

**✅ Esperado**: Lista de log groups (puede estar vacía)

---

## 🌐 **Opción 3: Prueba desde la Consola Web**

### **Paso 1: Iniciar Sesión**
1. Ve a: https://julian-salinas.signin.aws.amazon.com/console
2. Usuario: `mentoria`
3. Password: `gBR38@]*`

### **Paso 2: Verificar Servicios**

#### **CloudFormation**
1. Ve a: **Services** → **CloudFormation**
2. Verifica que puedes ver la lista de stacks
3. ✅ **Esperado**: Puedes ver stacks o mensaje "No stacks"

#### **IAM**
1. Ve a: **Services** → **IAM** → **Roles**
2. Busca roles con prefijo `nadro-mentoria-api-`
3. ✅ **Esperado**: Puedes ver la lista de roles

#### **Lambda**
1. Ve a: **Services** → **Lambda** → **Functions**
2. Busca funciones con prefijo `nadro-mentoria-api-`
3. ✅ **Esperado**: Puedes ver la lista de funciones

#### **API Gateway**
1. Ve a: **Services** → **API Gateway**
2. Verifica que puedes ver la lista de APIs
3. ✅ **Esperado**: Puedes ver APIs o mensaje "No APIs"

#### **DynamoDB**
1. Ve a: **Services** → **DynamoDB** → **Tables**
2. Busca tablas con prefijo `NadroMentoria-`
3. ✅ **Esperado**: Puedes ver la lista de tablas

#### **S3**
1. Ve a: **Services** → **S3**
2. Busca buckets con prefijo `nadro-mentoria-`
3. ✅ **Esperado**: Puedes ver la lista de buckets

#### **CloudWatch**
1. Ve a: **Services** → **CloudWatch** → **Logs** → **Log groups**
2. Busca log groups con prefijo `/aws/lambda/nadro-mentoria-`
3. ✅ **Esperado**: Puedes ver la lista de log groups

---

## 🚀 **Opción 4: Prueba Real con Serverless Deploy (DRY RUN)**

Si quieres probar el despliegue real pero sin hacer cambios permanentes:

### **Paso 1: Configurar Perfil**
```bash
# Configurar perfil
aws configure --profile mentoria

# Verificar configuración
aws sts get-caller-identity --profile mentoria
```

**✅ Esperado:**
```json
{
    "UserId": "...",
    "Account": "975130647458",
    "Arn": "arn:aws:iam::975130647458:user/mentoria"
}
```

### **Paso 2: Validar Serverless Config**
```bash
cd backend

# Validar configuración (NO despliega)
AWS_PROFILE=mentoria serverless print --stage dev
```

**✅ Esperado**: Muestra la configuración completa sin errores

### **Paso 3: Despliegue de Prueba (Opcional)**
```bash
# Desplegar ambiente de prueba
AWS_PROFILE=mentoria npm run deploy:dev

# Si funciona, eliminar inmediatamente
AWS_PROFILE=mentoria npm run remove:dev
```

**⚠️ IMPORTANTE**: Esto creará recursos reales en AWS. Solo hazlo si estás seguro.

---

## ❌ **Errores Comunes y Soluciones**

### **Error: "AccessDenied" o "UnauthorizedOperation"**
**Problema**: El usuario no tiene el permiso específico

**Solución**:
1. Verifica que la política en IAM incluya el permiso necesario
2. Compara con `PERMISOS-AWS-SIMPLE.md`
3. Contacta al administrador para agregar el permiso faltante

---

### **Error: "InvalidClientTokenId"**
**Problema**: Las credenciales (Access Key) son incorrectas

**Solución**:
1. Verifica que copiaste correctamente el Access Key ID
2. Verifica que copiaste correctamente el Secret Access Key
3. Solicita nuevas credenciales al administrador

---

### **Error: "SignatureDoesNotMatch"**
**Problema**: El Secret Access Key es incorrecto

**Solución**:
1. Vuelve a configurar: `aws configure --profile mentoria`
2. Copia cuidadosamente el Secret Access Key
3. No incluyas espacios al inicio o final

---

### **Error: "Region not specified"**
**Problema**: No se especificó la región

**Solución**:
```bash
# Agregar región a todos los comandos
--region us-east-1

# O configurar región por defecto
aws configure set region us-east-1 --profile mentoria
```

---

## ✅ **Checklist de Verificación**

Marca cada item cuando lo verifiques:

- [ ] **AWS CLI configurado** con perfil `mentoria`
- [ ] **Credenciales funcionan**: `aws sts get-caller-identity --profile mentoria`
- [ ] **CloudFormation**: Puede listar stacks
- [ ] **IAM**: Puede listar roles
- [ ] **Lambda**: Puede listar funciones
- [ ] **API Gateway**: Puede listar APIs
- [ ] **DynamoDB**: Puede listar tablas
- [ ] **S3**: Puede listar buckets
- [ ] **CloudWatch Logs**: Puede listar log groups
- [ ] **Serverless config válida**: `serverless print` funciona

---

## 📊 **Resultado Esperado**

Si todos los permisos están correctos, deberías poder:

✅ **Ver recursos existentes** en todos los servicios
✅ **Ejecutar `serverless print`** sin errores
✅ **Desplegar con Serverless** (si decides hacerlo)
✅ **Eliminar recursos** con `serverless remove`

---

## 🆘 **¿Necesitas Ayuda?**

Si encuentras errores o permisos faltantes:

1. **Guarda el error completo** (copia el mensaje de error)
2. **Identifica el permiso faltante** (usualmente está en el mensaje)
3. **Verifica en `PERMISOS-AWS-SIMPLE.md`** si el permiso está incluido
4. **Contacta al administrador** con el permiso específico que falta

---

## 🎯 **Próximos Pasos**

Una vez verificados los permisos:

1. ✅ **Permisos OK** → Proceder con despliegue
2. ❌ **Permisos faltantes** → Solicitar ajustes a ciberseguridad
3. 🔄 **Permisos parciales** → Identificar cuáles faltan y solicitar

---

**¡Buena suerte con las pruebas!** 🚀

