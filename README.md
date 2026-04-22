# WebAdopcion

Pagina web de adopcion de animales que conecta protectoras y refugios.

El proyecto tiene dos partes:

- Backend: Spring Boot en `backend/HuellasConectadas`.
- Frontend: Angular en `frontend/WebAdopcion`.

La raiz contiene scripts para arrancar ambos con un solo comando.

## Requisitos

- Java 23.
- Maven.
- Node.js.
- npm.
- Una cuenta/proyecto de Firebase.
- Una cuenta de Cloudinary para la subida de imagenes.

## Instalacion

Desde la raiz del proyecto:

```bash
npm.cmd run setup
```

Ese comando instala las dependencias del frontend oficial, ubicado en:

```text
frontend/WebAdopcion
```

## Arranque en desarrollo

Desde la raiz:

```bash
npm.cmd run dev
```

Ese comando:

1. Inicia el backend Spring Boot.
2. Espera a que responda en `http://localhost:8080`.
3. Inicia el frontend Angular en `http://localhost:4200`.

Comandos individuales:

```bash
npm.cmd run start:backend
npm.cmd run start:frontend
```

## Configuracion de Firebase

Este proyecto usa Firebase de dos formas distintas:

- Frontend Angular: usa Firebase Web SDK para Authentication y Firestore.
- Backend Spring Boot: usa Firebase Admin SDK para acceder a Firestore desde el servidor.

Por seguridad, el repositorio no incluye claves reales. Debes crear/configurar tu propio proyecto Firebase o usar uno existente.

### 1. Crear proyecto en Firebase

1. Entra en Firebase Console.
2. Crea un proyecto nuevo.
3. Asigna un nombre, por ejemplo `huellas-conectadas`.
4. Google Analytics es opcional para este proyecto.

### 2. Crear una app web

Dentro del proyecto Firebase:

1. Ve a la configuracion del proyecto.
2. En "Tus apps", crea una app web.
3. Firebase te mostrara una configuracion parecida a esta:

```ts
firebase: {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
}
```

Copia esos valores en:

```text
frontend/WebAdopcion/environments/environment.ts
```

El archivo tiene esta forma:

```ts
export const environment = {
  production: false,
  firebase: {
    apiKey: "REPLACE_WITH_FIREBASE_API_KEY",
    authDomain: "REPLACE_WITH_FIREBASE_AUTH_DOMAIN",
    projectId: "REPLACE_WITH_FIREBASE_PROJECT_ID",
    storageBucket: "REPLACE_WITH_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "REPLACE_WITH_FIREBASE_MESSAGING_SENDER_ID",
    appId: "REPLACE_WITH_FIREBASE_APP_ID",
    measurementId: "REPLACE_WITH_FIREBASE_MEASUREMENT_ID"
  }
};
```

Tambien existe una copia del frontend en la raiz del proyecto. La version principal que se arranca con `npm.cmd run dev` es `frontend/WebAdopcion`, pero si usas la copia de la raiz tendrias que actualizar tambien:

```text
environments/environment.ts
```

Nota: la `apiKey` web de Firebase identifica la app cliente, pero no debe confundirse con la clave privada del Admin SDK. Aun asi, en este repositorio se dejan placeholders para evitar publicar configuraciones reales.

### 3. Activar Authentication

El frontend usa Firebase Authentication para:

- Registrar protectoras con email y contrasena.
- Enviar correo de verificacion.
- Iniciar sesion.
- Recuperar contrasena.

En Firebase Console:

1. Ve a `Authentication`.
2. Entra en `Sign-in method`.
3. Activa `Email/Password`.
4. Revisa la plantilla de correo de verificacion si quieres personalizar el texto.
5. En `Settings`, revisa los dominios autorizados.

Para desarrollo local debe estar permitido:

```text
localhost
```

Si despliegas la web, anade tambien el dominio real.

### 4. Crear Firestore Database

El proyecto usa Cloud Firestore.

En Firebase Console:

1. Ve a `Firestore Database`.
2. Crea la base de datos.
3. Elige una region.
4. Para desarrollo puedes empezar en modo de prueba, pero para produccion debes crear reglas restrictivas.

Colecciones usadas por el proyecto:

```text
protectoras
protectoras/{idProtectora}/animales
animales
counters
```

El backend crea y consulta documentos en `protectoras`, subcolecciones `animales`, la coleccion global `animales` y el documento contador:

```text
counters/protectoras
```

Para que el alta secuencial de protectoras funcione desde el primer registro, crea este documento en Firestore:

