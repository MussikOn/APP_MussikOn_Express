const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando variables de entorno para IDrive E2...\n');

// Contenido del archivo .env
const envContent = `# ========================================
# CONFIGURACIÓN DE IDRIVE E2
# ========================================

# IDrive E2 Configuration
IDRIVE_E2_ACCESS_KEY=tu_access_key_aqui
IDRIVE_E2_SECRET_KEY=tu_secret_key_aqui
IDRIVE_E2_BUCKET_NAME=musikon-media
IDRIVE_E2_REGION=us-east-1
IDRIVE_E2_ENDPOINT=https://s3.us-east-1.idrive.com

# ========================================
# OTRAS CONFIGURACIONES
# ========================================

# JWT Secret
JWT_SECRET=tu-super-secret-jwt-muy-seguro-y-largo

# Puerto del servidor
PORT=3001

# Entorno
NODE_ENV=development

# Firebase Project ID (si es necesario)
FIREBASE_PROJECT_ID=tu-proyecto-firebase
`;

const envPath = path.join(__dirname, '..', '.env');

try {
    // Verificar si ya existe el archivo .env
    if (fs.existsSync(envPath)) {
        console.log('⚠️  El archivo .env ya existe.');
        console.log('📝 Contenido actual:');
        console.log(fs.readFileSync(envPath, 'utf8'));
        
        console.log('\n💡 Para actualizar la configuración de IDrive E2:');
        console.log('1. Abre el archivo .env');
        console.log('2. Actualiza las siguientes variables:');
        console.log('   IDRIVE_E2_ACCESS_KEY=tu_access_key_real');
        console.log('   IDRIVE_E2_SECRET_KEY=tu_secret_key_real');
        console.log('   IDRIVE_E2_BUCKET_NAME=musikon-media');
        console.log('   IDRIVE_E2_REGION=us-east-1');
        console.log('   IDRIVE_E2_ENDPOINT=https://s3.us-east-1.idrive.com');
    } else {
        // Crear el archivo .env
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Archivo .env creado exitosamente!');
        console.log('📝 Ubicación:', envPath);
    }
    
    console.log('\n🔑 Para obtener tus credenciales de IDrive E2:');
    console.log('1. Ve a https://www.idrive.com/e2/');
    console.log('2. Inicia sesión en tu cuenta');
    console.log('3. Ve a "Access Keys" o "API Keys"');
    console.log('4. Crea una nueva Access Key y Secret Key');
    console.log('5. Copia las credenciales al archivo .env');
    
    console.log('\n📁 Estructura esperada del bucket "musikon-media":');
    console.log('musikon-media/');
    console.log('├── deposits/');
    console.log('│   ├── 1754188088046-test_voucher.png');
    console.log('│   ├── 1754188972472-comprobante_1754188938389.jpg');
    console.log('│   └── ...');
    console.log('├── profile/');
    console.log('│   └── 1744826998680_Logo_app.png');
    console.log('├── post/');
    console.log('│   └── (imágenes de eventos)');
    console.log('└── gallery/');
    console.log('    └── (imágenes de galería)');
    
    console.log('\n🚀 Después de configurar las credenciales:');
    console.log('1. Reinicia el servidor: npm start');
    console.log('2. Prueba el endpoint: curl http://localhost:3001/imgs/all/idrive/public');
    console.log('3. Abre el panel de imágenes: http://localhost:3001/images-admin.html');
    
} catch (error) {
    console.error('❌ Error creando archivo .env:', error.message);
} 