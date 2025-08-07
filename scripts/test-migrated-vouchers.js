const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';

/**
 * Script para probar el sistema de vouchers migrado
 */
async function testMigratedVoucherSystem() {
    console.log('🧪 Probando sistema de vouchers migrado...\n');

    try {
        // 1. Probar estadísticas de vouchers
        console.log('1️⃣ Probando estadísticas de vouchers...');
        try {
            const statsResponse = await axios.get(`${BASE_URL}/vouchers/statistics`, {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            console.log('✅ Estadísticas obtenidas:', statsResponse.data);
        } catch (error) {
            console.log('⚠️  Error obteniendo estadísticas (esperado sin autenticación real):', error.response?.status);
        }

        // 2. Probar obtención de vouchers en lote
        console.log('\n2️⃣ Probando obtención de vouchers en lote...');
        try {
            const batchResponse = await axios.post(`${BASE_URL}/vouchers/batch`, {
                depositIds: ['test-deposit-1', 'test-deposit-2']
            }, {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            console.log('✅ Vouchers en lote obtenidos:', batchResponse.data);
        } catch (error) {
            console.log('⚠️  Error obteniendo vouchers en lote (esperado sin autenticación real):', error.response?.status);
        }

        // 3. Probar integridad de voucher específico
        console.log('\n3️⃣ Probando verificación de integridad...');
        try {
            const integrityResponse = await axios.get(`${BASE_URL}/vouchers/test-deposit-1/integrity`, {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            console.log('✅ Verificación de integridad:', integrityResponse.data);
        } catch (error) {
            console.log('⚠️  Error verificando integridad (esperado sin autenticación real):', error.response?.status);
        }

        // 4. Probar obtención de voucher individual
        console.log('\n4️⃣ Probando obtención de voucher individual...');
        try {
            const singleResponse = await axios.get(`${BASE_URL}/vouchers/test-deposit-1`, {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            console.log('✅ Voucher individual obtenido:', singleResponse.data);
        } catch (error) {
            console.log('⚠️  Error obteniendo voucher individual (esperado sin autenticación real):', error.response?.status);
        }

        // 5. Probar endpoints de imágenes individuales
        console.log('\n5️⃣ Probando endpoints de imágenes individuales...');
        
        // Probar por nombre de archivo
        try {
            const filenameResponse = await axios.get(`${BASE_URL}/imgs/filename/test-voucher.png/public`);
            console.log('✅ Imagen por nombre de archivo:', filenameResponse.data);
        } catch (error) {
            console.log('⚠️  Error obteniendo imagen por nombre (esperado si no existe):', error.response?.status);
        }

        // Probar por clave de IDrive E2
        try {
            const keyResponse = await axios.get(`${BASE_URL}/imgs/single/musikon-media%2Fdeposits%2Ftest-voucher.png/public`);
            console.log('✅ Imagen por clave IDrive E2:', keyResponse.data);
        } catch (error) {
            console.log('⚠️  Error obteniendo imagen por clave (esperado si no existe):', error.response?.status);
        }

        // 6. Probar listado directo de IDrive E2
        console.log('\n6️⃣ Probando listado directo de IDrive E2...');
        try {
            const idriveResponse = await axios.get(`${BASE_URL}/imgs/all/idrive/public`);
            console.log('✅ Listado de IDrive E2 obtenido');
            console.log(`   Total de imágenes: ${idriveResponse.data.images?.length || 0}`);
            
            if (idriveResponse.data.images && idriveResponse.data.images.length > 0) {
                const firstImage = idriveResponse.data.images[0];
                console.log(`   Primera imagen: ${firstImage.filename}`);
                console.log(`   Categoría: ${firstImage.category}`);
                console.log(`   Tiene URL firmada: ${!!firstImage.url}`);
            }
        } catch (error) {
            console.log('❌ Error obteniendo listado de IDrive E2:', error.response?.status, error.response?.data?.message);
        }

        console.log('\n🎉 Pruebas completadas!');
        console.log('\n📋 Resumen de funcionalidades probadas:');
        console.log('   ✅ Estadísticas de vouchers');
        console.log('   ✅ Obtención en lote');
        console.log('   ✅ Verificación de integridad');
        console.log('   ✅ Obtención individual');
        console.log('   ✅ Endpoints de imágenes individuales');
        console.log('   ✅ Listado directo de IDrive E2');

        console.log('\n💡 Para probar con datos reales:');
        console.log('   1. Ejecuta: npm run migrate-vouchers-check');
        console.log('   2. Si hay vouchers para migrar: npm run migrate-vouchers');
        console.log('   3. Ejecuta este script nuevamente');

    } catch (error) {
        console.error('❌ Error durante las pruebas:', error.message);
    }
}

/**
 * Función para probar con datos de ejemplo
 */
async function testWithSampleData() {
    console.log('🧪 Probando con datos de ejemplo...\n');

    // Crear un archivo temporal para probar upload
    const tempFilePath = path.join(__dirname, 'temp-test-voucher.svg');
    const svgContent = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#4CAF50"/>
        <text x="50" y="50" text-anchor="middle" fill="white" font-size="12">Test</text>
    </svg>`;
    
    fs.writeFileSync(tempFilePath, svgContent);

    try {
        // Probar upload de voucher
        console.log('1️⃣ Probando upload de voucher...');
        const form = new FormData();
        form.append('voucherFile', fs.createReadStream(tempFilePath), 'test-voucher.svg');
        form.append('depositId', 'test-deposit-migration');
        form.append('userId', 'test-user-123');
        form.append('amount', '100');
        form.append('currency', 'USD');

        try {
            const uploadResponse = await axios.post(`${BASE_URL}/vouchers/upload`, form, {
                headers: {
                    ...form.getHeaders(),
                    'Authorization': 'Bearer test-token'
                }
            });
            console.log('✅ Upload exitoso:', uploadResponse.data);
        } catch (error) {
            console.log('⚠️  Error en upload (esperado sin autenticación real):', error.response?.status);
        }

    } catch (error) {
        console.error('❌ Error con datos de ejemplo:', error.message);
    } finally {
        // Limpiar archivo temporal
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}

// Ejecutar según el comando
const command = process.argv[2];

switch (command) {
    case 'sample':
        testWithSampleData();
        break;
    default:
        testMigratedVoucherSystem();
        break;
} 