# 📝 Justificaciones de Wildcards - Nadro Mentoría QA

## 🎯 **Contexto**
Cuenta AWS: **637423546677** (dedicada exclusivamente a QA)  
Región: **us-east-1**  
Proyecto: **nadro-mentoria-api-qa**

---

## 🔍 **Wildcards y sus Justificaciones**

### **1. IAM Roles (`role/nadro-mentoria-api-qa-*`)**
```json
"Resource": "arn:aws:iam::637423546677:role/nadro-mentoria-api-qa-*"
```

**¿Por qué el wildcard?**  
Serverless Framework crea múltiples roles IAM dentro del stack `nadro-mentoria-api-qa` con sufijos dinámicos que incluyen:
- Ambiente (prod/dev)
- Región (us-east-1)
- Tipo de servicio (Lambda, API Gateway, etc.)

**Ejemplos de roles que se crean:**
- `nadro-mentoria-api-qa-prod-us-east-1-lambdaRole`
- `nadro-mentoria-api-qa-prod-us-east-1-apiGatewayCloudWatchRole`
- `nadro-mentoria-api-qa-prod-us-east-1-lambdaFunctionRole`

**Justificación:** Los nombres exactos no se pueden determinar antes del despliegue debido a la nomenclatura automática de AWS/Serverless.

---

### **1c. IAM ListRoles (`iam:ListRoles` con `Resource: *`)**
```json
"Action": ["iam:ListRoles"],
"Resource": "*"
```

**¿Por qué necesitas este permiso?**  
CloudFormation/Serverless necesita **listar** todos los roles de IAM para:
- Validar que los roles existen antes de usarlos
- Verificar permisos y configuraciones
- Comprobar dependencias entre recursos
- Determinar qué roles se pueden usar para las funciones Lambda

**¿Por qué `Resource: *` (todo)?**  
IAM `ListRoles` **solo** es una acción de **lectura** que lista roles. No permite:
- Modificar roles
- Crear roles
- Eliminar roles
- Cambiar permisos

Por diseño de AWS, `iam:ListRoles` **requiere** `Resource: *` porque no opera sobre un recurso específico, sino que **consulta** la lista de roles de la cuenta.

**¿Es seguro?**  
✅ Sí, porque:
1. Es **solo lectura** (no modifica nada)
2. La cuenta es **dedicada a QA** (no hay riesgo de ver roles de producción)
3. Es **necesario** para que CloudFormation/Serverless funcione correctamente

**Justificación:** Este permiso es requerido por CloudFormation para poder **consultar** la lista de roles disponibles antes de crear o modificar recursos. Es una acción de solo lectura y es estándar para despliegues con infraestructura como código.

---

### **1d. IAM Read Policies (`iam:GetPolicy*` y `iam:ListUserPolicies` con `Resource: *`)**
```json
"Action": [
  "iam:GetGroupPolicy",
  "iam:GetPolicy",
  "iam:GetPolicyVersion",
  "iam:ListAttachedUserPolicies",
  "iam:ListUserPolicies"
],
"Resource": "*"
```

**¿Por qué necesitas estos permisos?**  
CloudFormation/Serverless necesita **leer políticas IAM** para:
- Validar que los roles tienen los permisos correctos
- Comprobar dependencias entre políticas y roles
- Verificar configuración antes de crear nuevos recursos
- Determinar qué políticas se pueden usar o adjuntar

**¿Por qué `Resource: *` (todo)?**  
Estas acciones **solo** leen políticas. No permiten:
- Crear políticas
- Modificar políticas
- Eliminar políticas
- Adjuntar políticas a usuarios/roles

Por diseño de AWS, las acciones de lectura de políticas **requieren** `Resource: *` porque consultan políticas de toda la cuenta, no de un recurso específico.

**¿Es seguro?**  
✅ Sí, porque:
1. Son **solo lectura** (no modifican nada)
2. La cuenta es **dedicada a QA** (no hay riesgo de ver políticas de producción)
3. Son **necesarias** para que CloudFormation valide configuraciones

**Justificación:** Estos permisos son requeridos por CloudFormation para poder **consultar** políticas IAM y validar la configuración correcta antes de crear o modificar recursos. Son acciones de solo lectura y son estándar para despliegues con infraestructura como código (IaC).

---

### **1b. IAM PassRole (`iam:PassRole` con `iam:PassedToService: lambda.amazonaws.com`)**
```json
"Action": ["iam:PassRole"],
"Resource": "arn:aws:iam::637423546677:role/nadro-mentoria-api-qa-*",
"Condition": {
  "StringEquals": {
    "iam:PassedToService": "lambda.amazonaws.com"
  }
}
```

