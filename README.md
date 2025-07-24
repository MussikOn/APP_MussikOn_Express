# MusikOn API Backend

🎵 MusikOn — Conecta músicos con eventos en tiempo real. Encuentra, organiza y crea experiencias musicales inolvidables.

## 🚀 Instalación y ejecución

1. Clona el repositorio:
```bash
   git clone https://github.com/JASBOOTSTUDIOS/Express_MusikOn_Backend.git
   cd Express_MusikOn_Backend
```
2. Instala dependencias:
```bash
   npm install
```
3. Copia el archivo de ejemplo de variables de entorno y configúralo:
```bash
   cp ENV_example.ts ENV.ts
   # Edita ENV.ts y agrega tus credenciales y configuraciones
```
4. Inicia el servidor:
```bash
   npm start
```

## 🌐 Uso general

- La API estará disponible en `http://localhost:1000` (o el puerto configurado).

> **¿Necesitas gestionar solicitudes directas de músicos?** Consulta la documentación detallada en [`docs/MUSICIAN_REQUESTS_API.md`](docs/MUSICIAN_REQUESTS_API.md)

### Ejemplo de endpoints

#### Registro de usuario
```http
POST /auth/Register
Content-Type: application/json
{
  "name": "Juan",
  "lastName": "Pérez",
  "roll": "musico",
  "userEmail": "juan@example.com",
  "userPassword": "Password*123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json
{
  "userEmail": "juan@example.com",
  "userPassword": "Password*123"
}
```

#### Solicitud directa de músico
```http
POST /musician-requests/
Content-Type: application/json
{
  "userId": "organizador@example.com",
  "eventType": "Boda",
  "date": "2024-07-01",
  "startTime": "18:00",
  "endTime": "22:00",
  "location": "Ciudad",
  "instrument": "Guitarra",
  "budget": "200 USD",
  "comments": "Repertorio variado"
}
```

#### Aceptar solicitud de músico
```http
POST /musician-requests/accept
Content-Type: application/json
{
  "requestId": "abc123",
  "musicianId": "musico@example.com"
}
```

#### Cancelar solicitud de músico
```http
POST /musician-requests/cancel
Content-Type: application/json
{
  "requestId": "abc123"
}
```

#### Consultar estado de solicitud
```http
GET /musician-requests/abc123/status
```

#### Endpoints de imágenes
```http
GET /imgs/getAllImg
POST /media/saveImage
GET /media/getImage/:key
```

#### Endpoint de superadmin
```http
DELETE /superAdmin/deleteAllUsers
```

> **¿Quieres integrar notificaciones en tiempo real?** Consulta la sección de eventos de socket en la documentación principal.

## 📄 Licencia
MIT © 2025 [Jefry Astacio](https://github.com/jefryastacio)

## 📬 Contacto
- Email: jasbootstudios@gmail.com
- GitHub: https://github.com/JASBOOTSTUDIOS

> “La música conecta lo que las palabras no pueden expresar.”

