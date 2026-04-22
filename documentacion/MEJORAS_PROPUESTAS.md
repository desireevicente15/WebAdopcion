# Analisis del proyecto y mejoras propuestas

## Como iniciar el proyecto

### Backend

El backend esta en:

```text
backend/HuellasConectadas
```

Es una aplicacion Spring Boot con Maven. Desde la raiz del proyecto se puede iniciar con:

```bash
mvn -f backend/HuellasConectadas/pom.xml spring-boot:run
```

Tambien se puede entrar en la carpeta del backend y arrancarlo desde alli:

```bash
cd backend/HuellasConectadas
mvn spring-boot:run
```

Por defecto Spring Boot levantara el backend en:

```text
http://localhost:8080
```

### Frontend

El frontend Angular usable esta en:

```text
frontend/WebAdopcion
```

Desde la raiz del proyecto se puede iniciar con:

```bash
npm.cmd --prefix frontend/WebAdopcion start
```

O entrando en la carpeta del frontend:

```bash
cd frontend/WebAdopcion
npm.cmd start
```

El frontend se abre normalmente en:

```text
http://localhost:4200
```

En PowerShell, si aparece un error de politicas de ejecucion con `npm.ps1`, usa `npm.cmd` en lugar de `npm`.

### Backend y frontend con un unico comando

He anadido un script de desarrollo en:

```text
scripts/start-dev.js
```

Desde la raiz del proyecto, el comando recomendado es:

```bash
npm.cmd run dev
```

Ese comando hace lo siguiente:

1. Comprueba las carpetas de backend y frontend.
2. Arranca el backend Spring Boot.
3. Espera a que `localhost:8080` responda.
4. Arranca el frontend Angular en `localhost:4200`.
5. Si paras el frontend con `Ctrl+C`, intenta detener tambien el backend que haya iniciado el script.

Tambien puedes ejecutar directamente:

```bash
node scripts/start-dev.js
```

## Estado observado

- Hay un frontend Angular duplicado: existe en la raiz del proyecto y tambien en `frontend/WebAdopcion`.
- Los archivos clave revisados (`package.json`, `angular.json`, `app.module.ts`) coinciden entre la raiz y `frontend/WebAdopcion`.
- La carpeta `frontend/WebAdopcion` tiene `node_modules`, pero la raiz no. Por eso el arranque conjunto usa `frontend/WebAdopcion` como frontend principal.
- El backend usa Spring Boot 3.4.2, Maven y Java 23.
- El frontend llama al backend con URLs hardcodeadas a `http://localhost:8080/api/...`.
- El bloqueo de Maven por codificacion en `application.properties` ya esta corregido. El backend compila con `mvn -q -DskipTests compile`.
- El arranque conjunto con `npm.cmd run dev` ya levanta backend en `8080` y frontend en `4200`.
- Las claves reales de Cloudinary y Firebase ya no estan en archivos versionables. `serviceAccountKey.json` queda como archivo local ignorado.
- Al verificar Angular con `npm.cmd --prefix frontend/WebAdopcion run build`, el build falla por presupuesto de tamano: el bundle inicial queda en `1.32 MB` y el limite configurado es `1.00 MB`.

## Mejoras propuestas para aplicar solo cuando lo pidas

### 1. Elegir una unica ubicacion para el frontend

Ahora mismo el frontend esta duplicado en dos sitios:

```text
src/
public/
environments/
angular.json
package.json
```

y tambien en:

```text
frontend/WebAdopcion/src/
frontend/WebAdopcion/public/
frontend/WebAdopcion/environments/
frontend/WebAdopcion/angular.json
frontend/WebAdopcion/package.json
```

Propuesta:

- Mantener `frontend/WebAdopcion` como ubicacion oficial.
- Eliminar la copia Angular de la raiz cuando se confirme que no contiene cambios distintos.
- Dejar en la raiz solo archivos de orquestacion, documentacion y scripts comunes.

Estructura recomendada:

```text
WebAdopcion/
  backend/
    HuellasConectadas/
  frontend/
    WebAdopcion/
  documentacion/
  scripts/
  README.md
  package.json
```

### 2. Sacar secretos del repositorio

Estado: aplicado.

Cambios realizados:

- `application.properties` usa variables de entorno para Cloudinary y Firebase Admin.
- Se creo `application.example.properties` sin valores reales.
- `serviceAccountKey.json` esta ignorado por Git y fuera del indice.
- Se anadio `.env.example`.
- Los `environment.ts` de Angular ya no contienen valores reales.

