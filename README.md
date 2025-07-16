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

#### Obtener galería de imágenes
```http
GET /imgs/getAllImg
```

#### Subir imagen de perfil de músico
```http
POST /media/saveImage
Content-Type: multipart/form-data
file: <archivo>
```

## 📄 Licencia
MIT © 2025 [Jefry Astacio](https://github.com/jefryastacio)

## 📬 Contacto
- Email: jasbootstudios@gmail.com
- GitHub: https://github.com/JASBOOTSTUDIOS

> “La música conecta lo que las palabras no pueden expresar.”

