# Andamiaje de mentoria-front — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levantar el repositorio `mentoria-front` con el stack objetivo y un inicio de sesión que funcione de punta a punta contra el Cognito actual.

**Architecture:** Proyecto Vite con React 19 y TypeScript. Tres módulos de infraestructura sin dependencias entre sí más allá de lo declarado: `lib/env.ts` valida la configuración, `lib/api.ts` habla con el API y normaliza errores, `lib/cognito.ts` porta la autenticación. Encima, un `AuthProvider` con guards de ruta y una pantalla de inicio de sesión con sus tres flujos. El tramo cierra con recetas de despliegue.

**Tech Stack:** Vite 7, React 19, TypeScript, React Router 7, TanStack Query 5, React Hook Form, Zod 4, Tailwind 4, shadcn/ui, `amazon-cognito-identity-js`, Vitest, Testing Library, MSW 2, just, pnpm.

## Global Constraints

- El repositorio vive en `C:\Users\zoma\workspace\zomaproject\react\mentoria-front`, **fuera** del worktree donde está este plan. Es un repositorio git propio e independiente de `mentoria`.
- Gestor de paquetes: `pnpm`. Node 24.
- Prohibido `any`. Si el tipo se desconoce, `unknown` y estrechamiento.
- Componentes como `export function`. Sin `React.FC`, sin clases de componente.
- Componentes en PascalCase, hooks en camelCase con prefijo `use`, el resto en kebab-case.
- Sin lógica de negocio dentro de componentes: vive en hooks del feature o en funciones puras de `lib/`.
- Un feature importa de otro solo a través de su `index.ts`.
- Variables de entorno con prefijo `VITE_`, validadas con Zod al arrancar.
- Las pruebas consultan por rol y texto visible (`getByRole`, `getByLabelText`). `data-testid` solo como último recurso.
- Sin axios, sin Zustand, sin AWS Amplify.
- Commits en inglés, formato Conventional Commits, imperativo, sin punto final.
- Todo texto visible para el usuario va en español.
- Reglas de contraseña, copiadas literalmente del frontend actual: mínimo 8 caracteres y `/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/`.
- Derivación de rol, copiada literalmente: `admin` gana sobre `mentor`; sin ninguno de los dos, la sesión se rechaza con el mensaje «Tu cuenta no tiene un rol asignado. Contacta al administrador del sistema.»
- Claves de `localStorage`: `idToken`, `accessToken`, `refreshToken`, `user`. La clave `authToken` del frontend actual era un duplicado de `idToken` por compatibilidad y no se porta.
- Nunca registrar en consola tokens, grupos ni datos personales. El frontend actual lo hace; el nuevo no.

## Dependencia externa no resuelta

`VITE_API_URL`, `VITE_COGNITO_USER_POOL_ID` y `VITE_COGNITO_CLIENT_ID` no están en el repositorio `mentoria`: sus archivos `.env` están ignorados por git. Las tareas 1 a 8 se completan con los valores de ejemplo indicados y las pruebas pasan sin credenciales reales. Para **ejecutar** la aplicación contra Cognito hace falta pedirlos. La tarea 9 los necesita reales.

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `justfile` | recetas de desarrollo y despliegue |
| `.env.example` | plantilla documentada de las variables |
| `.env.development` | valores locales |
| `.env.test` | valores ficticios para Vitest |
| `vite.config.ts` | plugins, alias `@`, configuración de Vitest |
| `src/lib/env.ts` | esquema y validación de las variables `VITE_*` |
| `src/lib/api.ts` | cliente HTTP, `ApiError`, traducción de `details` a `fieldErrors` |
| `src/lib/cognito.ts` | autenticación: sesión, roles, tokens, recuperación |
| `src/lib/query-client.ts` | instancia de `QueryClient` |
| `src/features/auth/auth-context.ts` | tipo y contexto de autenticación |
| `src/features/auth/AuthProvider.tsx` | estado de sesión y registro del manejador de 401 |
| `src/features/auth/use-auth.ts` | hook de acceso al contexto |
| `src/features/auth/guards.tsx` | `RequireAuth` y `RequireRole` |
| `src/features/auth/schemas.ts` | esquemas Zod de los tres formularios |
| `src/features/auth/pages/LoginPage.tsx` | orquesta los tres flujos |
| `src/features/auth/components/CredentialsForm.tsx` | correo y contraseña |
| `src/features/auth/components/NewPasswordForm.tsx` | contraseña temporal |
| `src/features/auth/components/ForgotPasswordForm.tsx` | recuperación en dos pasos |
| `src/components/layout/AppShell.tsx` | cabecera, navegación y `Outlet` |
| `src/app/router.tsx` | árbol de rutas |
| `src/app/providers.tsx` | `QueryClientProvider`, `AuthProvider`, `ErrorBoundary` |
| `src/test/setup.ts` | configuración global de Vitest |
| `src/test/msw.ts` | servidor MSW compartido |

---

### Task 1: Andamiaje del proyecto y validación de configuración

**Files:**
- Create: `mentoria-front/` (repositorio completo)
- Create: `src/lib/env.ts`
- Create: `src/lib/env.test.ts`
- Create: `justfile`, `.env.example`, `.env.development`, `.env.test`
- Create: `src/test/setup.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `parseEnv(source: Record<string, unknown>): Env`, `env: Env` y el tipo `Env` con los campos `VITE_API_URL`, `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID` y `VITE_AWS_REGION`, todos `string`. También `just check` como puerta de calidad usada por el resto de las tareas.

- [ ] **Step 1: Crear el proyecto**

```bash
cd C:/Users/zoma/workspace/zomaproject/react
pnpm create vite@latest mentoria-front --template react-ts
cd mentoria-front
git init
pnpm install
```

- [ ] **Step 2: Instalar dependencias**

```bash
pnpm add react-router-dom @tanstack/react-query react-hook-form @hookform/resolvers zod amazon-cognito-identity-js date-fns lucide-react
pnpm add -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom msw prettier eslint-config-prettier
```

- [ ] **Step 3: Configurar el alias y Vitest**

Reemplazar `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

Agregar a `tsconfig.app.json`, dentro de `compilerOptions`:

```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

Crear `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Crear los archivos de entorno**

`.env.example`:

```bash
# URL base del API Gateway, sin barra final
VITE_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/api
# Identificador del User Pool de Cognito
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXX
# Identificador del App Client de Cognito
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
# Región de AWS
VITE_AWS_REGION=us-east-1
```

`.env.development` y `.env.test` con el mismo contenido: copia de `.env.example`. Los valores reales de desarrollo se piden al responsable del despliegue antes de ejecutar la aplicación; las pruebas no los necesitan.

Agregar a `.gitignore`:

```
.env.local
.env.*.local
```

- [ ] **Step 5: Crear el `justfile`**

```just
set dotenv-load := false

default:
    @just --list

dev:
    pnpm vite

build entorno="development":
    pnpm vite build --mode {{entorno}}

test:
    pnpm vitest run

test-watch:
    pnpm vitest

lint:
    pnpm eslint .

fmt:
    pnpm prettier --write .

typecheck:
    pnpm tsc --noEmit

check: lint typecheck test
    @just build
```

- [ ] **Step 6: Escribir la prueba que falla**

`src/lib/env.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { parseEnv } from './env'

const valido = {
  VITE_API_URL: 'https://api.example.com/api',
  VITE_COGNITO_USER_POOL_ID: 'us-east-1_ABC123',
  VITE_COGNITO_CLIENT_ID: 'cliente123',
  VITE_AWS_REGION: 'us-east-1',
}

describe('parseEnv', () => {
  it('devuelve la configuración cuando todas las variables son válidas', () => {
    expect(parseEnv(valido)).toEqual(valido)
  })

  it('nombra la variable que falta', () => {
    const { VITE_COGNITO_CLIENT_ID, ...incompleto } = valido
    expect(() => parseEnv(incompleto)).toThrow(/VITE_COGNITO_CLIENT_ID/)
  })

  it('rechaza una URL de API inválida', () => {
    expect(() => parseEnv({ ...valido, VITE_API_URL: 'no-es-una-url' })).toThrow(/VITE_API_URL/)
  })

  it('ignora variables ajenas', () => {
    expect(parseEnv({ ...valido, OTRA: 'x' })).toEqual(valido)
  })
})
```

- [ ] **Step 7: Ejecutar la prueba y verificar que falla**

