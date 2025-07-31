// Script de prueba para verificar el login del frontend
const testFrontendLogin = async () => {
  try {
    // Simular el proceso de login del frontend
    const loginData = {
      userEmail: 'astaciosanchezjefryagustin@gmail.com',
      userPassword: 'P0pok@tepel01'
    };

    console.log('🔐 Probando login del frontend...');
    
    // 1. Hacer la petición de login
    const response = await fetch('http://172.20.10.2:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();
    
    if (response.ok && data.token) {
      console.log('✅ Login exitoso');
      console.log('📋 Datos recibidos:', {
        message: data.msg,
        hasToken: !!data.token,
        hasUser: !!data.user,
        userEmail: data.user?.userEmail,
        userRole: data.user?.roll
      });

      // 2. Simular el almacenamiento en localStorage
      const token = data.token;
      const user = data.user;
      
      // 3. Verificar el token JWT
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        console.log('🔍 Token JWT payload:', payload);
        
        // 4. Verificar si el token tiene exp
        if (payload.exp) {
          const currentTime = Date.now() / 1000;
          const isExpired = payload.exp < currentTime;
          console.log('⏰ Token expira:', new Date(payload.exp * 1000));
          console.log('❌ Token expirado:', isExpired);
        } else {
          console.log('✅ Token no expira (sin campo exp)');
        }
        
        // 5. Verificar datos del usuario
        if (user) {
          console.log('👤 Usuario del backend:', {
            name: user.name,
            lastName: user.lastName,
            email: user.userEmail,
            roll: user.roll,
            status: user.status
          });
        }
        
        console.log('🎉 Prueba completada exitosamente');
        
      } catch (parseError) {
        console.error('❌ Error al parsear token JWT:', parseError);
      }
      
    } else {
      console.log('❌ Login fallido:', data);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
};

// Ejecutar la prueba
testFrontendLogin(); 