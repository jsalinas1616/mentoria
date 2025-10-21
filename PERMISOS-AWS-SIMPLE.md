# 🔐 Permisos AWS CLI - Nadro Mentoría

## 📋 **Información del Proyecto**

- **Proyecto:** Sistema de Mentoría Integral - Nadro
- **Solicitante:** [Tu Nombre]
- **Cuenta AWS:** 975130647458
- **Región:** us-east-1
- **Propósito:** Desplegar nuevos ambientes (DEV-JUL, PRODUCCIÓN)

## 🎯 **Objetivo**

Desplegar nuevos ambientes del sistema Nadro Mentoría usando Serverless Framework.

## 🔐 **Permisos IAM Requeridos**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFormationManagement",
      "Effect": "Allow",
      "Action": [
        "cloudformation:CreateStack",
        "cloudformation:UpdateStack",
        "cloudformation:DeleteStack",
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStackResource",
        "cloudformation:DescribeStackResources",
        "cloudformation:GetTemplate",
        "cloudformation:ListStacks",
        "cloudformation:ValidateTemplate"
      ],
      "Resource": [
        "arn:aws:cloudformation:us-east-1:975130647458:stack/nadro-mentoria-api-*/*"
      ]
    },
    {
      "Sid": "IAMRoleManagement",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:GetRolePolicy"
      ],
      "Resource": [
        "arn:aws:iam::975130647458:role/nadro-mentoria-api-*"
      ]
    },
    {
      "Sid": "IAMPassRole",
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": [
        "arn:aws:iam::975130647458:role/nadro-mentoria-api-*"
      ],
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": "lambda.amazonaws.com"
        }
      }
    },
    {
      "Sid": "IAMListRoles",
      "Effect": "Allow",
      "Action": [
        "iam:ListRoles"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMReadPolicies",
      "Effect": "Allow",
      "Action": [
        "iam:GetGroupPolicy",
        "iam:GetPolicy",
        "iam:GetPolicyVersion",
        "iam:ListAttachedUserPolicies",
        "iam:ListUserPolicies"
      ],
      "Resource": "*"
    },
    {
      "Sid": "LambdaManagement",
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:DeleteFunction",
        "lambda:GetFunction",
        "lambda:GetFunctionConfiguration",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:ListFunctions",
        "lambda:ListVersionsByFunction",
        "lambda:PublishVersion",
        "lambda:AddPermission",
        "lambda:RemovePermission",
        "lambda:GetPolicy"
      ],
      "Resource": [
        "arn:aws:lambda:us-east-1:975130647458:function:nadro-mentoria-api-*"
      ]
    },
    {
      "Sid": "APIGatewayManagement",
      "Effect": "Allow",
      "Action": [
        "apigateway:GET",
        "apigateway:POST",
        "apigateway:PUT",
        "apigateway:PATCH",
        "apigateway:DELETE"
      ],
      "Resource": [
        "arn:aws:apigateway:us-east-1::/restapis",
        "arn:aws:apigateway:us-east-1::/restapis/*"
      ]
    },
    {
      "Sid": "DynamoDBManagement",
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:UpdateTable",
        "dynamodb:DeleteTable",
        "dynamodb:DescribeTable",
        "dynamodb:DescribeTimeToLive",
        "dynamodb:UpdateTimeToLive",
        "dynamodb:ListTables",
        "dynamodb:ListTagsOfResource",
        "dynamodb:TagResource",
        "dynamodb:UntagResource"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:975130647458:table/NadroMentoria-*"
      ]
    },
    {
      "Sid": "S3BucketManagement",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:GetBucketPolicy",
        "s3:PutBucketPolicy",
        "s3:DeleteBucketPolicy",
        "s3:GetBucketWebsite",
        "s3:PutBucketWebsite",
        "s3:DeleteBucketWebsite",
        "s3:GetBucketVersioning",
        "s3:PutBucketVersioning",
        "s3:GetBucketCors",
        "s3:PutBucketCors",
        "s3:PutBucketPublicAccessBlock",
        "s3:GetBucketPublicAccessBlock"
      ],
      "Resource": [
        "arn:aws:s3:::nadro-mentoria-frontend-*"
      ]
    },
    {
      "Sid": "S3ObjectManagement",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::nadro-mentoria-frontend-*/*"
      ]
    },
    {
      "Sid": "CloudWatchLogsManagement",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:DeleteLogGroup",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:PutRetentionPolicy",
        "logs:DeleteRetentionPolicy"
      ],
      "Resource": [
        "arn:aws:logs:us-east-1:975130647458:log-group:/aws/lambda/nadro-mentoria-api-*"
      ]
    },
    {
      "Sid": "S3ServerlessDeploymentBucket",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:ListBucket",
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::nadro-mentoria-api-*-serverlessdeploymentbucket-*"
      ]
    }
  ]
}
```

## 🚀 **Comandos que Ejecutaré**

```bash
# Desplegar nuevos ambientes
npm run deploy:dev         # Crear DEV-JUL
npm run deploy:desarrollo   # Crear PRODUCCIÓN

# Verificar despliegue
npm run info:dev          # Ver info de DEV-JUL
npm run info:desarrollo   # Ver info de PRODUCCIÓN
```

## 📊 **Recursos que se Crearán**

### **DEV-JUL (stage: dev-jul):**
- **Lambda:** `nadro-mentoria-api-dev-jul-api`
- **API Gateway:** `nadro-mentoria-api-dev-jul`
- **DynamoDB:** `NadroMentoria-Consultas-dev-jul`, `NadroMentoria-Usuarios-dev-jul`
- **S3:** `nadro-mentoria-frontend-dev-jul`

### **PRODUCCIÓN (stage: prod):**
- **Lambda:** `nadro-mentoria-api-prod-api`
- **API Gateway:** `nadro-mentoria-api-prod`
- **DynamoDB:** `NadroMentoria-Consultas-prod`, `NadroMentoria-Usuarios-prod`
- **S3:** `nadro-mentoria-frontend-prod`

## 🛡️ **Seguridad y Principio de Menor Privilegio**

### **✅ Limitaciones Implementadas:**

1. **Cuenta Específica**: Todos los ARNs incluyen la cuenta `975130647458`
2. **Recursos Específicos**: Solo recursos con prefijo `nadro-mentoria-*`
3. **Región Específica**: Solo `us-east-1`
4. **Separación por Ambiente**: Cada ambiente aislado con su propio stage

### **✅ PassRole con Condición de Seguridad:**

```json
{
  "Sid": "IAMPassRole",
  "Effect": "Allow",
  "Action": ["iam:PassRole"],
  "Resource": ["arn:aws:iam::975130647458:role/nadro-mentoria-api-*"],
  "Condition": {
    "StringEquals": {
      "iam:PassedToService": "lambda.amazonaws.com"
    }
  }
}
```

**¿Por qué es importante?**
- **Previene escalación de privilegios**: Solo puede pasar roles a Lambda, no a otros servicios
- **Limita el alcance**: El rol solo puede ser usado por el servicio Lambda
- **Cumple con menor privilegio**: No permite pasar roles arbitrarios

### **✅ API Gateway ARN Correcto:**

```json
"arn:aws:apigateway:us-east-1::/restapis",
"arn:aws:apigateway:us-east-1::/restapis/*"
```

**Nota**: API Gateway no incluye account ID en su ARN (es una peculiaridad del servicio)

### **✅ Serverless Deployment Bucket:**

Agregado permiso para el bucket de despliegue que Serverless crea automáticamente:
```json
"arn:aws:s3:::nadro-mentoria-api-*-serverlessdeploymentbucket-*"
```

### **✅ Operaciones Completas:**

- **Crear Y Eliminar**: Todos los permisos incluyen tanto creación como eliminación
- **CloudFormation**: Permisos completos para describir stacks y eventos
- **IAM**: Incluye `DeleteRole`, `DetachRolePolicy` para limpieza completa
- **CloudWatch**: Incluye `DeleteLogGroup` para limpieza de logs

## 📝 **Justificación**

Necesito estos permisos para:
1. **Crear** nuevos ambientes de desarrollo y producción
2. **Desplegar** código usando Serverless Framework
3. **Configurar** recursos AWS necesarios
4. **Verificar** que el despliegue funcione correctamente

---

**Solicitud creada:** $(date)
**Estado:** Pendiente de aprobación
**Prioridad:** Alta
