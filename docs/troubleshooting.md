# 🐛 Solución de Problemas - MussikOn API

## 📋 Problemas Comunes y Soluciones

Esta guía te ayudará a resolver los problemas más comunes que pueden surgir durante el desarrollo y despliegue de MussikOn API.

## 🔧 Problemas de Instalación

### Error: Node.js no encontrado

**Síntoma**: `'node' is not recognized as an internal or external command`

**Solución**:
```bash
# Verificar versión de Node.js
node --version

# Si no está instalado, descargar desde:
# https://nodejs.org/

# En Windows, reiniciar la terminal después de la instalación
```

### Error: Dependencias no encontradas

**Síntoma**: `Cannot find module 'express'`

**Solución**:
```bash
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules
rm package-lock.json
npm install
```

### Error: TypeScript no compila

**Síntoma**: Errores de compilación TypeScript

**Solución**:
```bash
# Verificar versión de TypeScript
npx tsc --version

# Limpiar y recompilar
npm run clean
npm run build

# Si persisten errores, verificar tsconfig.json
```

## 🔥 Problemas de Firebase

### Error: Credenciales de Firebase inválidas

**Síntoma**: `FirebaseError: Failed to determine project ID`

**Solución**:
```bash
# Verificar configuración
firebase projects:list

# Reconfigurar Firebase
firebase logout
firebase login
firebase init

# Verificar ENV.ts
cat ENV.ts | grep FIREBASE
```

### Error: Firestore no conecta

**Síntoma**: `FirebaseError: Missing or insufficient permissions`

**Solución**:
1. Verificar reglas de Firestore:
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

2. Desplegar reglas:
```bash
firebase deploy --only firestore:rules
```

### Error: Authentication no funciona

**Síntoma**: `FirebaseError: The custom token format is incorrect`

**Solución**:
1. Verificar configuración de Authentication en Firebase Console
2. Habilitar métodos de autenticación necesarios
3. Verificar dominios autorizados

## ☁️ Problemas de AWS S3 (iDrive E2)

### Error: Credenciales AWS inválidas

**Síntoma**: `InvalidAccessKeyId: The AWS Access Key Id you provided does not exist`

**Solución**:
```bash
# Verificar credenciales
aws configure list

# Configurar credenciales
aws configure

# Verificar bucket
aws s3 ls s3://your-bucket-name
```

### Error: Bucket no encontrado

**Síntoma**: `NoSuchBucket: The specified bucket does not exist`

**Solución**:
```bash
# Crear bucket
aws s3 mb s3://mussikon-assets

# Verificar bucket existe
aws s3 ls
```

### Error: CORS no configurado

**Síntoma**: `Access to fetch at 'https://bucket.s3.amazonaws.com' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solución**:
```json
// cors.json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

```bash
# Aplicar configuración CORS
aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration file://cors.json
```

## 💳 Problemas de Stripe

### Error: Clave de API inválida

**Síntoma**: `Invalid API key provided`

**Solución**:
1. Verificar clave en Stripe Dashboard
2. Usar clave de test para desarrollo
3. Verificar ENV.ts:
```typescript
STRIPE_SECRET_KEY: 'sk_test_...' // para desarrollo
STRIPE_SECRET_KEY: 'sk_live_...' // para producción
```

### Error: Webhook no funciona

**Síntoma**: `No signatures found matching the expected signature`

**Solución**:
```bash
# Instalar Stripe CLI
stripe listen --forward-to localhost:3001/webhooks/stripe

# Verificar webhook secret en ENV.ts
STRIPE_WEBHOOK_SECRET: 'whsec_...'
```

## 🗺️ Problemas de Google Maps

### Error: API Key inválida

**Síntoma**: `This API project is not authorized to use this API`

**Solución**:
1. Habilitar APIs en Google Cloud Console:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
2. Verificar restricciones de API Key
3. Verificar facturación habilitado

### Error: Cuota excedida

**Síntoma**: `OVER_QUERY_LIMIT`

**Solución**:
1. Verificar límites de cuota en Google Cloud Console
2. Implementar rate limiting
3. Habilitar facturación para cuotas más altas

## 🔐 Problemas de Autenticación

### Error: JWT inválido

**Síntoma**: `JsonWebTokenError: invalid token`

**Solución**:
```typescript
// Verificar configuración JWT
export const ENV = {
  JWT_SECRET: 'your-secret-key',
  JWT_EXPIRES_IN: '24h',
};
```

### Error: Token expirado

**Síntoma**: `TokenExpiredError: jwt expired`

**Solución**:
1. Implementar refresh token
2. Verificar expiración en frontend
3. Renovar token automáticamente

### Error: Rol insuficiente

**Síntoma**: `Insufficient permissions`

**Solución**:
```typescript
// Verificar middleware de roles
router.get('/admin', 
  authMiddleware, 
  requireRole(['admin', 'super_admin']), 
  (req, res) => {
    // Lógica de administración
  }
);
```

