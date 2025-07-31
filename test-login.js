// Script de prueba para verificar el login
const testLogin = async () => {
  try {
    const response = await fetch('http://172.20.10.2:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail: 'astaciosanchezjefryagustin@gmail.com',
        userPassword: 'P0pok@tepel01'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login exitoso:', {
        message: data.msg,
        hasToken: !!data.token,
        hasUser: !!data.user,
        userEmail: data.user?.userEmail,
        userRole: data.user?.roll
      });
    } else {
      console.log('❌ Login fallido:', data);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
};

// Ejecutar la prueba
testLogin(); 