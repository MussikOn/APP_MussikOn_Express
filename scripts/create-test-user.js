const axios = require('axios');

async function createTestUser() {
  console.log('👤 Creando usuario de prueba...\n');

  try {
    // Primero intentar hacer login para ver si el usuario ya existe
    console.log('🔍 Verificando si el usuario ya existe...');
    try {
      const loginResponse = await axios.post('http://localhost:3001/admin-auth/login', {
        email: 'admin@mussikon.com',
        password: 'admin123',
        role: 'admin'
      });

      if (loginResponse.data.success) {
        console.log('✅ Usuario de prueba ya existe y puede hacer login');
        return;
      }
    } catch (loginError) {
      console.log('ℹ️ Usuario no existe o credenciales incorrectas, procediendo a crear...');
    }

    // Crear usuario usando el endpoint de creación
    console.log('📝 Creando usuario de prueba...');
    const createResponse = await axios.post('http://localhost:3001/admin-auth/create-user', {
      name: 'Admin',
      lastName: 'Test',
      email: 'admin@mussikon.com',
      password: 'admin123',
      role: 'admin',
      status: 'active'
    });

    if (createResponse.data.success) {
      console.log('✅ Usuario de prueba creado exitosamente');
      console.log(`   Email: admin@mussikon.com`);
      console.log(`   Contraseña: admin123`);
      console.log(`   Rol: admin`);
    } else {
      console.log('❌ Error creando usuario:', createResponse.data.error);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }

  console.log('\n🎯 Usuario de prueba listo para usar.');
}

createTestUser(); 