Run: `just test`
Expected: FAIL — no existe el módulo `./env`.

- [ ] **Step 8: Implementar `src/lib/env.ts`**

```ts
import { z } from 'zod'

const esquema = z.object({
  VITE_API_URL: z
    .string()
    .refine((valor) => URL.canParse(valor), 'debe ser una URL absoluta'),
  VITE_COGNITO_USER_POOL_ID: z.string().min(1),
  VITE_COGNITO_CLIENT_ID: z.string().min(1),
  VITE_AWS_REGION: z.string().min(1),
})

export type Env = z.infer<typeof esquema>

export function parseEnv(source: Record<string, unknown>): Env {
  const resultado = esquema.safeParse(source)

  if (!resultado.success) {
    const variables = resultado.error.issues
      .map((problema) => problema.path.join('.'))
      .join(', ')
    throw new Error(
      `Configuración inválida. Revisa estas variables de entorno: ${variables}`,
    )
  }

  return resultado.data
}

export const env: Env = parseEnv(import.meta.env)
```

`safeParse` descarta las claves ajenas, lo que cubre la cuarta prueba sin código extra.

- [ ] **Step 9: Ejecutar las pruebas y verificar que pasan**

Run: `just test`
Expected: PASS, 4 pruebas.

- [ ] **Step 10: Verificar la puerta de calidad completa**

Run: `just check`
Expected: lint, typecheck, pruebas y build sin errores.

- [ ] **Step 11: Commit**

```bash
git add .
git commit -m "chore: scaffold vite project with typed environment config"
```

---

### Task 2: Cliente HTTP con errores por campo

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/lib/api.test.ts`
- Create: `src/test/msw.ts`

**Interfaces:**
- Consumes: `env` de `@/lib/env`.
- Produces:
  - `class ApiError extends Error` con `status: number` y `fieldErrors?: Record<string, string>`.
  - `request<T>(path: string, init?: RequestInit): Promise<T>`
  - `requestBlob(path: string, init?: RequestInit): Promise<Blob>`
  - `setAuthTokenReader(reader: () => string | null): void`
  - `setUnauthorizedHandler(handler: () => void): void`

La inversión de dependencias es deliberada: `api.ts` no importa `cognito.ts`. Quien arranca la aplicación le inyecta cómo leer el token y qué hacer ante un 401. Así el cliente HTTP se prueba solo.

- [ ] **Step 1: Crear el servidor MSW compartido**

`src/test/msw.ts`:

```ts
import { setupServer } from 'msw/node'

export const server = setupServer()
```

Agregar a `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './msw'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

- [ ] **Step 2: Escribir la prueba que falla**

`src/lib/api.test.ts`:

```ts
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, request, setAuthTokenReader, setUnauthorizedHandler } from './api'
import { server } from '@/test/msw'

const base = 'https://api.example.com/api'

describe('request', () => {
  beforeEach(() => {
    setAuthTokenReader(() => null)
    setUnauthorizedHandler(() => {})
  })

  it('devuelve el cuerpo JSON en una respuesta correcta', async () => {
    server.use(http.get(`${base}/consultas`, () => HttpResponse.json([{ id: '1' }])))

    await expect(request('/consultas')).resolves.toEqual([{ id: '1' }])
  })

  it('envía el token de autorización cuando existe', async () => {
    setAuthTokenReader(() => 'token-de-prueba')
    let recibido: string | null = null
    server.use(
      http.get(`${base}/consultas`, ({ request: peticion }) => {
        recibido = peticion.headers.get('Authorization')
        return HttpResponse.json([])
      }),
    )

    await request('/consultas')

    expect(recibido).toBe('Bearer token-de-prueba')
  })

  it('traduce details a fieldErrors en un 400', async () => {
    server.use(
      http.post(`${base}/consultas`, () =>
        HttpResponse.json(
          {
            error: true,
            message: 'Datos de entrada inválidos',
            details: [{ field: 'correo', message: 'Debe ser un email válido' }],
          },
          { status: 400 },
        ),
      ),
    )

    const error = await request('/consultas', { method: 'POST' }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(400)
    expect((error as ApiError).fieldErrors).toEqual({ correo: 'Debe ser un email válido' })
  })

  it('invoca el manejador de no autorizado en un 401', async () => {
    const manejador = vi.fn()
    setUnauthorizedHandler(manejador)
    server.use(
      http.get(`${base}/consultas`, () =>
        HttpResponse.json({ error: true, message: 'Token requerido' }, { status: 401 }),
      ),
    )

    await expect(request('/consultas')).rejects.toBeInstanceOf(ApiError)
    expect(manejador).toHaveBeenCalledOnce()
  })

  it('usa un mensaje genérico cuando el cuerpo del error no es JSON', async () => {
    server.use(
      http.get(`${base}/consultas`, () => new HttpResponse('caída', { status: 500 })),
    )

    const error = await request('/consultas').catch((e: unknown) => e as ApiError)

    expect(error.message).toBe('Error de comunicación con el servidor')
  })

  it('devuelve undefined en un 204', async () => {
    server.use(http.delete(`${base}/consultas/1`, () => new HttpResponse(null, { status: 204 })))

    await expect(request('/consultas/1', { method: 'DELETE' })).resolves.toBeUndefined()
  })
})
```

`.env.test` debe tener `VITE_API_URL=https://api.example.com/api` para que estas pruebas apunten a ese origen. Ajustarlo si quedó con otro valor en la tarea 1.

- [ ] **Step 3: Ejecutar la prueba y verificar que falla**

Run: `just test`
Expected: FAIL — no existe el módulo `./api`.

- [ ] **Step 4: Implementar `src/lib/api.ts`**

```ts
import { env } from './env'

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors?: Record<string, string>

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

interface CuerpoDeError {
  message?: string
  details?: Array<{ field: string; message: string }>
}

let leerToken: () => string | null = () => null
let alNoAutorizar: () => void = () => {}

export function setAuthTokenReader(reader: () => string | null): void {
  leerToken = reader
}

export function setUnauthorizedHandler(handler: () => void): void {
  alNoAutorizar = handler
}

async function enviar(path: string, init: RequestInit): Promise<Response> {
  const cabeceras = new Headers(init.headers)
  cabeceras.set('Content-Type', 'application/json')

  const token = leerToken()
  if (token) cabeceras.set('Authorization', `Bearer ${token}`)

  const respuesta = await fetch(`${env.VITE_API_URL}${path}`, { ...init, headers: cabeceras })

  if (!respuesta.ok) {
    if (respuesta.status === 401) alNoAutorizar()
    throw await comoApiError(respuesta)
  }

  return respuesta
}

async function comoApiError(respuesta: Response): Promise<ApiError> {
  let cuerpo: CuerpoDeError = {}

  try {
    cuerpo = (await respuesta.json()) as CuerpoDeError
  } catch {
    // El servidor respondió sin cuerpo JSON; queda el mensaje genérico.
  }

  const fieldErrors = cuerpo.details?.reduce<Record<string, string>>((acumulado, detalle) => {
    acumulado[detalle.field] = detalle.message
    return acumulado
  }, {})

  return new ApiError(
    respuesta.status,
    cuerpo.message ?? 'Error de comunicación con el servidor',
    fieldErrors,
  )
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const respuesta = await enviar(path, init)

  if (respuesta.status === 204) return undefined as T

  return (await respuesta.json()) as T
}

export async function requestBlob(path: string, init: RequestInit = {}): Promise<Blob> {
  const respuesta = await enviar(path, init)
  return await respuesta.blob()
}
```

- [ ] **Step 5: Ejecutar las pruebas y verificar que pasan**

Run: `just test`
Expected: PASS, 6 pruebas nuevas.

- [ ] **Step 6: Commit**

```bash
git add src/lib/api.ts src/lib/api.test.ts src/test/msw.ts src/test/setup.ts .env.test
git commit -m "feat: add http client that maps server validation errors to fields"
```

---

### Task 3: Port de la autenticación Cognito

**Files:**
- Create: `src/lib/cognito.ts`
- Create: `src/lib/cognito.test.ts`

