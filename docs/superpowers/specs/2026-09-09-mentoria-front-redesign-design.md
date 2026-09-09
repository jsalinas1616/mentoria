# Rediseño y separación del frontend de Mentoría

Fecha: 2026-09-09
Estado: aprobado, pendiente de plan de implementación

## Contexto

`mentoria` es un monorepo con tres partes: `frontend/` (Create React App), `backend/`
(Express sobre Lambda, DynamoDB, Cognito) e `infrastructure/` (scripts de aprovisionamiento).
El sistema registra actividad de un programa de mentoría interno de Nadro: consultas,
capacitaciones, entrevistas/sesiones y acercamientos. Dos roles lo usan, `admin` y `mentor`.

El frontend tiene unas 6.400 líneas y arrastra deuda concreta:

- Construye con `react-scripts` 5, sin mantenimiento desde 2022.
- No usa TypeScript.
- Llama al API con axios directo, sin caché, reintentos ni invalidación. Cada pantalla
  resuelve carga y error a mano con `useState` y `useEffect`.
- No valida con esquemas: `utils/validation.js` son 35 líneas de comprobaciones sueltas
  que no cubren las reglas de `express-validator` del backend.
- No tiene pruebas.
- Concentra responsabilidades en archivos grandes: `FormularioCapacitacion.jsx` (799 líneas),
  `Login.jsx` (759), `Dashboard.jsx` (446).
- Navega entre formularios con `window.location.href`, lo que recarga la aplicación entera.
- Comparte repositorio con el backend, así que un cambio de UI arrastra el historial y el
  ciclo de despliegue del servidor.

La identidad visual actual nació de plantillas: verde esmeralda `#059669`, tipografía Inter,
tarjetas blancas y gradientes. Funciona, pero no distingue al producto.

## Objetivos

1. Sacar el frontend a su propio repositorio, `mentoria-front`.
2. Reconstruirlo sobre un stack vigente: Vite, React 19, TypeScript, TanStack Query,
   React Hook Form con Zod, Tailwind 4 y shadcn/ui.
3. Darle una identidad visual nueva, anclada en los verdes corporativos de Nadro.
4. Reemplazar los scripts de despliegue `.sh` por recetas de `just` y un archivo `.env`
   por entorno que cubra build y despliegue.

## No objetivos

- No se toca el backend ni la infraestructura, salvo una regla de CloudFront (ver más abajo).
- No se agregan funciones. El API expone administración de usuarios en `/auth/usuarios`
  que el frontend actual no consume; sigue sin consumirla.
- No se migra la autenticación a AWS Amplify. `amazon-cognito-identity-js` funciona hoy;
  cambiarlo introduce riesgo sin beneficio inmediato.
- No se borra `frontend/` del monorepo hasta que el reemplazo esté en producción.

## Decisiones

### Reescritura, no migración por pasos

El proyecto nuevo arranca vacío. Del código actual se porta la lógica —autenticación
Cognito, contratos del API, reglas de validación, catálogos de datos— traducida a
TypeScript. El marcado se rehace con la identidad nueva.

Migrar por pasos (CRA a Vite, luego JS a TS, luego rediseño) obliga a tres pasadas sobre
los mismos archivos, y la tercera descarta lo que produjeron las dos primeras. Además los
componentes de 800 líneas sobrevivirían la migración, porque ningún paso los parte.

El riesgo de la reescritura es perder una regla de negocio escondida. Lo mitiga el primer
entregable: un documento de contrato que enumera endpoints, campos, validaciones y
catálogos, extraído leyendo el frontend y el backend actuales. Ese documento se revisa una
vez y gobierna el port.

### Repositorio propio, monorepo intacto

`mentoria-front` nace como repositorio git independiente en
`~/workspace/zomaproject/react/mentoria-front`. El `frontend/` del monorepo permanece
hasta que el reemplazo llegue a producción.

### `BrowserRouter` en lugar de `HashRouter`

Las URLs pierden el `#` y se vuelven compartibles. A cambio, CloudFront necesita una
*custom error response* que mapee 403 y 404 a `/index.html` con código 200. Es un cambio
único en la distribución.

### Rutas anidadas

Los formularios cuelgan de un layout común y navegan con el router. Desaparecen las
asignaciones a `window.location.href` y las recargas completas que provocan.

## Stack

