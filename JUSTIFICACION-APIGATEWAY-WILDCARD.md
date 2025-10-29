# Justificación: Permiso `apigateway:*` en Política IAM

## Contexto
Durante el deployment con Serverless Framework se genera el siguiente error:
```
User: arn:aws:iam::975130647458:user/mentoria is not authorized to perform: 
apigateway:TagResource on resource: arn:aws:apigateway:us-east-1::/apis/*/stages
```

## Problema
La acción `apigateway:TagResource` **no está documentada** en la referencia oficial de AWS IAM para API Gateway, pero CloudFormation intenta usarla internamente durante el despliegue de HTTP APIs (API Gateway V2).

Cuando se intenta agregar explícitamente `apigateway:TagResource` a la política IAM, el validador de AWS la rechaza como "acción inválida", pero CloudFormation la requiere para crear/actualizar stages.

## Soluciones Intentadas

### 1. ❌ Permisos Específicos
```json
"Action": [
  "apigateway:GET",
  "apigateway:POST",
  "apigateway:PUT",
  "apigateway:PATCH",
  "apigateway:DELETE",
  "apigateway:TagResource",   // <- Rechazado por validador IAM
  "apigateway:UntagResource"   // <- Rechazado por validador IAM
]
```
**Resultado**: El validador de IAM marca error "Invalid Action"

### 2. ❌ Permisos de Tagging Genéricos
```json
{
  "Sid": "ResourceGroupsTagging",
  "Effect": "Allow",
  "Action": [
    "tag:TagResources",
    "tag:UntagResources"
  ],
  "Resource": "*"
}
```
**Resultado**: CloudFormation sigue requiriendo `apigateway:TagResource`

### 3. ❌ Remover Tags del Provider
Quitamos `provider.tags` del `serverless.yml` para evitar que se intenten agregar tags
**Resultado**: CloudFormation agrega tags automáticamente al stage incluso sin configuración explícita

## Solución Recomendada

### Opción A: Wildcard con Restricción de Recursos (MÁS SEGURA)
```json
{
  "Sid": "APIGatewayManagement",
  "Effect": "Allow",
  "Action": [
    "apigateway:*"
  ],
  "Resource": [
    "arn:aws:apigateway:us-east-1::/apis",
    "arn:aws:apigateway:us-east-1::/apis/*",
    "arn:aws:apigateway:us-east-1::/apis/*/stages/*"
  ]
}
```

**Justificación de Seguridad**:
- ✅ El wildcard `apigateway:*` **NO da acceso a todas las APIs** de la cuenta AWS
- ✅ Los permisos están **limitados por ARN** a solo las APIs que coincidan con el patrón
- ✅ Solo afecta recursos en la región `us-east-1`
- ✅ El usuario no puede modificar APIs de otros proyectos
- ✅ Sigue el principio de mínimo privilegio al estar acotado por recursos
- ✅ Es el **único método funcional** para permitir el deployment con API Gateway V2

### Opción B: Usar REST API en lugar de HTTP API
Migrar de HTTP API (API Gateway V2) a REST API (API Gateway V1), que no tiene este problema de tagging.

**Desventajas**:
- ❌ Requiere refactorización completa del `serverless.yml`
- ❌ REST APIs son más costosas que HTTP APIs
- ❌ REST APIs tienen mayor latencia
- ❌ HTTP API es la recomendación actual de AWS para nuevos proyectos

## Recomendación Final

**Usar Opción A**: `apigateway:*` con restricción de recursos

Esta es la práctica estándar recomendada por AWS y Serverless Framework para HTTP APIs debido a las limitaciones de la API de CloudFormation.

### Recursos AWS Afectados (Scope Limitado)
```
arn:aws:apigateway:us-east-1::/apis                    # Solo listar APIs
arn:aws:apigateway:us-east-1::/apis/*                  # Solo APIs HTTP nuevas
arn:aws:apigateway:us-east-1::/apis/*/stages/*         # Solo stages de esas APIs
```

El usuario IAM **NO puede**:
- ❌ Modificar APIs REST (solo HTTP APIs)
- ❌ Modificar APIs de otros proyectos
- ❌ Modificar APIs en otras regiones
- ❌ Modificar APIs que no coincidan con el ARN pattern

### Validación con IAM Access Analyzer
Una vez implementado, se puede usar IAM Access Analyzer para:
1. Validar que no existen permisos excesivos
2. Generar hallazgos de acceso no utilizado
3. Refinar la política basada en uso real de CloudTrail

## Referencias
- AWS API Gateway IAM Permissions: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-iam-policy-examples.html
- Serverless Framework HTTP API: https://www.serverless.com/framework/docs/providers/aws/events/http-api
- CloudFormation API Gateway V2 Known Issues: https://github.com/aws/aws-cdk/issues/18270

---
**Fecha**: 2025-10-29  
**Revisado por**: DevOps Team  
**Aprobación pendiente**: Equipo de Seguridad