**Interfaces:**
- Consumes: `env` de `@/lib/env`.
- Produces:
  - `type Rol = 'admin' | 'mentor'`
  - `interface AppUser { id: string; email: string; username: string; roles: string[]; rol: Rol }`
  - `class NoRoleAssignedError extends Error`
  - `interface NewPasswordChallenge { cognitoUser: CognitoUser; userAttributes: Record<string, string> }`
  - `type LoginResult = { status: 'authenticated'; user: AppUser } | { status: 'new-password-required'; challenge: NewPasswordChallenge }`
  - `deriveRole(groups: unknown): Rol | null`
  - `isTokenValid(token: string | null): boolean`
  - `getToken(): string | null`
  - `getStoredUser(): AppUser | null`
  - `login(email: string, password: string): Promise<LoginResult>`
  - `completeNewPassword(challenge: NewPasswordChallenge, newPassword: string): Promise<AppUser>`
  - `forgotPassword(email: string): Promise<void>`
  - `confirmPassword(email: string, code: string, newPassword: string): Promise<void>`
  - `logout(): void`

`changePassword` del servicio actual no se porta: ninguna pantalla lo usa.

- [ ] **Step 1: Escribir la prueba que falla**

`src/lib/cognito.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { deriveRole, getStoredUser, getToken, isTokenValid, logout } from './cognito'

function tokenConExpiracion(segundosDesdeAhora: number): string {
  const carga = { exp: Math.floor(Date.now() / 1000) + segundosDesdeAhora }
  return `cabecera.${btoa(JSON.stringify(carga))}.firma`
}

describe('deriveRole', () => {
  it('prefiere admin cuando el usuario tiene ambos grupos', () => {
    expect(deriveRole(['mentor', 'admin'])).toBe('admin')
  })

  it('reconoce mentor', () => {
    expect(deriveRole(['mentor'])).toBe('mentor')
  })

  it('acepta los grupos como cadena JSON', () => {
    expect(deriveRole('["admin"]')).toBe('admin')
  })

  it('acepta un grupo suelto como cadena', () => {
    expect(deriveRole('mentor')).toBe('mentor')
  })

  it('devuelve null sin grupos conocidos', () => {
    expect(deriveRole(['visitante'])).toBeNull()
    expect(deriveRole([])).toBeNull()
    expect(deriveRole(undefined)).toBeNull()
  })
})

describe('isTokenValid', () => {
  it('acepta un token vigente', () => {
    expect(isTokenValid(tokenConExpiracion(3600))).toBe(true)
  })

  it('rechaza un token expirado', () => {
    expect(isTokenValid(tokenConExpiracion(-10))).toBe(false)
  })

  it('rechaza un token ilegible', () => {
    expect(isTokenValid('basura')).toBe(false)
  })

  it('rechaza la ausencia de token', () => {
    expect(isTokenValid(null)).toBe(false)
  })
})

describe('almacenamiento de sesión', () => {
  beforeEach(() => localStorage.clear())

  it('devuelve null cuando no hay sesión', () => {
    expect(getToken()).toBeNull()
    expect(getStoredUser()).toBeNull()
  })

  it('lee el usuario guardado', () => {
    const usuario = {
      id: 'sub-1',
      email: 'ana@nadro.com',
      username: 'ana',
      roles: ['mentor'],
      rol: 'mentor',
    }
    localStorage.setItem('user', JSON.stringify(usuario))

    expect(getStoredUser()).toEqual(usuario)
  })

  it('devuelve null si el usuario guardado está corrupto', () => {
    localStorage.setItem('user', '{no-es-json')

    expect(getStoredUser()).toBeNull()
  })

  it('borra todas las claves al cerrar sesión', () => {
    localStorage.setItem('idToken', 'a')
    localStorage.setItem('accessToken', 'b')
    localStorage.setItem('refreshToken', 'c')
    localStorage.setItem('user', '{}')

    logout()

    expect(localStorage.getItem('idToken')).toBeNull()
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })
})
```

- [ ] **Step 2: Ejecutar la prueba y verificar que falla**

Run: `just test`
Expected: FAIL — no existe el módulo `./cognito`.

- [ ] **Step 3: Implementar `src/lib/cognito.ts`**

```ts
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  type CognitoUserSession,
} from 'amazon-cognito-identity-js'
import { env } from './env'

export type Rol = 'admin' | 'mentor'

export interface AppUser {
  id: string
  email: string
  username: string
  roles: string[]
  rol: Rol
}

export interface NewPasswordChallenge {
  cognitoUser: CognitoUser
  userAttributes: Record<string, string>
}

export type LoginResult =
  | { status: 'authenticated'; user: AppUser }
  | { status: 'new-password-required'; challenge: NewPasswordChallenge }

export class NoRoleAssignedError extends Error {
  constructor() {
    super('Tu cuenta no tiene un rol asignado. Contacta al administrador del sistema.')
    this.name = 'NoRoleAssignedError'
  }
}

const pool = new CognitoUserPool({
  UserPoolId: env.VITE_COGNITO_USER_POOL_ID,
  ClientId: env.VITE_COGNITO_CLIENT_ID,
})

export function deriveRole(groups: unknown): Rol | null {
  const lista = normalizarGrupos(groups)

  if (lista.includes('admin')) return 'admin'
  if (lista.includes('mentor')) return 'mentor'

  return null
}

function normalizarGrupos(groups: unknown): string[] {
  if (Array.isArray(groups)) return groups.filter((g): g is string => typeof g === 'string')

  if (typeof groups === 'string') {
    try {
      const analizado: unknown = JSON.parse(groups)
      return Array.isArray(analizado)
        ? analizado.filter((g): g is string => typeof g === 'string')
        : [groups]
    } catch {
      return [groups]
    }
  }

  return []
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false

  try {
    const carga: unknown = JSON.parse(atob(token.split('.')[1]))

    if (typeof carga !== 'object' || carga === null || !('exp' in carga)) return false

    const expiracion = (carga as { exp: unknown }).exp

    return typeof expiracion === 'number' && expiracion > Date.now() / 1000
  } catch {
    return false
  }
}

export function getToken(): string | null {
  return localStorage.getItem('idToken')
}

export function getStoredUser(): AppUser | null {
  const crudo = localStorage.getItem('user')
  if (!crudo) return null

  try {
    return JSON.parse(crudo) as AppUser
  } catch {
    return null
  }
}

export function logout(): void {
  pool.getCurrentUser()?.signOut()
  localStorage.removeItem('idToken')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

function guardarSesion(session: CognitoUserSession): AppUser {
  const carga = session.getIdToken().payload
  const rol = deriveRole(carga['cognito:groups'])

  if (!rol) throw new NoRoleAssignedError()

  const usuario: AppUser = {
    id: String(carga.sub),
    email: String(carga.email),
    username: String(carga['cognito:username'] ?? carga.email),
    roles: normalizarGrupos(carga['cognito:groups']),
    rol,
  }

  localStorage.setItem('idToken', session.getIdToken().getJwtToken())
  localStorage.setItem('accessToken', session.getAccessToken().getJwtToken())
  localStorage.setItem('refreshToken', session.getRefreshToken().getToken())
  localStorage.setItem('user', JSON.stringify(usuario))

  return usuario
}

export function login(email: string, password: string): Promise<LoginResult> {
  return new Promise((resolver, rechazar) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: pool })
    const credenciales = new AuthenticationDetails({ Username: email, Password: password })

    cognitoUser.authenticateUser(credenciales, {
      onSuccess: (session) => {
        try {
          resolver({ status: 'authenticated', user: guardarSesion(session) })
        } catch (error) {
          rechazar(error)
        }
      },
      onFailure: rechazar,
      newPasswordRequired: (userAttributes: Record<string, string>) => {
        resolver({
          status: 'new-password-required',
          challenge: { cognitoUser, userAttributes },
        })
      },
    })
  })
}

export function completeNewPassword(
  challenge: NewPasswordChallenge,
  newPassword: string,
): Promise<AppUser> {
  return new Promise((resolver, rechazar) => {
    const atributos = { ...challenge.userAttributes }
    const correo = atributos.email ?? challenge.cognitoUser.getUsername()

    // Cognito exige 'name' en el reto y prohíbe reenviar email y email_verified.
    atributos.name ??= correo.split('@')[0].replace(/[._]/g, ' ')
    delete atributos.email
    delete atributos.email_verified

    challenge.cognitoUser.completeNewPasswordChallenge(newPassword, atributos, {
      onSuccess: (session) => {
        try {
          resolver(guardarSesion(session))
        } catch (error) {
          rechazar(error)
        }
      },
      onFailure: rechazar,
    })
  })
}

export function forgotPassword(email: string): Promise<void> {
  return new Promise((resolver, rechazar) => {
    new CognitoUser({ Username: email, Pool: pool }).forgotPassword({
      onSuccess: () => resolver(),
      onFailure: rechazar,
    })
  })
}

export function confirmPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  return new Promise((resolver, rechazar) => {
    new CognitoUser({ Username: email, Pool: pool }).confirmPassword(code, newPassword, {
      onSuccess: () => resolver(),
      onFailure: rechazar,
    })
  })
}
```