| Necesidad | Elección | Reemplaza a |
|---|---|---|
| Build | Vite 7 | `react-scripts` 5 |
| Lenguaje | TypeScript | JavaScript |
| Paquetes | pnpm | npm |
| Rutas | React Router 7, modo data | React Router 7 con `HashRouter` |
| Datos de servidor | TanStack Query 5 | `useState` + `useEffect` + axios |
| Formularios | React Hook Form + Zod | React Hook Form + validación manual |
| Estilos | Tailwind 4 | Tailwind 3 |
| Componentes | shadcn/ui | componentes propios sueltos |
| Tablas | TanStack Table | tablas escritas a mano |
| Gráficos | Recharts | Recharts (se conserva) |
| HTTP | `fetch` en `lib/api.ts` | axios |
| Fechas | date-fns + date picker de shadcn | `react-datepicker` |
| Iconos | lucide-react | lucide-react (se conserva) |
| Pruebas | Vitest, Testing Library, MSW | ninguna |
| Lint y formato | ESLint flat + Prettier | `eslint-config-react-app` |
| Tareas | just | scripts `.sh` |

Sin Zustand: no hay estado compartido que no sea de servidor. El proyecto clasifica como
tamaño **S** —cuatro entidades, reglas de negocio acotadas, un desarrollador.

## Arquitectura

```
mentoria-front/
  justfile
  .env.example
  .env.development          # local, versionado
  .env.qa                   # versionado
  .env.production           # versionado
  .env.local                # ignorado por git
  src/
    app/
      router.tsx            # rutas y guards
      providers.tsx         # QueryClient, AuthProvider, ErrorBoundary
    features/
      auth/
      dashboard/
      consultas/
      capacitaciones/
      entrevistas/
      acercamientos/
    components/
      ui/                   # shadcn
      layout/               # AppShell, Header, Nav
    lib/
      api.ts
      cognito.ts
      query-client.ts
      env.ts
    data/                   # catálogos tipados
    types/
```

Cada feature contiene `api/` (queries y mutations), `components/`, `pages/`, `schemas.ts`
e `index.ts`. Un feature importa de otro solo a través de su `index.ts`. Lo que usan dos o
más sube a `components/` o `lib/`.

Los catálogos —áreas, motivos de consulta, lugares de trabajo, lugares de consulta, rangos
de edad, estados de ánimo— se portan desde `frontend/src/data/*.json` y quedan tipados.

## Datos, autenticación y errores

### Cliente HTTP

`lib/api.ts` envuelve `fetch`. Lee la base de `VITE_API_URL`, agrega
`Authorization: Bearer <idToken>` y normaliza cualquier fallo a un error tipado:

```ts
class ApiError extends Error {
  status: number
  fieldErrors?: Record<string, string>
}
```

El backend responde `{ error: true, message, timestamp }` y, cuando falla la validación,
agrega `details: [{ field, message, value }]`. `ApiError` traduce ese `details` a
`fieldErrors`, y el formulario los inyecta en React Hook Form con `setError`. Un 400 del
servidor pinta el mensaje bajo el campo que corresponde, en lugar de un aviso genérico.

`lib/env.ts` valida las variables `VITE_*` con Zod al arrancar. Si falta una, la aplicación
falla de inmediato y con un mensaje claro.

### Autenticación

`lib/cognito.ts` porta `services/cognitoAuth.js` conservando el flujo completo: inicio de
sesión, `NEW_PASSWORD_REQUIRED`, `forgotPassword` y `confirmPassword`.

El rol sale de `cognito:groups` del token de identidad. El backend acepta ese campo como
arreglo o como cadena JSON; el frontend lo normaliza a `'admin' | 'mentor'` en un único
lugar. Un `AuthProvider` expone `user`, `login` y `logout`, y los guards de ruta leen de él.

Una respuesta 401 limpia la sesión y redirige al inicio de sesión guardando la ruta de
origen, para volver a ella tras reautenticar.

### Estado de servidor

TanStack Query gobierna toda lectura y escritura contra el API. Cada feature centraliza sus
claves —`consultaKeys.all`, `consultaKeys.list(filtros)`, `consultaKeys.detail(id)`— y toda
mutación invalida las consultas que afecta.

### Validación

Cada feature declara sus esquemas Zod en `schemas.ts`, espejando las reglas de
`express-validator` del backend. La duplicación es deliberada: Zod cuida la experiencia,
el servidor sigue siendo la fuente de verdad.

### Errores en la interfaz

Un `ErrorBoundary` en la raíz y otro por ruta. Cada página declara sus estados de carga y
error. Las mutaciones informan su resultado con toasts.

## Identidad visual

La dirección se decide antes de escribir código de interfaz. Primero un canvas con tres
direcciones en baja fidelidad, todas ancladas en los verdes de Nadro (`#059669` y su
familia) y divergentes en tipografía, densidad, forma y tratamiento de superficie. Elegida
una, se fijan los tokens —color, escala tipográfica, espaciado, radios, sombras— en las
variables CSS de shadcn. Después se dibujan tres pantallas en alta fidelidad —inicio de
sesión, dashboard y un formulario— que sirven de referencia al port.

