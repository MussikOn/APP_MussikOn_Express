# Sistema de Administración Centralizada - MusikOn

## Objetivo
Permitir a administradores y superadministradores gestionar todas las colecciones y recursos de la plataforma MusikOn desde un panel centralizado, con endpoints RESTful protegidos y bien documentados.

---

## Arquitectura General
- **Backend:** Node.js + Express + Firebase/Firestore
- **Autenticación:** JWT (Bearer Token)
- **Roles:** admin, superadmin (acceso total), otros roles con acceso restringido
- **Rutas de administración:** Prefijo `/admin/` para todos los endpoints de gestión global
- **Protección:** Middleware `adminOnly` verifica el rol antes de permitir el acceso

---

## Endpoints RESTful de Administración

### Usuarios
- `GET    /admin/users`           → Listar todos los usuarios
- `GET    /admin/users/:id`       → Obtener usuario por ID
- `POST   /admin/users`           → Crear usuario
- `PUT    /admin/users/:id`       → Editar usuario
- `DELETE /admin/users/:id`       → Eliminar usuario

### Eventos
- `GET    /admin/events`          → Listar todos los eventos
- `GET    /admin/events/:id`      → Obtener evento por ID
- `POST   /admin/events`          → Crear evento
- `PUT    /admin/events/:id`      → Editar evento
- `DELETE /admin/events/:id`      → Eliminar evento

### Solicitudes de Músico
- `GET    /admin/musician-requests`      → Listar todas las solicitudes
- `GET    /admin/musician-requests/:id`  → Obtener solicitud por ID
- `DELETE /admin/musician-requests/:id`  → Eliminar solicitud

### Imágenes
- `GET    /admin/images`          → Listar todas las imágenes
- `GET    /admin/images/:id`      → Obtener imagen por ID
- `DELETE /admin/images/:id`      → Eliminar imagen

### Músicos
- `GET    /admin/musicians`       → Listar todos los músicos
- `GET    /admin/musicians/:id`   → Obtener músico por ID
- `PUT    /admin/musicians/:id`   → Editar músico
- `DELETE /admin/musicians/:id`   → Eliminar músico

---

## Seguridad y Acceso
- Todos los endpoints `/admin/*` requieren autenticación JWT y rol `admin` o `superadmin`.
- Middleware recomendado:
  ```ts
  import { Request, Response, NextFunction } from 'express';
  export function adminOnly(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;
    if (user && (user.roll === 'admin' || user.roll === 'superadmin')) {
      return next();
    }
    return res.status(403).json({ message: 'Acceso solo para administradores' });
  }
  ```
- Añade este middleware a todas las rutas de administración.

---

## Ejemplo de Implementación de Rutas (Express)
```ts
import { Router } from 'express';
import { adminOnly } from '../middleware/adminOnly';
const router = Router();

router.get('/admin/users', adminOnly, async (req, res) => { /* ... */ });
router.post('/admin/users', adminOnly, async (req, res) => { /* ... */ });
// ...repite para el resto de endpoints
export default router;
```

---

## Ejemplo de Request/Response
### Crear usuario
**POST /admin/users**
```json
{
  "name": "Juan",
  "lastName": "Pérez",
  "userEmail": "juan@email.com",
  "roll": "admin",
  "status": true,
  "userPassword": "secreta123"
}
```
**Respuesta:**
```json
{
  "_id": "abc123",
  "name": "Juan",
  "lastName": "Pérez",
  "userEmail": "juan@email.com",
  "roll": "admin",
  "status": true
}
```

---

## Buenas Prácticas
- Documenta cada endpoint con Swagger/OpenAPI.
- Usa controladores separados para cada recurso.
- Valida y sanitiza todos los datos recibidos.
- Maneja errores y responde con mensajes claros y códigos HTTP apropiados.
- Limita el acceso a los endpoints críticos solo a `superadmin` si es necesario.
- Mantén la documentación actualizada en esta carpeta `/docs`.

---

## Integración Frontend
- Usa JWT en el header `Authorization: Bearer <token>` para todas las peticiones admin.
- Consulta los endpoints `/admin/*` para obtener, crear, editar o eliminar recursos globales.
- Maneja los errores de autenticación y autorización en el frontend.

---

## Ejemplo de Documentación Swagger
```yaml
/admin/users:
  get:
    summary: Obtener todos los usuarios
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
                $ref: '#/components/schemas/User'
```

---

## Contacto y soporte
- Para dudas sobre la arquitectura o integración, contacta al equipo backend de MusikOn.
- Mantén esta documentación como referencia para nuevos desarrolladores. 