- [ ] **Step 4: Ejecutar las pruebas y verificar que pasan**

Run: `just test`
Expected: PASS, 13 pruebas nuevas.

- [ ] **Step 5: Verificar tipos**

Run: `just typecheck`
Expected: sin errores.

Si `completeNewPasswordChallenge` reclama el tipo de `atributos`, ajustar la firma a `Record<string, string>` sin recurrir a `any`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/cognito.ts src/lib/cognito.test.ts
git commit -m "feat: port cognito authentication to typescript"
```

---

### Task 4: Contexto de sesión y guards de ruta

**Files:**
- Create: `src/features/auth/auth-context.ts`
- Create: `src/features/auth/AuthProvider.tsx`
- Create: `src/features/auth/use-auth.ts`
- Create: `src/features/auth/guards.tsx`
- Create: `src/features/auth/guards.test.tsx`
- Create: `src/features/auth/index.ts`

**Interfaces:**
- Consumes: `AppUser`, `Rol`, `getStoredUser`, `getToken`, `isTokenValid`, `logout` de `@/lib/cognito`; `setAuthTokenReader`, `setUnauthorizedHandler` de `@/lib/api`.
- Produces:
  - `interface AuthContextValue { user: AppUser | null; status: 'loading' | 'authenticated' | 'anonymous'; signIn(user: AppUser): void; signOut(): void }`
  - `AuthProvider({ children }: { children: React.ReactNode })`
  - `useAuth(): AuthContextValue`
  - `RequireAuth()` y `RequireRole({ allowed }: { allowed: Rol[] })`, ambos componentes de ruta que renderizan `<Outlet />`.
  - `src/features/auth/index.ts` reexporta `AuthProvider`, `useAuth`, `RequireAuth`, `RequireRole`.

- [ ] **Step 1: Escribir la prueba que falla**

`src/features/auth/guards.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from './AuthProvider'
import { RequireAuth, RequireRole } from './guards'

function tokenVigente(): string {
  const carga = { exp: Math.floor(Date.now() / 1000) + 3600 }
  return `cabecera.${btoa(JSON.stringify(carga))}.firma`
}

function sesionDe(rol: 'admin' | 'mentor'): void {
  localStorage.setItem('idToken', tokenVigente())
  localStorage.setItem(
    'user',
    JSON.stringify({ id: '1', email: 'a@nadro.com', username: 'a', roles: [rol], rol }),
  )
}

function renderizarEn(ruta: string) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<p>Pantalla de acceso</p>} />
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<p>Panel</p>} />
            <Route element={<RequireRole allowed={['admin']} />}>
              <Route path="/dashboard/stats" element={<p>Estadísticas</p>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('guards de ruta', () => {
  beforeEach(() => localStorage.clear())

  it('manda al acceso cuando no hay sesión', async () => {
    renderizarEn('/dashboard')

    expect(await screen.findByText('Pantalla de acceso')).toBeInTheDocument()
  })

  it('manda al acceso cuando el token expiró', async () => {
    sesionDe('mentor')
    localStorage.setItem('idToken', `cabecera.${btoa(JSON.stringify({ exp: 1 }))}.firma`)

    renderizarEn('/dashboard')

    expect(await screen.findByText('Pantalla de acceso')).toBeInTheDocument()
  })

  it('deja pasar a un usuario con sesión válida', async () => {
    sesionDe('mentor')

    renderizarEn('/dashboard')

    expect(await screen.findByText('Panel')).toBeInTheDocument()
  })

  it('bloquea una ruta de admin a un mentor', async () => {
    sesionDe('mentor')

    renderizarEn('/dashboard/stats')

    expect(await screen.findByText('Panel')).toBeInTheDocument()
    expect(screen.queryByText('Estadísticas')).not.toBeInTheDocument()
  })

  it('deja pasar a un admin a su ruta', async () => {
    sesionDe('admin')

    renderizarEn('/dashboard/stats')

    expect(await screen.findByText('Estadísticas')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Ejecutar la prueba y verificar que falla**

Run: `just test`
Expected: FAIL — no existen los módulos.

- [ ] **Step 3: Implementar el contexto**

`src/features/auth/auth-context.ts`:

```ts
import { createContext } from 'react'
import type { AppUser } from '@/lib/cognito'

export interface AuthContextValue {
  user: AppUser | null
  status: 'loading' | 'authenticated' | 'anonymous'
  signIn: (user: AppUser) => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
```

`src/features/auth/use-auth.ts`:

```ts
import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './auth-context'

export function useAuth(): AuthContextValue {
  const valor = useContext(AuthContext)

  if (!valor) throw new Error('useAuth debe usarse dentro de AuthProvider')

  return valor
}
```

- [ ] **Step 4: Implementar `AuthProvider`**

`src/features/auth/AuthProvider.tsx`:

```tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { setAuthTokenReader, setUnauthorizedHandler } from '@/lib/api'
import { getStoredUser, getToken, isTokenValid, logout, type AppUser } from '@/lib/cognito'
import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [status, setStatus] = useState<AuthContextValue['status']>('loading')

  const signOut = useCallback(() => {
    logout()
    setUser(null)
    setStatus('anonymous')
  }, [])

  const signIn = useCallback((nuevo: AppUser) => {
    setUser(nuevo)
    setStatus('authenticated')
  }, [])

  useEffect(() => {
    setAuthTokenReader(getToken)
    setUnauthorizedHandler(signOut)
  }, [signOut])

  useEffect(() => {
    const guardado = getStoredUser()

    if (guardado && isTokenValid(getToken())) {
      setUser(guardado)
      setStatus('authenticated')
      return
    }

    logout()
    setStatus('anonymous')
  }, [])

  const valor = useMemo<AuthContextValue>(
    () => ({ user, status, signIn, signOut }),
    [user, status, signIn, signOut],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
```

- [ ] **Step 5: Implementar los guards**

`src/features/auth/guards.tsx`:

```tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '@/lib/cognito'
import { useAuth } from './use-auth'

export function RequireAuth() {
  const { status } = useAuth()
  const ubicacion = useLocation()

  if (status === 'loading') return <p role="status">Cargando…</p>

  if (status === 'anonymous') {
    return <Navigate to="/login" state={{ from: ubicacion }} replace />
  }

  return <Outlet />
}

export function RequireRole({ allowed }: { allowed: Rol[] }) {
  const { user } = useAuth()

  if (!user || !allowed.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
```

`src/features/auth/index.ts`:

```ts
export { AuthProvider } from './AuthProvider'
export { RequireAuth, RequireRole } from './guards'
export { useAuth } from './use-auth'
```

- [ ] **Step 6: Ejecutar las pruebas y verificar que pasan**

Run: `just test`
Expected: PASS, 5 pruebas nuevas.

- [ ] **Step 7: Commit**

```bash
git add src/features/auth
git commit -m "feat: add session context and route guards"
```

---

### Task 5: Estilos, layout y árbol de rutas

**Files:**
- Create: `src/app/providers.tsx`, `src/app/router.tsx`, `src/lib/query-client.ts`
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/components/ErrorBoundary.tsx`
- Create: `src/features/dashboard/pages/DashboardPage.tsx`
- Create: `src/app/router.test.tsx`
- Modify: `src/main.tsx`, `src/index.css`, `vite.config.ts`
- Delete: `src/App.tsx`, `src/App.css`, `src/assets/react.svg`

**Interfaces:**
- Consumes: `AuthProvider`, `RequireAuth`, `useAuth` de `@/features/auth`.
- Produces:
  - `queryClient` de `@/lib/query-client`
  - `AppProviders({ children })` de `@/app/providers`
  - `router` de `@/app/router`, con las rutas `/login`, `/dashboard` y el comodín que redirige a `/dashboard`.
  - `AppShell()` renderiza cabecera con el nombre del usuario, un botón «Cerrar sesión» y `<Outlet />`.

Los tokens de color quedan en los valores neutros de shadcn. La identidad visual aterriza en el tramo 4; cambiarla será editar las variables CSS de `src/index.css`.

- [ ] **Step 1: Instalar Tailwind 4 y shadcn/ui**

```bash
pnpm add tailwindcss @tailwindcss/vite
pnpm dlx shadcn@latest init -d
pnpm dlx shadcn@latest add button input label card alert sonner
```

Agregar el plugin en `vite.config.ts`:

```ts
import tailwindcss from '@tailwindcss/vite'
// …
plugins: [react(), tailwindcss()],
```

Dejar `src/index.css` empezando con `@import "tailwindcss";` seguido de las variables que escribió `shadcn init`.

- [ ] **Step 2: Escribir la prueba que falla**

`src/app/router.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '@/features/auth'
import { rutas } from './router'

function sesionDeMentor(): void {
  const carga = { exp: Math.floor(Date.now() / 1000) + 3600 }
  localStorage.setItem('idToken', `cabecera.${btoa(JSON.stringify(carga))}.firma`)
  localStorage.setItem(
    'user',
    JSON.stringify({
      id: '1',
      email: 'ana@nadro.com',
      username: 'Ana',
      roles: ['mentor'],
      rol: 'mentor',
    }),
  )
}

function renderizarEn(ruta: string) {
  const router = createMemoryRouter(rutas, { initialEntries: [ruta] })
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  )
}

describe('árbol de rutas', () => {
  beforeEach(() => localStorage.clear())

  it('redirige la raíz al panel', async () => {
    sesionDeMentor()

    renderizarEn('/')

    expect(await screen.findByRole('heading', { name: /panel/i })).toBeInTheDocument()
  })

  it('muestra el nombre del usuario en la cabecera', async () => {
    sesionDeMentor()

    renderizarEn('/dashboard')

    expect(await screen.findByText('Ana')).toBeInTheDocument()
  })

  it('cierra la sesión desde la cabecera', async () => {
    sesionDeMentor()
    const usuario = userEvent.setup()

    renderizarEn('/dashboard')
    await usuario.click(await screen.findByRole('button', { name: /cerrar sesión/i }))

    expect(localStorage.getItem('idToken')).toBeNull()
  })
})
```

- [ ] **Step 3: Ejecutar la prueba y verificar que falla**

Run: `just test`
Expected: FAIL — no existe `./router`.

- [ ] **Step 4: Implementar el cliente de consultas y los providers**

`src/lib/query-client.ts`:

```ts
import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (intentos, error) => {
        if (error instanceof ApiError && error.status < 500) return false
        return intentos < 2
      },
    },
  },
})
```

`src/components/ErrorBoundary.tsx`:

```tsx
import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  fallo: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { fallo: false }

  static getDerivedStateFromError(): State {
    return { fallo: true }
  }

  render() {
    if (this.state.fallo) {
      return (
        <div role="alert" className="p-8">
          <h1 className="text-lg font-semibold">Algo salió mal</h1>
          <p>Recarga la página. Si el problema sigue, avisa al administrador.</p>
        </div>
      )
    }

    return this.props.children
  }
}
```

`src/app/providers.tsx`:

```tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/features/auth'
import { queryClient } from '@/lib/query-client'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
```

- [ ] **Step 5: Implementar el layout y la página protegida**

`src/components/layout/AppShell.tsx`:

```tsx
import { Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth'

export function AppShell() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="font-semibold">Mentoría</span>
        <div className="flex items-center gap-4">
          <span>{user?.username}</span>
          <Button variant="outline" onClick={signOut}>
            Cerrar sesión
          </Button>
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
```

`src/features/dashboard/pages/DashboardPage.tsx`:

```tsx
import { useAuth } from '@/features/auth'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <section>
      <h1 className="text-xl font-semibold">Panel</h1>
      <p>Sesión iniciada como {user?.email}.</p>
    </section>
  )
}
```

Esta página es un marcador de posición deliberado: el dashboard real llega en el tramo 4.

- [ ] **Step 6: Implementar el árbol de rutas**

`src/app/router.tsx`:

```tsx
import { Navigate, type RouteObject } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { RequireAuth } from '@/features/auth'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

