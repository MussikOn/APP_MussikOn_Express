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
- Los roles principales son: `musico`, `eventCreator` (organizador), y `admin`.
- Los endpoints de eventos validan el rol antes de permitir crear o aceptar solicitudes.
- Ejemplo de middleware:
```ts
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.roll !== role) {
      return res.status(403).json({ msg: 'No autorizado' });
    }
    next();
  };
}
```

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

---

Consulta los archivos específicos en esta carpeta para detalles de cada mecanismo de seguridad implementado. 