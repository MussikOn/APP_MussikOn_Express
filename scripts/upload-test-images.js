const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function uploadTestImages() {
  console.log('📤 Subiendo imágenes de prueba a IDrive E2...\n');

  try {
    // Crear algunas imágenes de prueba usando SVG
    const testImages = [
      {
        name: 'profile-test-1.svg',
        content: `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="200" fill="#4CAF50"/>
          <text x="150" y="100" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">Profile Test 1</text>
          <circle cx="150" cy="70" r="20" fill="white" opacity="0.3"/>
        </svg>`,
        category: 'profile'
      },
      {
        name: 'event-test-1.svg',
        content: `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="200" fill="#2196F3"/>
          <text x="150" y="100" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">Event Test 1</text>
          <rect x="120" y="60" width="60" height="20" fill="white" opacity="0.3"/>
        </svg>`,
        category: 'event'
      },
      {
        name: 'voucher-test-1.svg',
        content: `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="200" fill="#FF9800"/>
          <text x="150" y="100" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">Voucher Test 1</text>
          <polygon points="150,60 160,80 140,80" fill="white" opacity="0.3"/>
        </svg>`,
        category: 'voucher'
      }
    ];

    console.log(`📝 Preparando ${testImages.length} imágenes de prueba...`);

    // Subir cada imagen
    for (const image of testImages) {
      try {
        console.log(`\n📤 Subiendo: ${image.name}`);
        
        // Crear FormData para la subida
        const FormData = require('form-data');
        const form = new FormData();
        
        // Crear un buffer con el contenido SVG
        const buffer = Buffer.from(image.content, 'utf8');
        form.append('file', buffer, {
          filename: image.name,
          contentType: 'image/svg+xml',
          knownLength: buffer.length
        });
        
        form.append('folder', 'test-images');
        form.append('description', `Imagen de prueba - ${image.category}`);
        form.append('tags', `test,${image.category},demo`);

        // Subir imagen usando endpoint público
        const uploadResponse = await axios.post('http://localhost:3001/imgs/upload/public', form, {
          headers: {
            ...form.getHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        });

        if (uploadResponse.data.success) {
          console.log(`   ✅ ${image.name} subida exitosamente`);
          console.log(`   📍 URL: ${uploadResponse.data.data.url}`);
          console.log(`   📊 Tamaño: ${uploadResponse.data.data.size} bytes`);
        } else {
          console.log(`   ❌ Error subiendo ${image.name}: ${uploadResponse.data.error}`);
        }

      } catch (uploadError) {
        console.log(`   ❌ Error subiendo ${image.name}: ${uploadError.message}`);
        
        if (uploadError.response) {
          console.log(`      Status: ${uploadError.response.status}`);
          console.log(`      Data: ${JSON.stringify(uploadError.response.data)}`);
        }
      }
    }

    console.log('\n🎯 Subida de imágenes de prueba completada.');
    console.log('💡 Ahora puedes probar el panel de administración para ver las imágenes reales de IDrive E2.');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

uploadTestImages(); 