export const rutas: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [{ path: '/dashboard', element: <DashboardPage /> }],
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]
```

`LoginPage` todavía no existe. Crear por ahora un archivo mínimo en `src/features/auth/pages/LoginPage.tsx` que la tarea 6 reemplaza:

```tsx
export function LoginPage() {
  return <h1>Acceso</h1>
}
```

- [ ] **Step 7: Reemplazar el punto de entrada**

`src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AppProviders } from '@/app/providers'
import { rutas } from '@/app/router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={createBrowserRouter(rutas)} />
    </AppProviders>
  </StrictMode>,
)
```

Borrar `src/App.tsx`, `src/App.css` y `src/assets/react.svg`.

- [ ] **Step 8: Ejecutar las pruebas y verificar que pasan**

Run: `just test`
Expected: PASS, 3 pruebas nuevas.

- [ ] **Step 9: Verificar la puerta de calidad**

Run: `just check`
Expected: sin errores.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add app shell, providers and protected route tree"
```

---

### Task 6: Inicio de sesión con credenciales

**Files:**
- Create: `src/features/auth/schemas.ts`
- Create: `src/features/auth/components/CredentialsForm.tsx`
- Modify: `src/features/auth/pages/LoginPage.tsx`
- Create: `src/features/auth/pages/LoginPage.test.tsx`

**Interfaces:**
- Consumes: `login`, `NoRoleAssignedError` de `@/lib/cognito`; `useAuth` de `@/features/auth`.
- Produces:
  - `credentialsSchema` y `type CredentialsInput = { email: string; password: string }` en `schemas.ts`.
  - `CredentialsForm({ onSubmit, error }: { onSubmit(valores: CredentialsInput): Promise<void>; error: string | null })`
  - `LoginPage()` que, tras autenticar, llama `signIn(user)` y navega a la ruta guardada en `location.state.from` o a `/dashboard`.

- [ ] **Step 1: Escribir la prueba que falla**

`src/features/auth/pages/LoginPage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/features/auth'
import { rutas } from '@/app/router'

vi.mock('@/lib/cognito', async () => {
  const real = await vi.importActual<typeof import('@/lib/cognito')>('@/lib/cognito')
  return { ...real, login: vi.fn(), forgotPassword: vi.fn(), confirmPassword: vi.fn() }
})

const { login } = await import('@/lib/cognito')

function renderizarAcceso() {
  const router = createMemoryRouter(rutas, { initialEntries: ['/login'] })
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  )
}

const usuarioMentor = {
  id: '1',
  email: 'ana@nadro.com',
  username: 'Ana',
  roles: ['mentor'],
  rol: 'mentor' as const,
}

describe('inicio de sesión', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(login).mockReset()
  })

  it('exige un correo válido', async () => {
    const usuario = userEvent.setup()
    renderizarAcceso()

    await usuario.type(screen.getByLabelText(/correo/i), 'no-es-correo')
    await usuario.type(screen.getByLabelText(/contraseña/i), 'Secreta1!')
    await usuario.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText(/correo electrónico válido/i)).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('lleva al panel tras autenticar', async () => {
    vi.mocked(login).mockResolvedValue({ status: 'authenticated', user: usuarioMentor })
    const usuario = userEvent.setup()
    renderizarAcceso()

    await usuario.type(screen.getByLabelText(/correo/i), 'ana@nadro.com')
    await usuario.type(screen.getByLabelText(/contraseña/i), 'Secreta1!')
    await usuario.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('heading', { name: /panel/i })).toBeInTheDocument()
  })

  it('muestra el mensaje cuando la cuenta no tiene rol', async () => {
    const { NoRoleAssignedError } = await vi.importActual<typeof import('@/lib/cognito')>(
      '@/lib/cognito',
    )
    vi.mocked(login).mockRejectedValue(new NoRoleAssignedError())
    const usuario = userEvent.setup()
    renderizarAcceso()

    await usuario.type(screen.getByLabelText(/correo/i), 'ana@nadro.com')
    await usuario.type(screen.getByLabelText(/contraseña/i), 'Secreta1!')
    await usuario.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText(/no tiene un rol asignado/i)).toBeInTheDocument()
  })

  it('muestra un mensaje cuando las credenciales son incorrectas', async () => {
    vi.mocked(login).mockRejectedValue(
      Object.assign(new Error('Incorrect username or password.'), {
        code: 'NotAuthorizedException',
      }),
    )
    const usuario = userEvent.setup()
    renderizarAcceso()

    await usuario.type(screen.getByLabelText(/correo/i), 'ana@nadro.com')
    await usuario.type(screen.getByLabelText(/contraseña/i), 'Equivocada1!')
    await usuario.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText(/correo o contraseña incorrectos/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Ejecutar la prueba y verificar que falla**

Run: `just test`
Expected: FAIL — la página solo muestra el encabezado «Acceso».

- [ ] **Step 3: Implementar los esquemas**

`src/features/auth/schemas.ts`:

```ts
import { z } from 'zod'

