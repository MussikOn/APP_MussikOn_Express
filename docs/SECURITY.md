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

---

Consulta los archivos específicos en esta carpeta para detalles de cada mecanismo de seguridad implementado. 