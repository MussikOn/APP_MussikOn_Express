const axios = require('axios');

async function testSignedUrls() {
  console.log('🔐 Probando endpoint con URLs firmadas de IDrive E2...\n');

  try {
    // Primero necesitamos obtener un token de autenticación
    console.log('🔑 Obteniendo token de autenticación...');
    const loginResponse = await axios.post('http://localhost:3001/admin-auth/login', {
      email: 'admin@mussikon.com',
      password: 'admin123',
      role: 'admin'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Error en login, probando sin autenticación...');
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Token obtenido correctamente');

    // Probar endpoint con URLs firmadas
    console.log('\n📡 Probando endpoint /imgs/all/signed...');
    const signedResponse = await axios.get('http://localhost:3001/imgs/all/signed', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (signedResponse.data.success) {
      console.log('✅ Endpoint con URLs firmadas funcionando');
      console.log(`📊 Total de imágenes: ${signedResponse.data.images.length}`);
      console.log(`📝 Mensaje: ${signedResponse.data.message}`);
      
      // Verificar cada imagen
      for (const image of signedResponse.data.images) {
        console.log(`\n🖼️ Imagen: ${image.filename}`);
        console.log(`   ID: ${image.id}`);
        console.log(`   Categoría: ${image.category}`);
        console.log(`   Tamaño: ${image.size} bytes`);
        console.log(`   URL firmada: ${image.url.substring(0, 50)}...`);
        
        // Verificar que la URL firmada es diferente a la original
        if (image.originalUrl) {
          console.log(`   URL original: ${image.originalUrl.substring(0, 50)}...`);
          if (image.url !== image.originalUrl) {
            console.log(`   ✅ URL firmada generada correctamente`);
          } else {
            console.log(`   ⚠️ URL firmada igual a la original`);
          }
        }

        // Verificar si hay errores en la generación de URL firmada
        if (image.signedUrlError) {
          console.log(`   ❌ Error generando URL firmada`);
        }
      }

      // Probar que las URLs firmadas son accesibles
      console.log('\n🔍 Verificando accesibilidad de URLs firmadas...');
      for (const image of signedResponse.data.images.slice(0, 3)) { // Solo probar las primeras 3
        try {
          const imageResponse = await axios.get(image.url, {
            responseType: 'arraybuffer',
            timeout: 10000
          });
          console.log(`   ✅ ${image.filename}: Accesible (${imageResponse.data.length} bytes)`);
        } catch (imageError) {
          console.log(`   ❌ ${image.filename}: No accesible - ${imageError.message}`);
        }
      }

    } else {
      console.log('❌ Error en endpoint con URLs firmadas');
    }

    // Comparar con endpoint público
    console.log('\n📊 Comparando con endpoint público...');
    const publicResponse = await axios.get('http://localhost:3001/imgs/all/public');
    
    if (publicResponse.data.success) {
      console.log(`✅ Endpoint público: ${publicResponse.data.images.length} imágenes`);
      console.log(`🔐 Endpoint firmado: ${signedResponse.data.images.length} imágenes`);
      
      if (signedResponse.data.images.length > 0) {
        console.log('🎯 Las imágenes reales de IDrive E2 están disponibles con URLs firmadas');
      } else {
        console.log('⚠️ No hay imágenes reales en la base de datos, usando datos de prueba');
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }

  console.log('\n🎯 Prueba completada.');
  console.log('💡 Si las URLs firmadas funcionan, las imágenes reales de IDrive E2 se mostrarán en el panel.');
}

testSignedUrls(); 