`application.properties` ya se guardo como UTF-8/ASCII para que Maven pueda procesarlo.

Pendiente manual recomendado:

- Rotar las claves si ya se compartieron o subieron alguna vez.
- Configurar variables de entorno reales en local, despliegue o GitHub Actions.

### 3. Corregir nombres de propiedades de Cloudinary

Estado: aplicado.

En `application.properties` se usan claves con guion bajo:

```properties
cloudinary.cloud_name
cloudinary.api_key
cloudinary.api_secret
```

Pero `CloudinaryConfig.java` espera claves con guion:

```java
cloudinary.cloud-name
cloudinary.api-key
cloudinary.api-secret
```

Los nombres ya estan unificados como `cloudinary.cloud-name`, `cloudinary.api-key` y `cloudinary.api-secret`.

### 4. Revisar `javax.annotation.PostConstruct`

Estado: aplicado.

El backend usa Spring Boot 3, que trabaja con Jakarta. En `FirebaseInitializer.java` aparece:

```java
import javax.annotation.PostConstruct;
```

Se cambio a `jakarta.annotation.PostConstruct` y se verifico compilacion con Maven.

### 5. Centralizar CORS

Ahora mismo CORS aparece en varios lugares:

- `SecurityConfig.java`
- `WebConfig.java`
- anotaciones `@CrossOrigin` en controladores

Propuesta:

- Dejar una sola configuracion CORS, preferiblemente en `SecurityConfig`.
- Evitar duplicidad para que el comportamiento sea predecible.

### 6. Mover URLs de API a `environment.ts`

Los servicios Angular tienen URLs como:

```ts
http://localhost:8080/api/animales
```

Propuesta:

- Definir `apiUrl` en `environment.ts`.
- Usar esa variable desde los servicios.
- Facilitar cambios entre desarrollo y despliegue.

### 7. Revisar autenticacion

`AuthService` contiene datos simulados y un token falso.

Propuesta:

- Decidir si Firebase Auth sera la fuente real de autenticacion.
- Eliminar credenciales/datos demo cuando ya no sean necesarios.
- Alinear guards, roles y sesion con el backend o Firebase.

### 8. Limpiar dependencias del frontend

En `package.json` aparece `boostrap`, que parece un typo, ademas de `bootstrap`.

Propuesta:

- Revisar si `boostrap` se usa.
- Eliminar la dependencia incorrecta si no hace falta.

### 9. Anadir Maven Wrapper

El backend depende de Maven instalado globalmente.

Propuesta:

- Anadir `mvnw` y `mvnw.cmd`.
- Asi cualquier persona puede arrancar el backend sin instalar Maven manualmente.

### 10. Mejorar README principal

Estado: parcialmente aplicado.

El `README.md` de la raiz es muy corto y tiene texto con problemas de codificacion.

Propuesta:

- Documentar requisitos: Node, npm, Java, Maven.
- Documentar comandos de arranque. Aplicado.
- Documentar puertos. Aplicado.
- Anadir pasos para configurar credenciales locales. Aplicado.
- Explicar la estructura de carpetas. Pendiente.

### 11. Anadir pruebas basicas

Propuesta:

- Backend: pruebas de contexto Spring y controladores principales.
- Frontend: pruebas de servicios y componentes criticos.
- Validar el build de Angular y el package de Maven antes de entregar.

### 12. Ajustar presupuestos y tamano del bundle Angular

El build de produccion supera el presupuesto actual del bundle inicial.

Propuesta:

- Revisar `budgets` en `angular.json`.
- Reducir dependencias o imports pesados si es viable.
- Revisar el uso de `sweetalert2`, Bootstrap y estilos globales.
- Subir el presupuesto solo si el tamano final es aceptable para el proyecto.

### 13. Separar responsabilidades en backend

Algunos controladores parecen concentrar acceso a Firebase y logica de negocio.

Propuesta:

- Mantener controladores finos.
- Mover logica a servicios.
- Crear clases especificas para acceso a Firebase si el proyecto crece.

## Nota sobre reorganizacion

No he reorganizado carpetas todavia porque hay muchos archivos sin seguimiento y cambios existentes en Git. La reorganizacion mas clara seria dejar solo un frontend oficial dentro de `frontend/WebAdopcion`, pero conviene aplicarla en un paso separado y bajo tu confirmacion para evitar perder cambios.