**¿Por qué el wildcard `nadro-mentoria-api-qa-*`?**  
Serverless Framework/CloudFormation crea roles con sufijos que **no se pueden determinar antes del despliegue** porque:

1. **Serverless usa plantillas dinámicas** que generan nombres basados en variables como:
   - `${self:service}` (nadro-mentoria-api)
   - `${self:provider.stage}` (qa, prod, dev)
   - `${self:provider.region}` (us-east-1)
   - Tipo de función

2. **AWS agrega sufijos automáticamente** para garantizar unicidad:
   - Puede agregar hashes aleatorios
   - Puede agregar timestamps
   - Varía según la configuración

3. **Ejemplos de nombres que se crean** (no se conocen antes):
   - `nadro-mentoria-api-qa-prod-us-east-1-lambdaRole`
   - `nadro-mentoria-api-qa-dev-us-east-1-lambdaRole`  
   - `nadro-mentoria-api-qa-prod-us-east-1-lambdaRoleABC123XYZ`

**¿Por qué necesitas el `*` en PassRole?**  
CloudFormation necesita **asignar** (pasar) estos roles a las funciones Lambda que crea. Como los nombres exactos se generan dinámicamente, el wildcard `*` es necesario para cubrirlos todos.

**¿Por qué la condición `iam:PassedToService: lambda.amazonaws.com`?**  
La condición **garantiza** que los roles **solo** se pueden pasar a Lambda y NO a otros servicios (EC2, ECS, etc.). Esto previene escalación de privilegios.

**Justificación:** El wildcard es necesario porque **no puedes especificar los nombres exactos** antes del despliegue. La condición limita el permiso solo a Lambda, cumpliendo con el principio de menor privilegio.

---

### **2. Lambda Functions (`function:nadro-mentoria-api-qa*`)**
```json
"Resource": "arn:aws:lambda:us-east-1:637423546677:function:nadro-mentoria-api-qa*"
```

**¿Por qué el wildcard?**  
Serverless genera funciones Lambda con identificadores automáticos que incluyen:
- Región
- Ambiente
- Nombre del stack
- Tipo de recurso

**Ejemplos:**
- `nadro-mentoria-api-qa-api`
- `nadro-mentoria-api-qa-prod-us-east-1-function-api`

**Justificación:** Los nombres completos de las funciones Lambda se generan dinámicamente durante el despliegue.

---

### **3. CloudWatch Logs (`log-group:/aws/lambda/nadro-mentoria-api-qa*`)**
```json
"Resource": "arn:aws:logs:us-east-1:637423546677:log-group:/aws/lambda/nadro-mentoria-api-qa*"
```

**¿Por qué el wildcard?**  
Las funciones Lambda crean automáticamente sus propios log groups con el prefijo `/aws/lambda/` y nombres que coinciden con las funciones Lambda.

**Ejemplos:**
- `/aws/lambda/nadro-mentoria-api-qa-api`
- `/aws/lambda/nadro-mentoria-api-qa-prod-us-east-1-function-api`

**Justificación:** CloudWatch crea los log groups automáticamente usando el nombre de la función Lambda como sufijo.

---

### **4. CloudFormation Stack (`stack/nadro-mentoria-api-qa/*`)**
```json
"Resource": "arn:aws:cloudformation:us-east-1:637423546677:stack/nadro-mentoria-api-qa/*"
```

**¿Por qué el wildcard `/*`?**  
CloudFormation crea múltiples recursos adicionales dentro del stack con IDs únicos generados automáticamente por AWS.

**Ejemplos de recursos internos que se crean:**
- `arn:...:stack/nadro-mentoria-api-qa/LambdaFunctionRole/ABC123XYZ`
- `arn:...:stack/nadro-mentoria-api-qa/CognitoUserPoolResource/DEF456UVW`
- `arn:...:stack/nadro-mentoria-api-qa/HttpApi/RandomHash789`
- `arn:...:stack/nadro-mentoria-api-qa/DynamoDBTableName/RandomHash012`

**¿Qué hace el `/*`?**  
El wildcard permite que CloudFormation cree **cualquier recurso físico** dentro del stack, ya que:
1. CloudFormation genera IDs únicos aleatorios para cada recurso
2. Serverless Framework puede crear/eliminar recursos dinámicamente
3. No se pueden predecir los nombres completos de los recursos antes del despliegue

**Justificación:** Este es un patrón estándar de AWS para infraestructura como código (IaC). El wildcard `/*` es **requerido** para que CloudFormation pueda gestionar todos los recursos del stack (Lambda, DynamoDB, API Gateway, Cognito, etc.) sin conocer sus IDs específicos antes del despliegue.

