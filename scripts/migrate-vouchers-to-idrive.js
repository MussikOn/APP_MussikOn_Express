const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Configurar Firebase Admin
const serviceAccountPath = path.join(process.cwd(), 'mus1k0n-firebase-adminsdk-fbsvc-d6e712e084.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Error: No se encontró el archivo de credenciales de Firebase');
    console.error(`Ruta esperada: ${serviceAccountPath}`);
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

/**
 * Script de migración para convertir vouchers existentes
 * de URLs directas a referencias de IDrive E2
 */
async function migrateVouchersToIDrive() {
    console.log('🚀 Iniciando migración de vouchers a IDrive E2...');
    
    try {
        // Obtener todos los depósitos con vouchers
        const depositsSnapshot = await db.collection('userDeposits')
            .where('voucherFile', '!=', null)
            .get();

        if (depositsSnapshot.empty) {
            console.log('✅ No se encontraron depósitos con vouchers para migrar');
            return;
        }

        console.log(`📊 Encontrados ${depositsSnapshot.size} depósitos con vouchers`);

        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const doc of depositsSnapshot.docs) {
            const deposit = doc.data();
            const depositId = doc.id;

            try {
                // Verificar si ya está migrado
                if (deposit.voucherFile && deposit.voucherFile.idriveKey) {
                    console.log(`⏭️  Depósito ${depositId} ya migrado, saltando...`);
                    skippedCount++;
                    continue;
                }

                // Verificar si tiene URL directa
                if (!deposit.voucherFile || !deposit.voucherFile.url) {
                    console.log(`⚠️  Depósito ${depositId} no tiene URL de voucher, saltando...`);
                    skippedCount++;
                    continue;
                }

                console.log(`🔄 Migrando depósito ${depositId}...`);

                // Extraer la clave de IDrive E2 de la URL
                const url = deposit.voucherFile.url;
                let idriveKey = null;

                // Patrones comunes de URLs de IDrive E2
                if (url.includes('musikon-media.c8q1.va03.idrivee2-84.com')) {
                    // URL directa de IDrive E2
                    const urlParts = url.split('/');
                    const keyIndex = urlParts.findIndex(part => part === 'musikon-media');
                    if (keyIndex !== -1) {
                        idriveKey = urlParts.slice(keyIndex).join('/');
                    }
                } else if (url.includes('musikon-media/')) {
                    // URL que contiene la estructura de carpetas
                    const match = url.match(/musikon-media\/[^?]+/);
                    if (match) {
                        idriveKey = match[0];
                    }
                }

                if (!idriveKey) {
                    console.log(`❌ No se pudo extraer la clave de IDrive E2 de la URL: ${url}`);
                    errorCount++;
                    continue;
                }

                // Actualizar el documento con la nueva estructura
                await doc.ref.update({
                    'voucherFile.idriveKey': idriveKey,
                    'voucherFile.filename': deposit.voucherFile.filename || 'voucher.jpg',
                    'voucherFile.uploadedAt': deposit.voucherFile.uploadedAt || new Date().toISOString(),
                    'updatedAt': new Date().toISOString()
                });

                // Remover la URL directa (opcional - comentar si quieres mantenerla)
                // await doc.ref.update({
                //     'voucherFile.url': admin.firestore.FieldValue.delete()
                // });

                console.log(`✅ Depósito ${depositId} migrado exitosamente`);
                console.log(`   URL original: ${url}`);
                console.log(`   Nueva clave: ${idriveKey}`);
                migratedCount++;

            } catch (error) {
                console.error(`❌ Error migrando depósito ${depositId}:`, error.message);
                errorCount++;
            }
        }

        // Resumen final
        console.log('\n📋 Resumen de migración:');
        console.log(`✅ Migrados: ${migratedCount}`);
        console.log(`⏭️  Saltados: ${skippedCount}`);
        console.log(`❌ Errores: ${errorCount}`);
        console.log(`📊 Total procesados: ${depositsSnapshot.size}`);

        if (migratedCount > 0) {
            console.log('\n🎉 Migración completada exitosamente!');
            console.log('💡 Los vouchers ahora usan referencias de IDrive E2 en lugar de URLs directas');
            console.log('🔗 Para obtener las imágenes, usa los nuevos endpoints:');
            console.log('   - GET /vouchers/:depositId');
            console.log('   - POST /vouchers/batch');
        }

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

/**
 * Función para verificar el estado de la migración
 */
async function checkMigrationStatus() {
    console.log('🔍 Verificando estado de migración...');
    
    try {
        const depositsSnapshot = await db.collection('userDeposits')
            .where('voucherFile', '!=', null)
            .get();

        if (depositsSnapshot.empty) {
            console.log('✅ No hay depósitos con vouchers');
            return;
        }

        let withIDriveKey = 0;
        let withDirectUrl = 0;
        let withBoth = 0;

        for (const doc of depositsSnapshot.docs) {
            const deposit = doc.data();
            const hasIDriveKey = deposit.voucherFile && deposit.voucherFile.idriveKey;
            const hasDirectUrl = deposit.voucherFile && deposit.voucherFile.url;

            if (hasIDriveKey && hasDirectUrl) {
                withBoth++;
            } else if (hasIDriveKey) {
                withIDriveKey++;
            } else if (hasDirectUrl) {
                withDirectUrl++;
            }
        }

        console.log(`📊 Total de depósitos con vouchers: ${depositsSnapshot.size}`);
        console.log(`✅ Con clave IDrive E2: ${withIDriveKey}`);
        console.log(`🔗 Con URL directa: ${withDirectUrl}`);
        console.log(`🔄 Con ambos: ${withBoth}`);

        if (withDirectUrl > 0) {
            console.log('\n⚠️  Aún hay depósitos que necesitan migración');
            console.log('💡 Ejecuta: node scripts/migrate-vouchers-to-idrive.js migrate');
        } else {
            console.log('\n🎉 Todos los vouchers están migrados!');
        }

    } catch (error) {
        console.error('❌ Error verificando estado:', error);
    }
}

// Ejecutar según el comando
const command = process.argv[2];

switch (command) {
    case 'migrate':
        migrateVouchersToIDrive();
        break;
    case 'check':
        checkMigrationStatus();
        break;
    default:
        console.log('📖 Uso del script de migración:');
        console.log('   node scripts/migrate-vouchers-to-idrive.js migrate  - Ejecutar migración');
        console.log('   node scripts/migrate-vouchers-to-idrive.js check    - Verificar estado');
        console.log('\n💡 Ejecuta "check" primero para ver el estado actual');
        break;
} 