const REGLA_CONTRASENA = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/

export const credentialsSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export const contrasenaNueva = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(REGLA_CONTRASENA, 'Debe incluir mayúsculas, minúsculas, números y símbolos')

export type CredentialsInput = z.infer<typeof credentialsSchema>
```

- [ ] **Step 4: Implementar el traductor de errores de Cognito**

Agregar al final de `src/features/auth/schemas.ts`:

```ts
export function mensajeDeError(error: unknown): string {
  if (error instanceof Error && 'code' in error) {
    const codigo = (error as { code: unknown }).code

    if (codigo === 'NotAuthorizedException') return 'Correo o contraseña incorrectos'
    if (codigo === 'UserNotFoundException') return 'Correo o contraseña incorrectos'
    if (codigo === 'CodeMismatchException') return 'El código de verificación no es válido'
    if (codigo === 'ExpiredCodeException') return 'El código expiró. Solicita uno nuevo'
    if (codigo === 'LimitExceededException')
      return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo'
  }

  if (error instanceof Error && error.message) return error.message

  return 'No pudimos completar la operación. Inténtalo de nuevo'
}
```

`NoRoleAssignedError` cae en la penúltima rama y expone su propio mensaje, que es el que la prueba busca.

- [ ] **Step 5: Implementar el formulario de credenciales**

`src/features/auth/components/CredentialsForm.tsx`:

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { credentialsSchema, type CredentialsInput } from '../schemas'

interface Props {
  onSubmit: (valores: CredentialsInput) => Promise<void>
  error: string | null
  onForgotPassword: () => void
}

export function CredentialsForm({ onSubmit, error, onForgotPassword }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CredentialsInput>({ resolver: zodResolver(credentialsSchema) })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input id="email" type="email" autoComplete="username" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando…' : 'Entrar'}
      </Button>

      <Button type="button" variant="link" onClick={onForgotPassword}>
        ¿Olvidaste tu contraseña?
      </Button>
    </form>
  )
}
```

- [ ] **Step 6: Implementar la página**

`src/features/auth/pages/LoginPage.tsx`:

```tsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '@/lib/cognito'
import { CredentialsForm } from '../components/CredentialsForm'
import { mensajeDeError, type CredentialsInput } from '../schemas'
import { useAuth } from '../use-auth'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const ubicacion = useLocation()
  const [error, setError] = useState<string | null>(null)

  const destino =
    (ubicacion.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard'

  async function autenticar(valores: CredentialsInput): Promise<void> {
    setError(null)

    try {
      const resultado = await login(valores.email.toLowerCase(), valores.password)

      if (resultado.status === 'authenticated') {
        signIn(resultado.user)
        navigate(destino, { replace: true })
      }
    } catch (fallo) {
      setError(mensajeDeError(fallo))
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center p-6">
      <h1 className="mb-6 text-xl font-semibold">Acceso</h1>
      <CredentialsForm onSubmit={autenticar} error={error} onForgotPassword={() => {}} />
    </main>
  )
}
```

El caso `new-password-required` queda sin atender a propósito: lo implementa la tarea 7.

- [ ] **Step 7: Ejecutar las pruebas y verificar que pasan**

Run: `just test`
Expected: PASS, 4 pruebas nuevas.

- [ ] **Step 8: Commit**

```bash
git add src/features/auth
git commit -m "feat: add credentials sign-in flow"
```

---

### Task 7: Cambio de contraseña temporal

**Files:**
- Create: `src/features/auth/components/NewPasswordForm.tsx`
- Modify: `src/features/auth/schemas.ts`, `src/features/auth/pages/LoginPage.tsx`
- Create: `src/features/auth/components/NewPasswordForm.test.tsx`

**Interfaces:**
- Consumes: `completeNewPassword`, `type NewPasswordChallenge` de `@/lib/cognito`; `contrasenaNueva` y `mensajeDeError` de `../schemas`.
- Produces:
  - `newPasswordSchema` y `type NewPasswordInput = { newPassword: string; confirmPassword: string }`
  - `NewPasswordForm({ onSubmit, error }: { onSubmit(valores: NewPasswordInput): Promise<void>; error: string | null })`

- [ ] **Step 1: Escribir la prueba que falla**

`src/features/auth/components/NewPasswordForm.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NewPasswordForm } from './NewPasswordForm'

describe('NewPasswordForm', () => {
  it('rechaza una contraseña corta', async () => {
    const enviar = vi.fn()
    const usuario = userEvent.setup()
    render(<NewPasswordForm onSubmit={enviar} error={null} />)

    await usuario.type(screen.getByLabelText(/nueva contraseña/i), 'Ab1!')
    await usuario.type(screen.getByLabelText(/confirma/i), 'Ab1!')
    await usuario.click(screen.getByRole('button', { name: /guardar/i }))

    expect(await screen.findByText(/al menos 8 caracteres/i)).toBeInTheDocument()
    expect(enviar).not.toHaveBeenCalled()
  })

  it('exige mayúsculas, minúsculas, números y símbolos', async () => {
    const enviar = vi.fn()
    const usuario = userEvent.setup()
    render(<NewPasswordForm onSubmit={enviar} error={null} />)

    await usuario.type(screen.getByLabelText(/nueva contraseña/i), 'solominusculas')
    await usuario.type(screen.getByLabelText(/confirma/i), 'solominusculas')
    await usuario.click(screen.getByRole('button', { name: /guardar/i }))

    expect(await screen.findByText(/mayúsculas, minúsculas/i)).toBeInTheDocument()
    expect(enviar).not.toHaveBeenCalled()
  })

  it('exige que ambas contraseñas coincidan', async () => {
    const enviar = vi.fn()
    const usuario = userEvent.setup()
    render(<NewPasswordForm onSubmit={enviar} error={null} />)

    await usuario.type(screen.getByLabelText(/nueva contraseña/i), 'Secreta1!')
    await usuario.type(screen.getByLabelText(/confirma/i), 'Distinta1!')
    await usuario.click(screen.getByRole('button', { name: /guardar/i }))

    expect(await screen.findByText(/no coinciden/i)).toBeInTheDocument()
    expect(enviar).not.toHaveBeenCalled()
  })

  it('envía cuando la contraseña cumple las reglas', async () => {
    const enviar = vi.fn().mockResolvedValue(undefined)
    const usuario = userEvent.setup()
    render(<NewPasswordForm onSubmit={enviar} error={null} />)

    await usuario.type(screen.getByLabelText(/nueva contraseña/i), 'Secreta1!')
    await usuario.type(screen.getByLabelText(/confirma/i), 'Secreta1!')
    await usuario.click(screen.getByRole('button', { name: /guardar/i }))

    expect(enviar).toHaveBeenCalledWith(
      { newPassword: 'Secreta1!', confirmPassword: 'Secreta1!' },
      expect.anything(),
    )
  })
})
```

- [ ] **Step 2: Ejecutar la prueba y verificar que falla**

Run: `just test`
Expected: FAIL — no existe el módulo `./NewPasswordForm`.

- [ ] **Step 3: Agregar el esquema**

Agregar a `src/features/auth/schemas.ts`:

```ts
export const newPasswordSchema = z
  .object({
    newPassword: contrasenaNueva,
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((valores) => valores.newPassword === valores.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })

export type NewPasswordInput = z.infer<typeof newPasswordSchema>
```

- [ ] **Step 4: Implementar el formulario**

`src/features/auth/components/NewPasswordForm.tsx`:

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { newPasswordSchema, type NewPasswordInput } from '../schemas'

interface Props {
  onSubmit: (valores: NewPasswordInput) => Promise<void> | void
  error: string | null
}