---

### **4b. API Gateway (`arn:aws:apigateway:us-east-1::/restapis` y `/restapis/*`)**
```json
"Resource": [
  "arn:aws:apigateway:us-east-1::/restapis",
  "arn:aws:apigateway:us-east-1::/restapis/*"
]
```

**¿Por qué dos ARNs?**  
API Gateway usa una estructura jerárquica donde se necesitan ambos niveles:

1. **`/restapis`** → Permite **listar** REST APIs existentes y **crear** nuevas APIs
2. **`/restapis/*`** → Permite trabajar con APIs REST **específicas** que se crean dentro del stack

**¿Por qué el wildcard `/*`?**  
Cuando CloudFormation crea una API REST dentro del stack `nadro-mentoria-api-qa`, AWS genera un ID único aleatorio para la API (ej: `abc123xyz456`). El wildcard `/*` permite trabajar con cualquier API creada, sin conocer su ID antes del despliegue.

**¿Por qué sin account ID?**  
API Gateway **no incluye el account ID** en su ARN (es una peculiaridad del servicio AWS). Por eso ves `arn:aws:apigateway:us-east-1::` con `::` vacío.

**Ejemplos de recursos que se crean:**
- `arn:aws:apigateway:us-east-1::/restapis/abc123xyz456`
- `arn:aws:apigateway:us-east-1::/restapis/def789uvw012`

**Justificación:** Este es el formato estándar de AWS para permisos de API Gateway. Los dos ARNs son requeridos: uno para el recurso principal y otro con wildcard para las APIs creadas dinámicamente.

---

### **5. Cognito User Pool (`userpool/us-east-1_*`)**
```json
"Resource": "arn:aws:cognito-idp:us-east-1:637423546677:userpool/us-east-1_*"
```

**¿Por qué el wildcard?**  
AWS Cognito genera IDs únicos en formato `us-east-1_XXXXXXXX` donde XXXXXXXX es un código aleatorio.

**Ejemplo:**
- `userpool/us-east-1_B7v3pO3rF`

**Justificación:** AWS genera estos IDs automáticamente y no se pueden conocer antes de la creación del User Pool.

---

### **6. S3 Serverless Deployment Bucket (`*-serverlessdeploymentbucket-*`)**
```json
"Resource": "arn:aws:s3:::nadro-mentoria-api-dev-serverlessdeploymentbucket-*"
```

**¿Por qué el wildcard?**  
Serverless crea automáticamente un bucket con un hash aleatorio para almacenar artefactos durante el despliegue.

**Ejemplo:**
- `nadro-mentoria-api-dev-serverlessdeploymentbucket-abc123xyz456`

**Justificación:** El hash aleatorio se genera por Serverless para garantizar unicidad del bucket en la cuenta AWS.

---

## ✅ **Principio de Menor Privilegio**

Todos los wildcards están limitados por:
- **Cuenta específica:** `637423546677` (solo QA)
- **Región específica:** `us-east-1`
- **Prefijos fijos:** `nadro-mentoria-api-qa`, `NadroMentoria-`

**¿Por qué es seguro?**
La cuenta `637423546677` está dedicada **exclusivamente** para QA, por lo que los wildcards no representan un riesgo de escalación de privilegios o acceso a recursos de producción.

---

**Última actualización:** 25 de octubre de 2025  
**Cuenta AWS:** 637423546677  
**Proyecto:** Nadro Mentoría - Ambiente QA

---

## ⚠️ **Nota Importante sobre Producción**

Estos permisos se diseñaron para una **cuenta dedicada a QA** donde los wildcards son aceptables.

**¿Qué pasa en producción?**  
En producción, Serverless/CloudFormation también genera nombres dinámicos. **No puedes usar nombres específicos** porque los recursos aún no existen antes del despliegue.

**Solución para producción:**
1. **Usar los mismos permisos** con wildcards (necesarios para IaC)
2. **Agregar condiciones adicionales** de seguridad:
   - Restrict por región específica
   - Agregar tags obligatorios en recursos
   - Limitar por IP
   - Usar MFA obligatorio
3. **Aplicar principio de menor privilegio** con prefijos específicos:
   - `arn:aws:iam::PROD_ACCOUNT:role/nadro-mentoria-api-prod-*`
   - `arn:aws:lambda:us-east-1:PROD_ACCOUNT:function:nadro-mentoria-api-prod*`
4. **Monitoreo y auditoría** constante
5. **Separar permisos** por ambiente (stage) en la policy

**Conclusión:** Los wildcards son **necesarios** tanto en QA como en PROD cuando usas infraestructura como código, pero en PROD debes agregar más controles de seguridad y monitoreo.

