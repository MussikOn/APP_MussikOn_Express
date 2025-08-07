# 🚀 Inicio Rápido - MussikOn API

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18.0.0 o superior)
- **npm** (versión 8.0.0 o superior)
- **Git**
- **Firebase CLI** (opcional, para despliegue)

### Verificar instalaciones

```bash
node --version
npm --version
git --version
firebase --version  # opcional
```

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/MussikOn/APP_MussikOn_Express.git
cd APP_MussikOn_Express
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Configuración del servidor
PORT=10000
NODE_ENV=development

# Firebase
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_PRIVATE_KEY="tu-clave-privada"
FIREBASE_CLIENT_EMAIL=tu-email@proyecto.iam.gserviceaccount.com

# JWT
JWT_SECRET=tu-jwt-secret-super-seguro
JWT_EXPIRES_IN=24h

# IDrive E2 (S3-compatible)
IDRIVE_ACCESS_KEY=tu-access-key
IDRIVE_SECRET_KEY=tu-secret-key
IDRIVE_BUCKET_NAME=tu-bucket
IDRIVE_ENDPOINT=https://s3.us-east-1.idrivee2.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-app

# Redis (opcional, para caché)
REDIS_URL=redis://localhost:6379
```

### 4. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a Configuración del proyecto > Cuentas de servicio
4. Genera una nueva clave privada
5. Descarga el archivo JSON y colócalo en la raíz del proyecto
6. Actualiza las variables de entorno con los datos del archivo

### 5. Configurar IDrive E2

1. Crea una cuenta en [IDrive E2](https://www.idrive.com/e2/)
2. Crea un bucket para almacenar las imágenes
3. Genera las credenciales de acceso
4. Actualiza las variables de entorno

## 🏃‍♂️ Ejecutar el proyecto

### Modo desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:10000`

### Modo producción

```bash
npm run build
npm start
```

## 🧪 Verificar la instalación

### 1. Verificar endpoints básicos

```bash
curl http://localhost:10000/api/health
```

Deberías recibir una respuesta como:
```json
{
  "status": "OK",
  "timestamp": "2024-12-19T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 2. Verificar documentación de la API

Visita `http://localhost:10000/api-docs` para ver la documentación interactiva de Swagger.

### 3. Ejecutar tests

```bash
npm test
```

## 📱 Próximos pasos

1. **Explorar la API**: Revisa la documentación en `/api-docs`
2. **Configurar el frontend**: Sigue la [guía de integración frontend](../development/frontend-integration.md)
3. **Configurar el móvil**: Consulta la [guía de integración móvil](../mobile-integration/README.md)
4. **Desplegar**: Sigue la [guía de despliegue](../deployment/README.md)

## 🔧 Scripts útiles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Compilar TypeScript
npm run build:watch      # Compilar en modo watch

# Testing
npm test                 # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Tests con cobertura

# Linting y formateo
npm run lint             # Verificar código
npm run lint:fix         # Corregir problemas de linting
npm run format           # Formatear código

# Despliegue
npm run deploy:firebase  # Desplegar en Firebase
npm run deploy:functions # Desplegar solo funciones
npm run deploy:hosting   # Desplegar solo hosting

# Monitoreo
npm run monitor:performance    # Monitorear rendimiento
npm run analyze:queries        # Analizar consultas
npm run monitor:indexes        # Monitorear índices
```

## 🚨 Solución de problemas comunes

### Error: "Cannot find module"
```bash
npm install
npm run build
```

### Error: "Firebase not initialized"
Verifica que las variables de entorno de Firebase estén correctamente configuradas.

### Error: "IDrive connection failed"
Verifica las credenciales de IDrive E2 en las variables de entorno.

### Puerto ocupado
Cambia el puerto en el archivo `.env`:
```env
PORT=10001
```

## 📞 Soporte

Si encuentras problemas durante la instalación:

1. Revisa los [logs de error](../troubleshooting/README.md)
2. Consulta las [preguntas frecuentes](../troubleshooting/faq.md)
3. Abre un [issue en GitHub](https://github.com/MussikOn/APP_MussikOn_Express/issues)
4. Contacta al equipo de soporte: soporte@mussikon.com

---

**Siguiente**: [Guía de Desarrollo](../development/README.md) 