```text
Coleccion: counters
Documento: protectoras
Campo: last
Valor: 0
Tipo: number
```

Si no existe, el backend intenta leer `last` y luego actualizarlo. Tenerlo creado evita errores en la primera transaccion.

### 5. Crear credencial Firebase Admin para el backend

El backend no usa la configuracion web de Firebase. Usa una clave privada de Firebase Admin SDK.

En Firebase Console:

1. Ve a `Configuracion del proyecto`.
2. Abre la pestana `Cuentas de servicio`.
3. Pulsa `Generar nueva clave privada`.
4. Descarga el JSON.

Ese JSON es sensible. No debe subirse a GitHub.

Opciones de configuracion local:

Opcion A, archivo local ignorado por Git:

```text
backend/HuellasConectadas/src/main/resources/serviceAccountKey.json
```

Este archivo esta incluido en `.gitignore`, por lo que no se sube al repositorio.

Opcion B, variable con ruta absoluta:

```bash
set FIREBASE_SERVICE_ACCOUNT_PATH=C:\ruta\segura\serviceAccountKey.json
set FIREBASE_PROJECT_ID=tu-project-id
```

Opcion C, variable en Base64 para despliegues:

```bash
set FIREBASE_SERVICE_ACCOUNT_BASE64=CONTENIDO_JSON_EN_BASE64
set FIREBASE_PROJECT_ID=tu-project-id
```

En PowerShell:

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_PATH="C:\ruta\segura\serviceAccountKey.json"
$env:FIREBASE_PROJECT_ID="tu-project-id"
```

El backend intenta cargar las credenciales en este orden:

1. `FIREBASE_SERVICE_ACCOUNT_BASE64`
2. `FIREBASE_SERVICE_ACCOUNT_PATH`
3. `backend/HuellasConectadas/src/main/resources/serviceAccountKey.json`

### 6. Reglas de Firestore

Durante desarrollo puedes usar reglas abiertas temporalmente, pero no es recomendable para produccion.

Como el frontend lee y escribe algunos datos directamente en Firestore, y el backend usa Admin SDK, una configuracion inicial de desarrollo puede ser permisiva solo mientras pruebas.

Ejemplo solo para desarrollo:

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Para produccion, ajusta reglas por coleccion y rol. Por ejemplo, una protectora deberia poder modificar solo sus propios animales, y los visitantes solo deberian leer animales disponibles.

## Configuracion de Cloudinary

El backend usa Cloudinary para subir imagenes.

Configura estas variables de entorno:

```bash
set CLOUDINARY_CLOUD_NAME=tu_cloud_name
set CLOUDINARY_API_KEY=tu_api_key
set CLOUDINARY_API_SECRET=tu_api_secret
```

En PowerShell:

```powershell
$env:CLOUDINARY_CLOUD_NAME="tu_cloud_name"
$env:CLOUDINARY_API_KEY="tu_api_key"
$env:CLOUDINARY_API_SECRET="tu_api_secret"
```

Tambien puedes usar `.env.example` como referencia, pero no subas un `.env` real.

## Archivos de ejemplo y secretos

Archivos seguros que si se suben:

- `.env.example`
- `backend/HuellasConectadas/src/main/resources/application.example.properties`
- `frontend/WebAdopcion/environments/environment.example.ts`
- `environments/environment.example.ts`

Archivos locales que no deben subirse:

- `.env`
- `serviceAccountKey.json`
- Archivos con `secret` o `credentials` en `src/main/resources`
- `node_modules`
- `target`
- `dist`

## Comprobaciones antes de subir

Backend:

```bash
mvn -q -DskipTests compile -f backend/HuellasConectadas/pom.xml
```

Frontend:

```bash
npm.cmd run build
```

Buscar posibles secretos antes de subir:

```bash
git status --short --ignored
```

Comprueba que `serviceAccountKey.json`, `.env`, `target`, `dist` y `node_modules` aparecen como ignorados o no aparecen en el commit.

## Subida a GitHub

Revisa el remoto actual:

```bash
git remote -v
```

Para cambiarlo por otro repositorio:

```bash
git remote remove origin
git remote add origin https://github.com/USUARIO/NOMBRE_REPOSITORIO.git
```

Pasos habituales:

```bash
git status
git add .
git commit -m "Actualizar documentacion"
git push origin main
```

Si tu rama principal se llama `master`, cambia `main` por `master`.

## Notas

- La carpeta principal del frontend es `frontend/WebAdopcion`.
- Existe una copia del frontend en la raiz que conviene revisar y eliminar en una futura limpieza si se confirma que no contiene cambios distintos.
