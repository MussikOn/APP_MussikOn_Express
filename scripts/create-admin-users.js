const admin = require('firebase-admin');
const bcrypt = require('bcrypt');

// Configurar Firebase Admin usando ENV.js
const ENV = require('../ENV.js');

// Crear objeto de credenciales de Firebase
const serviceAccount = {
  type: "service_account",
  project_id: ENV.ENV.FIREBASE_PROJECT_ID,
  private_key_id: ENV.ENV.FIREBASE_PRIVATE_KEY_ID || "your-private-key-id",
  private_key: ENV.ENV.FIREBASE_PRIVATE_KEY ? ENV.ENV.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : "your-private-key",
  client_email: ENV.ENV.FIREBASE_CLIENT_EMAIL,
  client_id: ENV.ENV.FIREBASE_CLIENT_ID || "your-client-id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${ENV.ENV.FIREBASE_CLIENT_EMAIL}`
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${ENV.ENV.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

const db = admin.firestore();

async function createAdminUsers() {
  try {
    console.log('🚀 Creando usuarios administradores...');

    const users = [
      {
        name: 'Super',
        lastName: 'Administrador',
        userEmail: 'superadmin@mussikon.com',
        userPassword: 'admin123',
        roll: 'superadmin',
        status: 'active'
      },
      {
        name: 'Admin',
        lastName: 'General',
        userEmail: 'admin@mussikon.com',
        userPassword: 'admin123',
        roll: 'admin',
        status: 'active'
      },
      {
        name: 'Event',
        lastName: 'Creator',
        userEmail: 'event@mussikon.com',
        userPassword: 'event123',
        roll: 'eventCreator',
        status: 'active'
      },
      {
        name: 'Músico',
        lastName: 'Demo',
        userEmail: 'musician@mussikon.com',
        userPassword: 'music123',
        roll: 'musician',
        status: 'active'
      }
    ];

    for (const userData of users) {
      // Verificar si el usuario ya existe
      const existingUser = await db.collection('users')
        .where('userEmail', '==', userData.userEmail)
        .limit(1)
        .get();

      if (!existingUser.empty) {
        console.log(`⚠️  Usuario ${userData.userEmail} ya existe, saltando...`);
        continue;
      }

      // Encriptar contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.userPassword, saltRounds);

      // Crear usuario
      const userToCreate = {
        ...userData,
        userPassword: hashedPassword,
        create_at: new Date().toISOString(),
        lastLogin: null,
        loginCount: 0
      };

      const userRef = await db.collection('users').add(userToCreate);

      console.log(`✅ Usuario creado: ${userData.userEmail} (ID: ${userRef.id})`);
    }

    console.log('🎉 Usuarios administradores creados exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('Super Admin: superadmin@mussikon.com / admin123');
    console.log('Admin: admin@mussikon.com / admin123');
    console.log('Event Creator: event@mussikon.com / event123');
    console.log('Músico: musician@mussikon.com / music123');

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar el script
createAdminUsers(); 