export function NewPasswordForm({ onSubmit, error }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordInput>({ resolver: zodResolver(newPasswordSchema) })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <p>Tu contraseña es temporal. Define una nueva para continuar.</p>

      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">Nueva contraseña</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          {...register('newPassword')}
        />
        {errors.newPassword && (
          <p className="text-sm text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirma la contraseña</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando…' : 'Guardar contraseña'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 5: Conectar el flujo en la página**

En `src/features/auth/pages/LoginPage.tsx`, agregar el estado del reto y su rama:

```tsx
const [reto, setReto] = useState<NewPasswordChallenge | null>(null)
```

Dentro de `autenticar`, reemplazar el `if` por:

```tsx
if (resultado.status === 'authenticated') {
  signIn(resultado.user)
  navigate(destino, { replace: true })
  return
}

setReto(resultado.challenge)
```

Agregar el manejador y la rama de render:

```tsx
async function definirContrasena(valores: NewPasswordInput): Promise<void> {
  if (!reto) return
  setError(null)

  try {
    const usuario = await completeNewPassword(reto, valores.newPassword)
    signIn(usuario)
    navigate(destino, { replace: true })
  } catch (fallo) {
    setError(mensajeDeError(fallo))
  }
}
```

```tsx
{reto ? (
  <NewPasswordForm onSubmit={definirContrasena} error={error} />
) : (
  <CredentialsForm onSubmit={autenticar} error={error} onForgotPassword={() => {}} />
)}
```

Importar `completeNewPassword` y `type NewPasswordChallenge` de `@/lib/cognito`, `NewPasswordForm` de `../components/NewPasswordForm` y `type NewPasswordInput` de `../schemas`. Agregar `completeNewPassword: vi.fn()` al mock de `@/lib/cognito` en `LoginPage.test.tsx`.

- [ ] **Step 6: Ejecutar las pruebas y verificar que pasan**

Run: `just test`
Expected: PASS, 4 pruebas nuevas y ninguna regresión.

- [ ] **Step 7: Commit**

```bash
git add src/features/auth
git commit -m "feat: add temporary password change flow"
```

---

### Task 8: Recuperación de contraseña

**Files:**
- Create: `src/features/auth/components/ForgotPasswordForm.tsx`
- Create: `src/features/auth/components/ForgotPasswordForm.test.tsx`
- Modify: `src/features/auth/schemas.ts`, `src/features/auth/pages/LoginPage.tsx`

**Interfaces:**
- Consumes: `forgotPassword`, `confirmPassword` de `@/lib/cognito`; `contrasenaNueva`, `mensajeDeError` de `../schemas`.
- Produces:
  - `emailSchema` con `{ email: string }` y `resetPasswordSchema` con `{ code: string; newPassword: string; confirmPassword: string }`
  - `ForgotPasswordForm({ onBack })`, que gestiona internamente sus dos pasos y llama a Cognito directamente.

- [ ] **Step 1: Escribir la prueba que falla**

`src/features/auth/components/ForgotPasswordForm.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ForgotPasswordForm } from './ForgotPasswordForm'

vi.mock('@/lib/cognito', async () => {
  const real = await vi.importActual<typeof import('@/lib/cognito')>('@/lib/cognito')
  return { ...real, forgotPassword: vi.fn(), confirmPassword: vi.fn() }
})

const { confirmPassword, forgotPassword } = await import('@/lib/cognito')

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.mocked(forgotPassword).mockReset().mockResolvedValue(undefined)
    vi.mocked(confirmPassword).mockReset().mockResolvedValue(undefined)
  })

  it('pide un correo válido antes de enviar el código', async () => {
    const usuario = userEvent.setup()
    render(<ForgotPasswordForm onBack={vi.fn()} />)

    await usuario.type(screen.getByLabelText(/correo/i), 'invalido')
    await usuario.click(screen.getByRole('button', { name: /enviar código/i }))

    expect(await screen.findByText(/correo electrónico válido/i)).toBeInTheDocument()
    expect(forgotPassword).not.toHaveBeenCalled()
  })

  it('pasa al segundo paso tras enviar el código', async () => {
    const usuario = userEvent.setup()
    render(<ForgotPasswordForm onBack={vi.fn()} />)

    await usuario.type(screen.getByLabelText(/correo/i), 'Ana@Nadro.com')
    await usuario.click(screen.getByRole('button', { name: /enviar código/i }))

    expect(forgotPassword).toHaveBeenCalledWith('ana@nadro.com')
    expect(await screen.findByLabelText(/código/i)).toBeInTheDocument()
  })

  it('restablece la contraseña con el código', async () => {
    const usuario = userEvent.setup()
    render(<ForgotPasswordForm onBack={vi.fn()} />)

    await usuario.type(screen.getByLabelText(/correo/i), 'ana@nadro.com')
    await usuario.click(screen.getByRole('button', { name: /enviar código/i }))

    await usuario.type(await screen.findByLabelText(/código/i), '123456')
    await usuario.type(screen.getByLabelText(/nueva contraseña/i), 'Secreta1!')
    await usuario.type(screen.getByLabelText(/confirma/i), 'Secreta1!')
    await usuario.click(screen.getByRole('button', { name: /restablecer/i }))

    expect(confirmPassword).toHaveBeenCalledWith('ana@nadro.com', '123456', 'Secreta1!')
    expect(await screen.findByText(/ya puedes entrar/i)).toBeInTheDocument()
  })

  it('avisa cuando el código no es válido', async () => {
    vi.mocked(confirmPassword).mockRejectedValue(
      Object.assign(new Error('Invalid code'), { code: 'CodeMismatchException' }),
    )
    const usuario = userEvent.setup()
    render(<ForgotPasswordForm onBack={vi.fn()} />)

    await usuario.type(screen.getByLabelText(/correo/i), 'ana@nadro.com')
    await usuario.click(screen.getByRole('button', { name: /enviar código/i }))

    await usuario.type(await screen.findByLabelText(/código/i), '000000')
    await usuario.type(screen.getByLabelText(/nueva contraseña/i), 'Secreta1!')
    await usuario.type(screen.getByLabelText(/confirma/i), 'Secreta1!')
    await usuario.click(screen.getByRole('button', { name: /restablecer/i }))

    expect(await screen.findByText(/código de verificación no es válido/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Ejecutar la prueba y verificar que falla**

Run: `just test`
Expected: FAIL — no existe el módulo `./ForgotPasswordForm`.

- [ ] **Step 3: Agregar los esquemas**

Agregar a `src/features/auth/schemas.ts`:

```ts
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido'),
})

export const resetPasswordSchema = z
  .object({
    code: z.string().min(1, 'Ingresa el código que te enviamos'),
    newPassword: contrasenaNueva,
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((valores) => valores.newPassword === valores.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })

export type EmailInput = z.infer<typeof emailSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
```

- [ ] **Step 4: Implementar el formulario**

`src/features/auth/components/ForgotPasswordForm.tsx`:

```tsx
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { confirmPassword, forgotPassword } from '@/lib/cognito'
import {
  emailSchema,
  mensajeDeError,
  resetPasswordSchema,
  type EmailInput,
  type ResetPasswordInput,
} from '../schemas'

type Paso = 'correo' | 'codigo' | 'listo'

export function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [paso, setPaso] = useState<Paso>('correo')
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState<string | null>(null)

  const formularioCorreo = useForm<EmailInput>({ resolver: zodResolver(emailSchema) })
  const formularioCodigo = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  async function enviarCodigo(valores: EmailInput): Promise<void> {
    setError(null)
    const normalizado = valores.email.toLowerCase()

    try {
      await forgotPassword(normalizado)
      setCorreo(normalizado)
      setPaso('codigo')
    } catch (fallo) {
      setError(mensajeDeError(fallo))
    }
  }

  async function restablecer(valores: ResetPasswordInput): Promise<void> {
    setError(null)

    try {
      await confirmPassword(correo, valores.code, valores.newPassword)
      setPaso('listo')
    } catch (fallo) {
      setError(mensajeDeError(fallo))
    }
  }

  if (paso === 'listo') {
    return (
      <div className="flex flex-col gap-4">
        <p>Tu contraseña cambió. Ya puedes entrar con ella.</p>
        <Button onClick={onBack}>Volver al acceso</Button>
      </div>
    )
  }

  if (paso === 'codigo') {
    return (
      <form
        onSubmit={formularioCodigo.handleSubmit(restablecer)}
        className="flex flex-col gap-4"
        noValidate
      >
        <p>Enviamos un código a {correo}.</p>

        {error && <Alert variant="destructive">{error}</Alert>}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">Código de verificación</Label>
          <Input id="code" inputMode="numeric" {...formularioCodigo.register('code')} />
          {formularioCodigo.formState.errors.code && (
            <p className="text-sm text-destructive">
              {formularioCodigo.formState.errors.code.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="resetNewPassword">Nueva contraseña</Label>
          <Input
            id="resetNewPassword"
            type="password"
            autoComplete="new-password"
            {...formularioCodigo.register('newPassword')}
          />
          {formularioCodigo.formState.errors.newPassword && (
            <p className="text-sm text-destructive">
              {formularioCodigo.formState.errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="resetConfirmPassword">Confirma la contraseña</Label>
          <Input
            id="resetConfirmPassword"
            type="password"
            autoComplete="new-password"
            {...formularioCodigo.register('confirmPassword')}
          />
          {formularioCodigo.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {formularioCodigo.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={formularioCodigo.formState.isSubmitting}>
          Restablecer contraseña
        </Button>
        <Button type="button" variant="link" onClick={onBack}>
          Volver al acceso
        </Button>
      </form>
    )
  }

  return (
    <form
      onSubmit={formularioCorreo.handleSubmit(enviarCodigo)}
      className="flex flex-col gap-4"
      noValidate
    >
      <p>Te enviaremos un código para restablecer tu contraseña.</p>

      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="forgotEmail">Correo electrónico</Label>
        <Input
          id="forgotEmail"
          type="email"
          autoComplete="username"
          {...formularioCorreo.register('email')}
        />
        {formularioCorreo.formState.errors.email && (
          <p className="text-sm text-destructive">
            {formularioCorreo.formState.errors.email.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={formularioCorreo.formState.isSubmitting}>
        Enviar código
      </Button>
      <Button type="button" variant="link" onClick={onBack}>
        Volver al acceso
      </Button>
    </form>
  )
}
```

- [ ] **Step 5: Conectar el flujo en la página**

En `LoginPage.tsx`, agregar `const [recuperando, setRecuperando] = useState(false)` y ampliar la rama de render:

```tsx
{recuperando ? (
  <ForgotPasswordForm onBack={() => setRecuperando(false)} />
) : reto ? (
  <NewPasswordForm onSubmit={definirContrasena} error={error} />
) : (
  <CredentialsForm
    onSubmit={autenticar}
    error={error}
    onForgotPassword={() => setRecuperando(true)}
  />
)}
```

- [ ] **Step 6: Ejecutar las pruebas y verificar que pasan**

Run: `just test`
Expected: PASS, 4 pruebas nuevas y ninguna regresión.

- [ ] **Step 7: Verificar la puerta de calidad**

Run: `just check`
Expected: sin errores.

- [ ] **Step 8: Commit**

```bash
git add src/features/auth
git commit -m "feat: add password recovery flow"
```

---

### Task 9: Recetas de despliegue

**Files:**
- Modify: `justfile`, `.env.example`
- Create: `.env.qa`, `.env.production`, `README.md`

**Interfaces:**
- Consumes: `just build <entorno>` de la tarea 1.
- Produces: `just deploy qa` y `just deploy production`.

**Requisito previo:** esta tarea necesita los valores reales de `VITE_API_URL`, `VITE_COGNITO_USER_POOL_ID` y `VITE_COGNITO_CLIENT_ID` para QA y producción. No están en el repositorio `mentoria`. Pedirlos antes de empezar.

Valores de infraestructura confirmados leyendo `frontend/deploy-frontend-nadro-qa.sh` y `frontend/deploy-frontend-nadro-prod.sh` del repositorio actual:

| Entorno | Perfil AWS | Bucket | Región |
|---|---|---|---|
| qa | `qa-nadro` | `nadro-mentoria-frontend-qa` | `us-east-1` |
| production | `prod-nadro` | `nadro-mentoria-frontend-prod` | `us-east-1` |

Ninguno de los dos pasa por CloudFront hoy: los scripts sincronizan contra el hosting estático de S3, ya configurado con `--error-document index.html`. La distribución `E26HPGOKVFK2W3` sirve un tercer bucket, `nadro-mentoria-frontend-1760378806`. Confirmar con el responsable si el frontend nuevo debe publicarse ahí también antes de agregar la invalidación.

- [ ] **Step 1: Crear los archivos de entorno**

`.env.qa`:

```bash
VITE_API_URL=<pedir>
VITE_COGNITO_USER_POOL_ID=<pedir>
VITE_COGNITO_CLIENT_ID=<pedir>
VITE_AWS_REGION=us-east-1

AWS_PROFILE=qa-nadro
AWS_REGION=us-east-1
S3_BUCKET=nadro-mentoria-frontend-qa
```

`.env.production`: igual, con `AWS_PROFILE=prod-nadro` y `S3_BUCKET=nadro-mentoria-frontend-prod`.

Reflejar las cuatro claves de despliegue en `.env.example`, comentadas.

- [ ] **Step 2: Agregar las recetas al `justfile`**

```just
deploy entorno:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ ! -f ".env.{{entorno}}" ]; then
      echo "Falta .env.{{entorno}}" >&2
      exit 1
    fi
    set -a; source ".env.{{entorno}}"; set +a
    if [ "{{entorno}}" = "production" ]; then
      read -r -p "Vas a publicar en producción ($S3_BUCKET). Escribe 'si' para continuar: " respuesta
      [ "$respuesta" = "si" ] || { echo "Cancelado"; exit 1; }
    fi
    just build {{entorno}}
    aws s3 sync dist/ "s3://$S3_BUCKET" --delete --profile "$AWS_PROFILE" \
      --exclude index.html --cache-control "public,max-age=31536000,immutable"
    aws s3 cp dist/index.html "s3://$S3_BUCKET/index.html" --profile "$AWS_PROFILE" \
      --cache-control "no-cache"
    echo "Publicado en http://$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com"
```

`index.html` se excluye del `sync` y se sube aparte porque necesita `no-cache`: es el único archivo sin hash en el nombre.

- [ ] **Step 3: Verificar la receta sin publicar**

Run: `just build qa`
Expected: genera `dist/` con `index.html` y los recursos con hash.

Run: `aws s3 ls s3://nadro-mentoria-frontend-qa --profile qa-nadro`
Expected: lista el contenido actual del bucket, lo que confirma que el perfil funciona.

Si el perfil no autentica, detenerse y pedir credenciales antes de seguir.

- [ ] **Step 4: Escribir el README**

`README.md` con: qué es el proyecto, requisitos (Node 24, pnpm, just, AWS CLI), cómo arrancar (`just dev`), cómo probar (`just check`), la tabla de entornos y la advertencia de que los `.env` con valores reales no se comparten fuera del equipo.

- [ ] **Step 5: Commit**

```bash
git add justfile .env.example .env.qa .env.production README.md
git commit -m "chore: add deploy recipes and environment documentation"
```

---

## Autorrevisión

**Cobertura del spec.** Del tramo 3 quedan cubiertos: repositorio propio (tarea 1), stack completo (tareas 1 y 5), `lib/env.ts` con Zod (1), `lib/api.ts` con `fieldErrors` (2), port de Cognito con derivación de rol (3), `AuthProvider` y guards con manejo de 401 (4), `BrowserRouter` y rutas anidadas (5), esquemas Zod espejando al backend (6, 7, 8), pruebas con Vitest, Testing Library y MSW (todas), `justfile` y `.env` por entorno (1 y 9).

Fuera de este plan por pertenecer a otros tramos: el documento de contrato (tramo 1), la identidad visual y los tokens (tramo 2), el dashboard y los cuatro formularios con TanStack Table y Recharts (tramo 4), el ajuste de CloudFront (tramo 5). La tarea 5 deja `DashboardPage` como marcador de posición explícito.

**Consistencia de tipos.** `AppUser`, `Rol`, `NewPasswordChallenge` y `LoginResult` se definen en la tarea 3 y se consumen con esos nombres en las tareas 4, 6 y 7. `CredentialsInput`, `NewPasswordInput`, `EmailInput` y `ResetPasswordInput` se definen en `schemas.ts` a lo largo de las tareas 6, 7 y 8 sin colisión. `setAuthTokenReader` y `setUnauthorizedHandler` se definen en la tarea 2 y se registran en la tarea 4. `rutas` se exporta en la tarea 5 y se importa en las pruebas de las tareas 5 y 6.

**Dependencia externa.** Las tareas 1 a 8 se completan y sus pruebas pasan con los valores ficticios de `.env.test`. Solo la tarea 9 y la ejecución real contra Cognito necesitan los valores verdaderos.
