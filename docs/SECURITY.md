# Seguridad en MusikOn API

## 1. Autenticación y Autorización (JWT)
- Todos los endpoints protegidos requieren un token JWT en el header `Authorization: Bearer <token>`.
- El token incluye información básica del usuario y su rol.
- Ejemplo de uso en frontend:
```js
fetch('/events/my-pending', { headers: { Authorization: 'Bearer <token>' } })
```
- Los middlewares validan el token y el rol antes de permitir el acceso.

## 2. Roles y Permisos
- Los roles principales ahora son:
  - `musico`
  - `eventCreator` (organizador)
  - `usuario` (usuario general)
  - `adminJunior`
  - `adminMidLevel`
  - `adminSenior`
  - `superAdmin`
- Los endpoints pueden requerir uno o varios roles específicos para acceder.
- Ejemplo de middleware:
```ts
import { requireRole } from './src/middleware/authMiddleware';

// Solo organizadores pueden crear eventos
router.post('/request-musician', authMiddleware, requireRole('eventCreator'), requestMusicianController);

// Solo músicos pueden aceptar eventos
router.post('/:eventId/accept', authMiddleware, requireRole('musico'), acceptEventController);

// Permitir acceso a varios roles
router.get('/admin-data', authMiddleware, requireRole('adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin'), adminDataController);
```
- Si el usuario no tiene el rol requerido, recibe un 403 Forbidden con el mensaje: `{ msg: 'No autorizado. Rol insuficiente.' }`

## 3. HTTPS y CORS
- En producción, la API debe estar detrás de HTTPS (usa un proxy o configura SSL en el servidor).
- CORS debe estar restringido a los dominios de la app en producción:
```js
app.use(cors({ origin: ['https://tudominio.com'] }));
```

## 4. Cabeceras de Seguridad (helmet)
- Usa helmet para agregar cabeceras HTTP seguras:
```js
import helmet from 'helmet';
app.use(helmet());
```

## 5. Reglas de Firestore
- Solo los usuarios autenticados pueden leer/escribir sus propios datos.
- Ejemplo de regla:
```json
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.token.email == userId;
    }
  }
}
```

## 6. Campo status en usuarios
- El campo `status` indica si el usuario está activo (`true`) o inactivo (`false`).
- Al crear o actualizar un usuario, puedes enviar el campo `status` (booleano). Si no se envía, será `true` por defecto.
- Ejemplo de registro:
```json
{
  "name": "Juan",
  "lastName": "Pérez",
  "roll": "musico",
  "userEmail": "juan@example.com",
  "userPassword": "Password*123",
  "status": false
}
```
- Ejemplo de actualización:
```json
{
  "name": "Juan",
  "status": false
}
```

## 7. Estructura y tipado de endpoints de administración
- Todos los endpoints de administración usan funciones sueltas exportadas desde `adminController.ts` (no métodos de objeto).
- Los handlers tienen la firma:
  ```ts
  export function adminUsersGetAll(req: Request, res: Response, next: NextFunction): void {
    // ...
    res.status(200).json(...); // nunca return res.status(...).json(...)
    return; // si necesitas cortar la ejecución
  }
  ```
- Las promesas se manejan con `.then(...).catch(next)` para asegurar que el handler siempre retorna void.
- El middleware `adminOnly` protege todos los endpoints admin:
  ```ts
  router.get('/admin/users', adminOnly, adminUsersGetAll);
  ```
- Así, el tipado es robusto, seguro y compatible con Express y TypeScript.

### Ejemplo de endpoints admin en Swagger/OpenAPI

```yaml
paths:
  /admin/users:
    get:
      summary: Obtener todos los usuarios (solo admin)
      tags: [Admin]
      security:
        - bearerAuth: []
      responses:
        200:
          description: Lista de usuarios
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    _id:
                      type: string
                    name:
                      type: string
                    lastName:
                      type: string
                    userEmail:
                      type: string
                    roll:
                      type: string
                    status:
                      type: boolean
        403:
          description: Acceso solo para administradores
  /admin/users/{id}:
    get:
      summary: Obtener usuario por ID (solo admin)
      tags: [Admin]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          schema:
            type: string
          required: true
          description: ID del usuario
      responses:
        200:
          description: Usuario encontrado
        404:
          description: Usuario no encontrado
        403:
          description: Acceso solo para administradores
```

- Todos los endpoints admin siguen este patrón y están protegidos por el middleware `adminOnly`.

### Documentación Swagger/OpenAPI de rutas admin

