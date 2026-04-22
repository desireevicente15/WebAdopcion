# WebAdopcion

Pagina web de adopcion de animales que conecta protectoras y refugios.

## Arranque en desarrollo

Instala las dependencias del frontend:

```bash
npm.cmd run setup
```

Desde la raiz del proyecto:

```bash
npm.cmd run dev
```

Ese comando inicia primero el backend Spring Boot y despues el frontend Angular.

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:4200`

## Configuracion local

El repositorio no debe contener claves reales.

Backend:

- Copia `.env.example` como referencia y configura las variables en tu entorno local.
- Cloudinary usa `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`.
- Firebase Admin usa `FIREBASE_SERVICE_ACCOUNT_PATH` o `FIREBASE_SERVICE_ACCOUNT_BASE64`.
- Para desarrollo local tambien puedes dejar `serviceAccountKey.json` en `backend/HuellasConectadas/src/main/resources/`; ese archivo esta ignorado por Git.

Frontend:

- Rellena `frontend/WebAdopcion/environments/environment.ts` con la configuracion Firebase de tu proyecto antes de ejecutar la app.
- No subas valores reales si el repositorio va a ser publico.

## Comprobaciones antes de subir

```bash
mvn -q -DskipTests compile -f backend/HuellasConectadas/pom.xml
npm.cmd run build
```

El proyecto incluye `.gitignore` para que no se suban `node_modules`, `target`, caches ni credenciales locales.

## Subida a GitHub

Si vas a subirlo a otra cuenta, revisa primero el remoto actual:

```bash
git remote -v
```

Para cambiarlo por el repositorio de otra cuenta:

```bash
git remote remove origin
git remote add origin https://github.com/USUARIO/NOMBRE_REPOSITORIO.git
```

Despues, pasos habituales:

```bash
git status
git add .
git commit -m "Preparar proyecto para GitHub"
git push origin main
```

Si tu rama principal se llama `master`, cambia `main` por `master`.

Hay mas notas en `documentacion/MEJORAS_PROPUESTAS.md`.
