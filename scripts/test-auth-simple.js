const axios = require('axios');

const BASE_URL = 'http://192.168.54.11:3001';

async function testAuthEndpoints() {
  console.log('🔍 Probando endpoints de autenticación...\n');

  try {
    // 1. Probar login con credenciales de demo
    console.log('1️⃣ Probando login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/admin-auth/login`, {
        email: 'admin@mussikon.com',
        password: 'admin123'
      });
      
      console.log('✅ Login exitoso');
      console.log(`   Token: ${loginResponse.data.token ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`   Usuario: ${loginResponse.data.user ? loginResponse.data.user.userEmail : '❌ Ausente'}`);
      console.log(`   Rol: ${loginResponse.data.user ? loginResponse.data.user.roll : '❌ Ausente'}`);
      
      const token = loginResponse.data.token;
      
      // 2. Probar verificación de token
      console.log('\n2️⃣ Probando verificación de token...');
      try {
        const verifyResponse = await axios.get(`${BASE_URL}/admin-auth/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Verificación de token exitosa');
        console.log(`   Usuario verificado: ${verifyResponse.data.user ? verifyResponse.data.user.userEmail : '❌ Ausente'}`);
      } catch (error) {
        console.log('❌ Error en verificación de token:', error.response?.status, error.response?.data?.message || error.message);
      }
      
      // 3. Probar endpoint de imágenes con autenticación
      console.log('\n3️⃣ Probando endpoints de imágenes con autenticación...');
      
      const authHeaders = { Authorization: `Bearer ${token}` };
      
      // Probar /imgs/stats
      try {
        const statsResponse = await axios.get(`${BASE_URL}/imgs/stats`, { headers: authHeaders });
        console.log('✅ /imgs/stats: OK');
        console.log(`   Total imágenes: ${statsResponse.data.totalImages || 0}`);
      } catch (error) {
        console.log('❌ /imgs/stats:', error.response?.status, error.response?.data?.message || error.message);
      }
      
      // Probar /imgs/
      try {
        const imagesResponse = await axios.get(`${BASE_URL}/imgs/`, { headers: authHeaders });
        console.log('✅ /imgs/: OK');
        console.log(`   Imágenes encontradas: ${imagesResponse.data.images ? imagesResponse.data.images.length : 0}`);
      } catch (error) {
        console.log('❌ /imgs/:', error.response?.status, error.response?.data?.message || error.message);
      }
      
      // Probar /imgs/statistics
      try {
        const statisticsResponse = await axios.get(`${BASE_URL}/imgs/statistics`, { headers: authHeaders });
        console.log('✅ /imgs/statistics: OK');
        console.log(`   Estadísticas obtenidas: ${Object.keys(statisticsResponse.data).length} campos`);
      } catch (error) {
        console.log('❌ /imgs/statistics:', error.response?.status, error.response?.data?.message || error.message);
      }
      
      // Probar /imgs/diagnose
      try {
        const diagnoseResponse = await axios.get(`${BASE_URL}/imgs/diagnose`, { headers: authHeaders });
        console.log('✅ /imgs/diagnose: OK');
        console.log(`   Diagnóstico completado: ${diagnoseResponse.data.message || 'OK'}`);
      } catch (error) {
        console.log('❌ /imgs/diagnose:', error.response?.status, error.response?.data?.message || error.message);
      }
      
    } catch (error) {
      console.log('❌ Error en login:', error.response?.status, error.response?.data?.message || error.message);
      
      // Si el login falla, probar rutas públicas de desarrollo
      console.log('\n🔄 Probando rutas públicas de desarrollo...');
      
      try {
        const statsResponse = await axios.get(`${BASE_URL}/imgs/stats/public`);
        console.log('✅ /imgs/stats/public: OK');
        console.log(`   Total imágenes: ${statsResponse.data.totalImages || 0}`);
      } catch (error) {
        console.log('❌ /imgs/stats/public:', error.response?.status, error.response?.data?.message || error.message);
      }
      
      try {
        const imagesResponse = await axios.get(`${BASE_URL}/imgs/all/public`);
        console.log('✅ /imgs/all/public: OK');
        console.log(`   Imágenes encontradas: ${imagesResponse.data.images ? imagesResponse.data.images.length : 0}`);
      } catch (error) {
        console.log('❌ /imgs/all/public:', error.response?.status, error.response?.data?.message || error.message);
      }
      
      try {
        const statisticsResponse = await axios.get(`${BASE_URL}/imgs/statistics/public`);
        console.log('✅ /imgs/statistics/public: OK');
        console.log(`   Estadísticas obtenidas: ${Object.keys(statisticsResponse.data).length} campos`);
      } catch (error) {
        console.log('❌ /imgs/statistics/public:', error.response?.status, error.response?.data?.message || error.message);
      }
      
      try {
        const verifyResponse = await axios.get(`${BASE_URL}/imgs/verify/public`);
        console.log('✅ /imgs/verify/public: OK');
        console.log(`   Verificación completada: ${verifyResponse.data.message || 'OK'}`);
      } catch (error) {
        console.log('❌ /imgs/verify/public:', error.response?.status, error.response?.data?.message || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
  
  console.log('\n🎯 Recomendaciones:');
  console.log('1. Si el login falla, ejecuta: npm run create-admin-users');
  console.log('2. Si los endpoints fallan, verifica que el servidor esté corriendo');
  console.log('3. Si hay errores 401, verifica que el token se esté enviando correctamente');
  console.log('4. Si hay errores 404, verifica que las rutas estén registradas correctamente');
}

testAuthEndpoints(); 