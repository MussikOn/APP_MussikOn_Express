const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

/**
 * Script para probar la consulta de una sola imagen en IDrive E2
 */
async function testSingleImageEndpoints() {
  console.log('🖼️ Probando endpoints para consulta de una sola imagen en IDrive E2\n');

  try {
    // 1. Obtener imagen por nombre de archivo
    console.log('1️⃣ Probando obtener imagen por nombre de archivo...');
    const filenameResponse = await axios.get(`${BASE_URL}/imgs/filename/1754188088046-test_voucher.png/public`);
    
    if (filenameResponse.data.success) {
      console.log('✅ Imagen encontrada por nombre:');
      console.log(`   📁 Nombre: ${filenameResponse.data.image.filename}`);
      console.log(`   📊 Tamaño: ${filenameResponse.data.image.size} bytes`);
      console.log(`   📂 Categoría: ${filenameResponse.data.image.category}`);
      console.log(`   🔗 URL: ${filenameResponse.data.image.url.substring(0, 100)}...`);
    } else {
      console.log('❌ Error obteniendo imagen por nombre:', filenameResponse.data.error);
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // 2. Obtener imagen por nombre de archivo con categoría específica
    console.log('2️⃣ Probando obtener imagen por nombre con categoría específica...');
    const filenameWithCategoryResponse = await axios.get(`${BASE_URL}/imgs/filename/1754188088046-test_voucher.png/public?category=deposits`);
    
    if (filenameWithCategoryResponse.data.success) {
      console.log('✅ Imagen encontrada por nombre con categoría:');
      console.log(`   📁 Nombre: ${filenameWithCategoryResponse.data.image.filename}`);
      console.log(`   📂 Categoría: ${filenameWithCategoryResponse.data.image.category}`);
    } else {
      console.log('❌ Error obteniendo imagen por nombre con categoría:', filenameWithCategoryResponse.data.error);
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // 3. Obtener imagen por clave específica (usando URL encoding)
    console.log('3️⃣ Probando obtener imagen por clave específica...');
    const imageKey = 'musikon-media/deposits/1754188088046-test_voucher.png';
    const encodedKey = encodeURIComponent(imageKey);
    
    const keyResponse = await axios.get(`${BASE_URL}/imgs/single/${encodedKey}/public`);
    
    if (keyResponse.data.success) {
      console.log('✅ Imagen encontrada por clave:');
      console.log(`   🔑 Clave: ${imageKey}`);
      console.log(`   📁 Nombre: ${keyResponse.data.image.filename}`);
      console.log(`   📊 Tamaño: ${keyResponse.data.image.size} bytes`);
      console.log(`   📂 Categoría: ${keyResponse.data.image.category}`);
    } else {
      console.log('❌ Error obteniendo imagen por clave:', keyResponse.data.error);
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // 4. Probar con una imagen que no existe
    console.log('4️⃣ Probando con una imagen que no existe...');
    try {
      const notFoundResponse = await axios.get(`${BASE_URL}/imgs/filename/imagen-que-no-existe.png/public`);
      console.log('❌ Debería haber devuelto 404');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Correcto: Imagen no encontrada (404)');
        console.log(`   📝 Mensaje: ${error.response.data.error}`);
      } else {
        console.log('❌ Error inesperado:', error.message);
      }
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // 5. Mostrar ejemplos de uso
    console.log('5️⃣ Ejemplos de uso de los endpoints:\n');
    
    console.log('📋 Para obtener imagen por nombre de archivo:');
    console.log(`   GET ${BASE_URL}/imgs/filename/{nombre_archivo}/public`);
    console.log(`   GET ${BASE_URL}/imgs/filename/{nombre_archivo}/public?category={categoria}\n`);
    
    console.log('📋 Para obtener imagen por clave específica:');
    console.log(`   GET ${BASE_URL}/imgs/single/{clave_codificada}/public`);
    console.log(`   Ejemplo: GET ${BASE_URL}/imgs/single/${encodeURIComponent('musikon-media/deposits/archivo.png')}/public\n`);
    
    console.log('📋 Endpoints con autenticación:');
    console.log(`   GET ${BASE_URL}/imgs/filename/{nombre_archivo} (requiere Authorization header)`);
    console.log(`   GET ${BASE_URL}/imgs/single/{clave_codificada} (requiere Authorization header)\n`);

    console.log('🎉 ¡Pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Ejecutar las pruebas
testSingleImageEndpoints(); 