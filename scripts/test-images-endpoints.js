const axios = require('axios');

const BASE_URL = 'http://192.168.54.11:3001';

async function testImageEndpoints() {
  console.log('🔍 Probando endpoints de imágenes...\n');

  const endpoints = [
    '/imgs/stats/public',
    '/imgs/all/public', 
    '/imgs/statistics/public',
    '/imgs/verify/public'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Probando: ${endpoint}`);
      const response = await axios.get(`${BASE_URL}${endpoint}`);
      
      console.log(`✅ ${endpoint}: OK (${response.status})`);
      
      if (response.data) {
        const dataKeys = Object.keys(response.data);
        console.log(`   Datos recibidos: ${dataKeys.length} campos`);
        
        // Mostrar algunos datos específicos según el endpoint
        if (endpoint.includes('stats')) {
          console.log(`   Total imágenes: ${response.data.totalImages || 0}`);
        } else if (endpoint.includes('all')) {
          console.log(`   Imágenes en lista: ${response.data.images ? response.data.images.length : 0}`);
        } else if (endpoint.includes('verify')) {
          console.log(`   Mensaje: ${response.data.message || 'N/A'}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint}: Error ${error.response?.status || 'Network'} - ${error.response?.data?.message || error.message}`);
    }
    console.log('');
  }

  console.log('🎯 Resumen:');
  console.log('- Si todos los endpoints devuelven 200, el panel de imágenes debería funcionar');
  console.log('- Si hay errores 404, verifica que el servidor esté corriendo');
  console.log('- Si hay errores 500, revisa los logs del servidor');
  console.log('- Visita: http://192.168.54.11:3001/images-admin.html');
}

testImageEndpoints(); 