```yaml
paths:
  # --- Usuarios ---
  /admin/users:
    get:
      summary: Obtener todos los usuarios
      tags: [Admin]
      security:
        - bearerAuth: []
      responses:
        200:
          description: Lista de usuarios
        403:
          description: Acceso solo para administradores
    post:
      summary: Crear usuario
      tags: [Admin]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name: { type: string }
                lastName: { type: string }
                userEmail: { type: string }
                roll: { type: string }
                status: { type: boolean }
      responses:
        201:
          description: Usuario creado
        403:
          description: Acceso solo para administradores
  /admin/users/{id}:
    get:
      summary: Obtener usuario por ID
      tags: [Admin]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          schema: { type: string }
          required: true
          description: ID del usuario
      responses:
        200:
          description: Usuario encontrado
        404:
          description: Usuario no encontrado
        403:
          description: Acceso solo para administradores
    put:
      summary: Actualizar usuario
      tags: [Admin]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          schema: { type: string }
          required: true
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
      responses:
        200:
          description: Usuario actualizado
        403:
          description: Acceso solo para administradores
    delete:
      summary: Eliminar usuario
      tags: [Admin]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          schema: { type: string }
          required: true
      responses:
        200:
          description: Usuario eliminado
        403:
          description: Acceso solo para administradores

  # --- Eventos ---
  /admin/events:
    get:
      summary: Obtener todos los eventos
      tags: [AdminEvents]
      security:
        - bearerAuth: []
      responses:
        200:
          description: Lista de eventos
        403:
          description: Acceso solo para administradores
    post:
      summary: Crear evento
      tags: [AdminEvents]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
      responses:
        201:
          description: Evento creado
        403:
          description: Acceso solo para administradores
  /admin/events/{id}:
    get:
      summary: Obtener evento por ID
      tags: [AdminEvents]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          schema: { type: string }
          required: true
      responses:
        200:
          description: Evento encontrado
        404:
          description: Evento no encontrado
        403:
          description: Acceso solo para administradores
    put:
      summary: Actualizar evento
      tags: [AdminEvents]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          schema: { type: string }
          required: true
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
      responses:
        200:
          description: Evento actualizado
        403:
          description: Acceso solo para administradores
    delete:
      summary: Eliminar evento
      tags: [AdminEvents]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          schema: { type: string }
          required: true
      responses:
        200:
          description: Evento eliminado
        403:
          description: Acceso solo para administradores

  # --- Músicos ---
  /admin/musicians:
    get:
      summary: Obtener todos los músicos
      tags: [AdminMusicians]
      security:
        - bearerAuth: []
      responses:
        200:
          description: Lista de músicos
        403:
          description: Acceso solo para administradores
  /admin/musicians/{id}:
    get:
      summary: Obtener músico por ID
      tags: [AdminMusicians]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          schema: { type: string }
          required: true
      responses:
        200:
          description: Músico encontrado
        404:
          description: Músico no encontrado
        403:
          description: Acceso solo para administradores
    put:
      summary: Actualizar músico
      tags: [AdminMusicians]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          schema: { type: string }
          required: true
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
      responses:
        200:
          description: Músico actualizado
        403:
          description: Acceso solo para administradores
    delete:
      summary: Eliminar músico
      tags: [AdminMusicians]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          schema: { type: string }
          required: true
      responses:
        200:
          description: Músico eliminado
        403:
          description: Acceso solo para administradores

  # --- Imágenes ---
  /admin/images:
    get:
      summary: Obtener todas las imágenes
      tags: [AdminImages]
      security:
        - bearerAuth: []
      responses:
        200:
          description: Lista de imágenes
        403:
          description: Acceso solo para administradores
  /admin/images/{id}:
    get:
      summary: Obtener imagen por ID
      tags: [AdminImages]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          schema: { type: string }
          required: true
      responses:
        200:
          description: Imagen encontrada
        404:
          description: Imagen no encontrada
        403:
          description: Acceso solo para administradores
    delete:
      summary: Eliminar imagen
      tags: [AdminImages]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          schema: { type: string }
          required: true
      responses:
        200:
          description: Imagen eliminada
        403:
          description: Acceso solo para administradores

  # --- Solicitudes de Músico ---
  /admin/musician-requests:
    get:
      summary: Obtener todas las solicitudes de músico
      tags: [AdminMusicianRequests]
      security:
        - bearerAuth: []
      responses:
        200:
          description: Lista de solicitudes
        403:
          description: Acceso solo para administradores
  /admin/musician-requests/{id}:
    get:
      summary: Obtener solicitud de músico por ID
      tags: [AdminMusicianRequests]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          schema: { type: string }
          required: true
      responses:
        200:
          description: Solicitud encontrada
        404:
          description: Solicitud no encontrada
        403:
          description: Acceso solo para administradores
    delete:
      summary: Eliminar solicitud de músico
      tags: [AdminMusicianRequests]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          schema: { type: string }
          required: true
      responses:
        200:
          description: Solicitud eliminada
        403:
          description: Acceso solo para administradores
```

- Cada bloque está separado por su respectivo tag: Admin, AdminEvents, AdminMusicians, AdminImages, AdminMusicianRequests.
- Todos los endpoints están protegidos por el middleware `adminOnly` y requieren autenticación JWT.

---

Consulta los archivos específicos en esta carpeta para detalles de cada mecanismo de seguridad implementado. 