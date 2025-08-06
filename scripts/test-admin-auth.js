const admin = require('firebase-admin');
const bcrypt = require('bcrypt');

// Inicializar Firebase Admin
const serviceAccount = require('../ENV.js');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

async function testAdminAuth() {
  console.log('🔍 Probando autenticación de administradores...\n');

  try {
    // Verificar si hay usuarios admin en la base de datos
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('roll', 'in', ['admin', 'superadmin']).get();

    if (snapshot.empty) {
      console.log('❌ No se encontraron usuarios administradores en la base de datos.');
      console.log('💡 Ejecuta: npm run create-admin-users');
      return;
    }

    console.log(`✅ Se encontraron ${snapshot.size} usuarios administradores:\n`);

    snapshot.forEach(doc => {
      const user = doc.data();
      console.log(`👤 Usuario: ${user.userEmail}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Rol: ${user.roll}`);
      console.log(`   Nombre: ${user.name} ${user.lastName}`);
      console.log(`   Estado: ${user.status || 'activo'}`);
      console.log(`   Último login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}`);
      console.log(`   Contador de logins: ${user.loginCount || 0}`);
      console.log('');
    });

    // Probar credenciales de demo
    console.log('🧪 Probando credenciales de demo...\n');

    const demoCredentials = [
      { email: 'admin@mussikon.com', password: 'admin123' },
      { email: 'superadmin@mussikon.com', password: 'super123' },
      { email: 'eventcreator@mussikon.com', password: 'event123' },
      { email: 'musician@mussikon.com', password: 'music123' }
    ];

    for (const cred of demoCredentials) {
      try {
        const userSnapshot = await usersRef.where('userEmail', '==', cred.email).get();
        
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const user = userDoc.data();
          
          // Verificar contraseña
          const isValidPassword = await bcrypt.compare(cred.password, user.password);
          
          console.log(`📧 ${cred.email}:`);
          console.log(`   Existe: ✅`);
          console.log(`   Contraseña válida: ${isValidPassword ? '✅' : '❌'}`);
          console.log(`   Rol: ${user.roll}`);
          console.log(`   Estado: ${user.status || 'activo'}`);
        } else {
          console.log(`📧 ${cred.email}: ❌ No existe`);
        }
      } catch (error) {
        console.log(`📧 ${cred.email}: ❌ Error - ${error.message}`);
      }
      console.log('');
    }

    // Verificar configuración de JWT
    console.log('🔐 Verificando configuración de JWT...\n');
    
    const ENV = require('../ENV.js');
    if (ENV.TOKEN_SECRET) {
      console.log('✅ TOKEN_SECRET está configurado');
    } else {
      console.log('❌ TOKEN_SECRET no está configurado');
    }

    console.log('\n🎯 Para probar el login, usa estas credenciales:');
    console.log('   Email: admin@mussikon.com');
    console.log('   Password: admin123');
    console.log('\n   O visita: http://localhost:3001/login.html');

  } catch (error) {
    console.error('❌ Error al probar autenticación:', error);
  } finally {
    process.exit(0);
  }
}

testAdminAuth(); 