#!/usr/bin/env node

/**
 * Script de prueba para el Sistema de Pagos de Mussikon
 * 
 * Este script verifica que todos los componentes del sistema de pagos
 * estén funcionando correctamente.
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuración
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN;
const TEST_ADMIN_TOKEN = process.env.TEST_ADMIN_TOKEN;

// Colores para console.log
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

class PaymentSystemTester {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async testEndpoint(method, endpoint, data = null, token = null) {
    try {
      const config = {
        method,
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || error.message,
        status: error.response?.status 
      };
    }
  }

  async testImageUpload() {
    this.log('\n🔍 Probando subida de imagen...', 'blue');
    
    // Crear un archivo de prueba
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    const testImageBuffer = Buffer.from('fake-image-data');
    fs.writeFileSync(testImagePath, testImageBuffer);

    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testImagePath));
      formData.append('folder', 'test');
      formData.append('description', 'Imagen de prueba');

      const response = await axios.post(`${API_BASE_URL}/images/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${TEST_USER_TOKEN}`
        }
      });

      if (response.data.success) {
        this.log('✅ Subida de imagen exitosa', 'green');
        this.results.push('Image Upload: PASS');
        return response.data.data;
      } else {
        this.log('❌ Error en subida de imagen', 'red');
        this.errors.push('Image Upload: FAIL');
        return null;
      }
    } catch (error) {
      this.log(`❌ Error en subida de imagen: ${error.message}`, 'red');
      this.errors.push('Image Upload: FAIL');
      return null;
    } finally {
      // Limpiar archivo de prueba
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    }
  }

  async testDepositUpload(imageData) {
    this.log('\n🔍 Probando subida de depósito...', 'blue');
    
    const depositData = {
      amount: 1000,
      accountHolderName: 'Usuario de Prueba',
      bankName: 'Banco de Prueba',
      depositDate: '2024-01-15',
      depositTime: '14:30',
      referenceNumber: 'TEST123456',
      comments: 'Depósito de prueba'
    };

    try {
      const formData = new FormData();
      formData.append('voucherFile', Buffer.from('fake-voucher-data'), 'voucher.jpg');
      formData.append('amount', depositData.amount);
      formData.append('accountHolderName', depositData.accountHolderName);
      formData.append('bankName', depositData.bankName);
      formData.append('depositDate', depositData.depositDate);
      formData.append('depositTime', depositData.depositTime);
      formData.append('referenceNumber', depositData.referenceNumber);
      formData.append('comments', depositData.comments);

      const response = await axios.post(`${API_BASE_URL}/payments/deposit`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${TEST_USER_TOKEN}`
        }
      });

      if (response.data.success) {
        this.log('✅ Subida de depósito exitosa', 'green');
        this.results.push('Deposit Upload: PASS');
        return response.data.data;
      } else {
        this.log('❌ Error en subida de depósito', 'red');
        this.errors.push('Deposit Upload: FAIL');
        return null;
      }
    } catch (error) {
      this.log(`❌ Error en subida de depósito: ${error.message}`, 'red');
      this.errors.push('Deposit Upload: FAIL');
      return null;
    }
  }

  async testGetUserBalance() {
    this.log('\n🔍 Probando obtención de balance...', 'blue');
    
    const result = await this.testEndpoint('GET', '/payments/my-balance', null, TEST_USER_TOKEN);
    
    if (result.success) {
      this.log('✅ Obtención de balance exitosa', 'green');
      this.results.push('Get Balance: PASS');
      return result.data;
    } else {
      this.log(`❌ Error obteniendo balance: ${result.error}`, 'red');
      this.errors.push('Get Balance: FAIL');
      return null;
    }
  }

  async testGetUserDeposits() {
    this.log('\n🔍 Probando obtención de depósitos...', 'blue');
    
    const result = await this.testEndpoint('GET', '/payments/my-deposits', null, TEST_USER_TOKEN);
    
    if (result.success) {
      this.log('✅ Obtención de depósitos exitosa', 'green');
      this.results.push('Get Deposits: PASS');
      return result.data;
    } else {
      this.log(`❌ Error obteniendo depósitos: ${result.error}`, 'red');
      this.errors.push('Get Deposits: FAIL');
      return null;
    }
  }

  async testGetPendingDeposits() {
    this.log('\n🔍 Probando obtención de depósitos pendientes (admin)...', 'blue');
    
    const result = await this.testEndpoint('GET', '/admin/payments/pending-deposits', null, TEST_ADMIN_TOKEN);
    
    if (result.success) {
      this.log('✅ Obtención de depósitos pendientes exitosa', 'green');
      this.results.push('Get Pending Deposits: PASS');
      return result.data;
    } else {
      this.log(`❌ Error obteniendo depósitos pendientes: ${result.error}`, 'red');
      this.errors.push('Get Pending Deposits: FAIL');
      return null;
    }
  }

  async testGetPaymentStatistics() {
    this.log('\n🔍 Probando obtención de estadísticas...', 'blue');
    
    const result = await this.testEndpoint('GET', '/admin/payments/statistics', null, TEST_ADMIN_TOKEN);
    
    if (result.success) {
      this.log('✅ Obtención de estadísticas exitosa', 'green');
      this.results.push('Get Statistics: PASS');
      return result.data;
    } else {
      this.log(`❌ Error obteniendo estadísticas: ${result.error}`, 'red');
      this.errors.push('Get Statistics: FAIL');
      return null;
    }
  }

  async testImageValidation() {
    this.log('\n🔍 Probando validación de imagen...', 'blue');
    
    try {
      const formData = new FormData();
      formData.append('file', Buffer.from('fake-image-data'), 'test.jpg');

      const response = await axios.post(`${API_BASE_URL}/images/validate`, formData, {
        headers: {
          ...formData.getHeaders()
        }
      });

      if (response.data.success) {
        this.log('✅ Validación de imagen exitosa', 'green');
        this.results.push('Image Validation: PASS');
        return response.data;
      } else {
        this.log('❌ Error en validación de imagen', 'red');
        this.errors.push('Image Validation: FAIL');
        return null;
      }
    } catch (error) {
      this.log(`❌ Error en validación de imagen: ${error.message}`, 'red');
      this.errors.push('Image Validation: FAIL');
      return null;
    }
  }

  async testImageIntegrity() {
    this.log('\n🔍 Probando verificación de integridad de imagen...', 'blue');
    
    // Primero subir una imagen
    const imageData = await this.testImageUpload();
    if (!imageData) {
      this.log('❌ No se pudo subir imagen para probar integridad', 'red');
      return;
    }

    const result = await this.testEndpoint('GET', `/images/${imageData.filename}/integrity`);
    
    if (result.success) {
      this.log('✅ Verificación de integridad exitosa', 'green');
      this.results.push('Image Integrity: PASS');
      return result.data;
    } else {
      this.log(`❌ Error verificando integridad: ${result.error}`, 'red');
      this.errors.push('Image Integrity: FAIL');
      return null;
    }
  }

  async testBankAccountRegistration() {
    this.log('\n🔍 Probando registro de cuenta bancaria...', 'blue');
    
    const bankAccountData = {
      accountHolder: 'Usuario de Prueba',
      accountNumber: '1234567890',
      bankName: 'Banco de Prueba',
      accountType: 'savings',
      routingNumber: '123456789'
    };

    const result = await this.testEndpoint('POST', '/bank-accounts/register', bankAccountData, TEST_USER_TOKEN);
    
    if (result.success) {
      this.log('✅ Registro de cuenta bancaria exitoso', 'green');
      this.results.push('Bank Account Registration: PASS');
      return result.data;
    } else {
      this.log(`❌ Error registrando cuenta bancaria: ${result.error}`, 'red');
      this.errors.push('Bank Account Registration: FAIL');
      return null;
    }
  }

  async testGetUserBankAccounts() {
    this.log('\n🔍 Probando obtención de cuentas bancarias...', 'blue');
    
    const result = await this.testEndpoint('GET', '/bank-accounts/my-accounts', null, TEST_USER_TOKEN);
    
    if (result.success) {
      this.log('✅ Obtención de cuentas bancarias exitosa', 'green');
      this.results.push('Get Bank Accounts: PASS');
      return result.data;
    } else {
      this.log(`❌ Error obteniendo cuentas bancarias: ${result.error}`, 'red');
      this.errors.push('Get Bank Accounts: FAIL');
      return null;
    }
  }

  async runAllTests() {
    this.log('\n🚀 Iniciando pruebas del Sistema de Pagos de Mussikon', 'blue');
    this.log('=' * 60, 'blue');

    // Verificar tokens
    if (!TEST_USER_TOKEN || !TEST_ADMIN_TOKEN) {
      this.log('❌ Tokens de prueba no configurados', 'red');
      this.log('Configura TEST_USER_TOKEN y TEST_ADMIN_TOKEN en las variables de entorno', 'yellow');
      return;
    }

    // Ejecutar pruebas
    await this.testImageValidation();
    await this.testImageUpload();
    await this.testImageIntegrity();
    await this.testBankAccountRegistration();
    await this.testGetUserBankAccounts();
    await this.testGetUserBalance();
    await this.testDepositUpload();
    await this.testGetUserDeposits();
    await this.testGetPendingDeposits();
    await this.testGetPaymentStatistics();

    // Mostrar resultados
    this.showResults();
  }

  showResults() {
    this.log('\n📊 RESULTADOS DE LAS PRUEBAS', 'blue');
    this.log('=' * 40, 'blue');

    this.log(`\n✅ Pruebas exitosas: ${this.results.length}`, 'green');
    this.results.forEach(result => {
      this.log(`  ✓ ${result}`, 'green');
    });

    if (this.errors.length > 0) {
      this.log(`\n❌ Pruebas fallidas: ${this.errors.length}`, 'red');
      this.errors.forEach(error => {
        this.log(`  ✗ ${error}`, 'red');
      });
    }

    const totalTests = this.results.length + this.errors.length;
    const successRate = ((this.results.length / totalTests) * 100).toFixed(1);

    this.log(`\n📈 Tasa de éxito: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');

    if (this.errors.length === 0) {
      this.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!', 'green');
    } else {
      this.log('\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.', 'yellow');
    }
  }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
  const tester = new PaymentSystemTester();
  tester.runAllTests().catch(error => {
    console.error('Error ejecutando pruebas:', error);
    process.exit(1);
  });
}

module.exports = PaymentSystemTester; 