Restricciones:

- Los verdes corporativos de Nadro se conservan como ancla de la paleta.
- Inter se descarta salvo que la marca la exija.
- Los formularios se diseñan mobile-first; el dashboard aprovecha la pantalla grande sin
  romperse en el teléfono. No hay datos de uso que justifiquen priorizar una plataforma.
- Los blancos y negros llevan matiz; los acentos se definen en oklch compartiendo croma y
  luminosidad.

## Pruebas

Vitest, Testing Library y MSW. Las pruebas cubren donde está el riesgo del port:

- Los esquemas Zod contra las reglas del backend. Es lo más fácil de perder al reescribir.
- Los cuatro formularios: render, validación, envío y error del servidor por campo.
- Las transformaciones de datos del dashboard: agregados de KPIs y series de los gráficos.

Quedan fuera los componentes de shadcn y las páginas sin lógica. Sin Playwright: el tamaño
del proyecto no lo justifica.

Las consultas se hacen por rol y texto visible, no por `data-testid`.

## Build y despliegue

Hay tres entornos, con un archivo cada uno: `development` (local), `qa` y `production`.
Cada archivo reúne las dos mitades de la configuración. Vite lee las variables `VITE_*` al
construir con `--mode <entorno>`; `just` lee el resto al desplegar. El nombre del entorno
es el mismo en los dos lados, así que `just deploy qa` construye con `--mode qa` y toma sus
credenciales de `.env.qa`.

```bash
# .env.production
VITE_API_URL=https://xxxx.execute-api.us-east-1.amazonaws.com/api
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxx
VITE_AWS_REGION=us-east-1

AWS_PROFILE=nadro-prod
AWS_REGION=us-east-1
S3_BUCKET=mentoria-front-prod
CLOUDFRONT_DISTRIBUTION_ID=E2XXXXXXXXXX
```

Recetas del `justfile`:

| Receta | Efecto |
|---|---|
| `just dev` | servidor de desarrollo |
| `just build <entorno>` | build con `--mode <entorno>` |
| `just test` | Vitest |
| `just lint` | ESLint |
| `just typecheck` | `tsc --noEmit` |
| `just check` | lint, typecheck, test y build |
| `just deploy qa` | build, sync a S3, invalidación |
| `just deploy production` | igual, con confirmación previa |

El despliegue sincroniza con `aws s3 sync --delete`, aplica caché larga a los recursos con
hash en el nombre y `no-cache` a `index.html`, y luego invalida CloudFront.

Los tres archivos de entorno se versionan: contienen identificadores, no secretos, como ya
ocurre hoy. `.env.local` queda en `.gitignore` para sobreescrituras personales.

## Cambio fuera del frontend

CloudFront necesita una *custom error response* que mapee 403 y 404 a `/index.html` con
código 200, para que `BrowserRouter` resuelva las rutas profundas. Es la única modificación
de infraestructura que exige este trabajo, y se aplica antes del primer despliegue a QA.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Perder una regla de validación al reescribir | El documento de contrato precede al código y se revisa antes de portar |
| El dashboard depende de agregados calculados en el cliente | Se cubren con pruebas antes de tocar la presentación |
| CloudFront mal configurado deja rutas profundas en 403 | Se verifica en QA antes de producción |
| Divergencia entre el front nuevo y el viejo mientras conviven | El monorepo queda congelado en el frontend; los cambios van al repositorio nuevo |

## Tramos

1. **Documento de contrato.** Endpoints, campos, validaciones y catálogos, extraídos del
   frontend y el backend actuales. Se revisa una vez.
2. **Dirección visual.** Canvas con tres direcciones; se elige una y se fijan los tokens.
3. **Andamiaje.** Repositorio, stack, `justfile`, `.env`, layout y autenticación
   funcionando contra el Cognito actual.
4. **Port de pantallas.** Dashboard y los cuatro formularios con la identidad elegida.
5. **Despliegue.** Ajuste de CloudFront y publicación en QA.

Cada tramo cierra con su propio plan de implementación.

## Criterios de aceptación

- `mentoria-front` construye, pasa lint, typecheck y pruebas con `just check`.
- Un mentor inicia sesión, registra los cuatro tipos de actividad y ve sus registros.
- Un administrador ve el dashboard con KPIs, gráficos y filtros, y exporta a Excel.
- El flujo de contraseña nueva y el de recuperación funcionan contra Cognito.
- Las rutas profundas responden tras recargar el navegador.
- `just deploy qa` publica y la aplicación funciona en la URL de QA.
