const axios = require('axios');

async function testImagesDisplay() {
  console.log('🖼️ Probando visualización de imágenes...\n');

  try {
    // Probar endpoint de imágenes
    console.log('📡 Probando endpoint de imágenes...');
    const imagesResponse = await axios.get('http://localhost:3001/imgs/all/public');
    
    if (imagesResponse.data.success) {
      console.log('✅ Endpoint de imágenes funcionando');
      console.log(`📊 Total de imágenes: ${imagesResponse.data.images.length}`);
      
      // Verificar cada imagen
      for (const image of imagesResponse.data.images) {
        console.log(`\n🖼️ Imagen: ${image.filename}`);
        console.log(`   URL: ${image.url}`);
        console.log(`   Categoría: ${image.category}`);
        
        // Probar que la imagen se puede cargar
        try {
                   const imageResponse = await axios.get(`http://localhost:3001${image.url}`, {
           responseType: 'text'
         });
          console.log(`   ✅ Imagen cargada correctamente (${imageResponse.data.length} bytes)`);
        } catch (imageError) {
          console.log(`   ❌ Error cargando imagen: ${imageError.message}`);
        }
      }
    } else {
      console.log('❌ Error en endpoint de imágenes');
    }

    // Probar endpoint de estadísticas
    console.log('\n📊 Probando endpoint de estadísticas...');
    const statsResponse = await axios.get('http://localhost:3001/imgs/stats/public');
    
    if (statsResponse.data.success) {
      console.log('✅ Estadísticas cargadas correctamente');
      console.log(`   Total de imágenes: ${statsResponse.data.totalImages}`);
      console.log(`   Tamaño total: ${statsResponse.data.totalSize} bytes`);
    } else {
      console.log('❌ Error cargando estadísticas');
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }

  console.log('\n🎯 Prueba completada.');
  console.log('💡 Ahora puedes abrir http://localhost:3001/images-admin.html en tu navegador');
  console.log('   Las imágenes deberían mostrarse correctamente sin errores de red.');
}

testImagesDisplay(); 