## 📧 Problemas de Email

### Error: SMTP no conecta

**Síntoma**: `ECONNREFUSED`

**Solución**:
```typescript
// Verificar configuración SMTP
export const ENV = {
  EMAIL_HOST: 'smtp.gmail.com',
  EMAIL_PORT: 587,
  EMAIL_USER: 'your-email@gmail.com',
  EMAIL_PASS: 'your-app-password', // No contraseña normal
};
```

### Error: Gmail App Password

**Síntoma**: `Invalid login`

**Solución**:
1. Habilitar verificación en dos pasos
2. Generar contraseña de aplicación
3. Usar contraseña de aplicación, no la contraseña normal

## 🔔 Problemas de Notificaciones Push

### Error: Expo Push Token inválido

**Síntoma**: `Invalid push token`

**Solución**:
```typescript
// Verificar configuración Expo
export const ENV = {
  EXPO_ACCESS_TOKEN: 'your-expo-access-token',
  EXPO_PROJECT_ID: 'your-expo-project-id',
};
```

### Error: Notificación no enviada

**Síntoma**: `Push notification failed`

**Solución**:
1. Verificar token de dispositivo
2. Verificar configuración de Expo
3. Verificar permisos de notificación

## 🚀 Problemas de Despliegue

### Error: Puerto en uso

**Síntoma**: `EADDRINUSE: address already in use`

**Solución**:
```bash
# Encontrar proceso usando el puerto
lsof -ti:3001

# Matar proceso
kill -9 $(lsof -ti:3001)

# O cambiar puerto en ENV.ts
PORT: 3002
```

### Error: Variables de entorno faltantes

**Síntoma**: `ENV is not defined`

**Solución**:
```bash
# Verificar archivo ENV.ts
ls -la ENV.ts

# Copiar archivo de ejemplo
cp ENV_example.ts ENV.ts

# Verificar variables requeridas
node -e "console.log(require('./ENV.ts').ENV)"
```

### Error: Firebase Functions no desplega

**Síntoma**: `Functions deploy failed`

**Solución**:
```bash
# Verificar configuración
firebase functions:config:get

# Limpiar cache
firebase functions:delete --force

# Redesplegar
firebase deploy --only functions
```

## 📊 Problemas de Performance

### Error: Respuesta lenta

**Síntoma**: Tiempos de respuesta altos

**Solución**:
1. Implementar caching
2. Optimizar consultas de Firestore
3. Usar índices apropiados
4. Implementar paginación

### Error: Memoria insuficiente

**Síntoma**: `JavaScript heap out of memory`

**Solución**:
```bash
# Aumentar memoria de Node.js
node --max-old-space-size=4096 dist/index.js

# O en package.json
{
  "scripts": {
    "start": "node --max-old-space-size=4096 dist/index.js"
  }
}
```

## 🧪 Problemas de Testing

### Error: Tests fallan

**Síntoma**: `Test suite failed to run`

**Solución**:
```bash
# Limpiar cache de Jest
npm test -- --clearCache

# Ejecutar tests con verbose
npm test -- --verbose

# Verificar configuración de Jest
cat jest.config.js
```

### Error: Coverage no genera

**Síntoma**: `No coverage data found`

**Solución**:
```bash
# Generar coverage
npm run test:coverage

# Verificar configuración en jest.config.js
collectCoverageFrom: [
  'src/**/*.{js,ts}',
  '!src/**/*.d.ts',
  '!src/index.ts'
]
```

## 🔍 Debugging

### Logs de Desarrollo

```typescript
// Habilitar logs detallados
export const ENV = {
  LOG_LEVEL: 'debug',
  NODE_ENV: 'development',
};
```

### Debug de Firebase

```bash
# Habilitar debug de Firebase
export FIREBASE_DEBUG=true
npm run dev
```

### Debug de AWS

```bash
# Habilitar debug de AWS
export AWS_SDK_LOAD_CONFIG=1
export AWS_DEBUG=true
```

## 📞 Contacto y Soporte

### Recursos de Ayuda

1. **Documentación**: [docs/README.md](./README.md)
2. **Issues de GitHub**: [Reportar Bug](https://github.com/MussikOn/APP_MussikOn_Express/issues)
3. **Discord**: [Canal de Soporte](https://discord.gg/mussikon)

### Información para Reportes

Al reportar un problema, incluye:

```markdown
## Descripción del Problema
[Descripción clara del problema]

## Pasos para Reproducir
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

## Comportamiento Esperado
[Lo que debería pasar]

## Comportamiento Actual
[Lo que está pasando]

## Información del Sistema
- OS: [Windows/Mac/Linux]
- Node.js: [Versión]
- npm: [Versión]
- Firebase CLI: [Versión]

## Logs de Error
```
[Pegar logs de error aquí]
```

## Capturas de Pantalla
[Si aplica]
```

---

**¿No encontraste la solución?** Contacta al equipo de desarrollo o crea un issue en GitHub. 