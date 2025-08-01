# 🚀 Guía de Instalación - MussikOn API

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v16 o superior)
- **npm** o **yarn**
- **Git**
- **Firebase CLI**
- **Cuenta de Firebase**
- **Cuenta de AWS S3** (iDrive E2)

## 🔧 Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone https://github.com/MussikOn/APP_MussikOn_Express.git
cd APP_MussikOn_Express
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp ENV_example.ts ENV.ts

# Editar el archivo con tus credenciales
code ENV.ts  # o tu editor preferido
```

### 4. Configurar Firebase

```bash
# Iniciar sesión en Firebase
firebase login

# Inicializar proyecto Firebase
firebase init

# Seleccionar:
# - Firestore
# - Functions
# - Hosting (opcional)
```

### 5. Configurar AWS S3 (iDrive E2)

1. Crear una cuenta en [iDrive E2](https://www.idrive.com/e2/)
2. Crear un bucket para almacenamiento
3. Generar credenciales de acceso
4. Configurar en `ENV.ts`

### 6. Compilar el Proyecto

```bash
npm run build
```

### 7. Ejecutar en Desarrollo

```bash
npm run dev
```

## 🔧 Configuración Detallada

### Variables de Entorno Requeridas

```typescript
// ENV.ts
export const ENV = {
  // Firebase Configuration
  FIREBASE_PROJECT_ID: 'your-project-id',
  FIREBASE_PRIVATE_KEY: 'your-private-key',
  FIREBASE_CLIENT_EMAIL: 'your-client-email',
  
  // JWT Configuration
  JWT_SECRET: 'your-jwt-secret-key',
  JWT_EXPIRES_IN: '24h',
  
  // AWS S3 Configuration
  AWS_ACCESS_KEY_ID: 'your-access-key',
  AWS_SECRET_ACCESS_KEY: 'your-secret-key',
  AWS_REGION: 'your-region',
  AWS_BUCKET_NAME: 'your-bucket-name',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: 'your-google-client-id',
  GOOGLE_CLIENT_SECRET: 'your-google-client-secret',
  
  // Stripe (Pagos)
  STRIPE_SECRET_KEY: 'your-stripe-secret-key',
  STRIPE_PUBLISHABLE_KEY: 'your-stripe-publishable-key',
  
  // Google Maps (Geolocalización)
  GOOGLE_MAPS_API_KEY: 'your-google-maps-api-key',
  
  // Server Configuration
  PORT: 3001,
  NODE_ENV: 'development'
};
```

### Configuración de Firebase

1. **Crear Proyecto Firebase**:
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Crea un nuevo proyecto
   - Habilita Firestore Database
   - Habilita Authentication (Google, Email/Password)

2. **Configurar Firestore**:
   ```bash
   # Reglas de seguridad básicas
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **Configurar Authentication**:
   - Habilita Google Sign-In
   - Configura dominios autorizados

### Configuración de AWS S3 (iDrive E2)

1. **Crear Bucket**:
   - Nombre: `mussikon-assets`
   - Región: Cercana a tu ubicación
   - Configuración: Privado

2. **Configurar CORS**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

3. **Crear Usuario IAM**:
   - Permisos: `AmazonS3FullAccess`
   - Generar Access Key y Secret Key

## 🧪 Verificación de Instalación

### 1. Verificar Dependencias

```bash
npm list --depth=0
```

### 2. Verificar Compilación

```bash
npm run build
# Debe completarse sin errores
```

### 3. Verificar Servidor

```bash
npm run dev
# Debe mostrar: "Server running on port 3001"
```

### 4. Verificar Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Swagger UI
open http://localhost:3001/api-docs
```

## 🐛 Solución de Problemas

### Error: Firebase Configuration

```bash
# Verificar credenciales
firebase projects:list

# Reconfigurar Firebase
firebase logout
firebase login
firebase init
```

### Error: AWS S3 Connection

```bash
# Verificar credenciales
aws s3 ls s3://your-bucket-name

# Verificar configuración
node -e "console.log(require('./ENV.ts').ENV.AWS_BUCKET_NAME)"
```

### Error: Port Already in Use

```bash
# Cambiar puerto en ENV.ts
PORT: 3002

# O matar proceso
lsof -ti:3001 | xargs kill -9
```

### Error: TypeScript Compilation

```bash
# Limpiar y reinstalar
rm -rf node_modules
rm -rf dist
npm install
npm run build
```

## 📚 Próximos Pasos

1. **Configurar Base de Datos**: [Guía de Configuración](./configuration.md)
2. **Configurar Autenticación**: [Guía de Seguridad](../security/authentication.md)
3. **Configurar Pagos**: [Guía de Pagos](../api/payments.md)
4. **Desplegar en Producción**: [Guía de Despliegue](../deployment/firebase.md)

## 🔗 Enlaces Útiles

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Documentación de AWS S3](https://docs.aws.amazon.com/s3/)
- [Documentación de Stripe](https://stripe.com/docs)
- [Documentación de Google Maps](https://developers.google.com/maps/documentation)

---

**¿Necesitas ayuda?** Consulta la [guía de solución de problemas](../troubleshooting.md) o contacta al equipo de desarrollo. 