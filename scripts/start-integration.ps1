# Script para iniciar la integración entre Backend y Sistema de Administración
# MussikOn Payment System Integration

Write-Host "🚀 Iniciando integración del Sistema de Pagos MussikOn..." -ForegroundColor Blue
Write-Host "=" * 60 -ForegroundColor Blue

# Función para verificar si un puerto está en uso
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Función para esperar a que un servicio esté disponible
function Wait-ForService {
    param([string]$Url, [string]$ServiceName, [int]$Timeout = 30)
    
    Write-Host "⏳ Esperando a que $ServiceName esté disponible..." -ForegroundColor Yellow
    
    $startTime = Get-Date
    do {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $ServiceName está listo!" -ForegroundColor Green
                return $true
            }
        }
        catch {
            $elapsed = (Get-Date) - $startTime
            if ($elapsed.TotalSeconds -gt $Timeout) {
                Write-Host "❌ Timeout esperando $ServiceName" -ForegroundColor Red
                return $false
            }
            Start-Sleep -Seconds 2
        }
    } while ($true)
}

# Verificar si el backend está ejecutándose
Write-Host "🔍 Verificando estado del Backend..." -ForegroundColor Blue
if (Test-Port -Port 5001) {
    Write-Host "✅ Backend ya está ejecutándose en puerto 5001" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend no está ejecutándose" -ForegroundColor Yellow
    Write-Host "💡 Ejecuta 'npm start' en el directorio del backend" -ForegroundColor Cyan
}

# Verificar si el sistema de administración está ejecutándose
Write-Host "🔍 Verificando estado del Sistema de Administración..." -ForegroundColor Blue
if (Test-Port -Port 3000) {
    Write-Host "✅ Sistema de administración ya está ejecutándose en puerto 3000" -ForegroundColor Green
} else {
    Write-Host "⚠️  Sistema de administración no está ejecutándose" -ForegroundColor Yellow
    Write-Host "💡 Ejecuta 'npm run dev' en el directorio del admin system" -ForegroundColor Cyan
}

Write-Host "`n📋 URLs de los servicios:" -ForegroundColor Blue
Write-Host "• Backend: http://localhost:5001" -ForegroundColor Green
Write-Host "• Admin System: http://localhost:3000" -ForegroundColor Green
Write-Host "• API Docs: http://localhost:5001/api-docs" -ForegroundColor Green

Write-Host "`n🔗 Endpoints de pagos disponibles:" -ForegroundColor Blue
Write-Host "• GET /admin/payments/pending-deposits" -ForegroundColor Cyan
Write-Host "• PUT /admin/payments/verify-deposit/:id" -ForegroundColor Cyan
Write-Host "• GET /admin/payments/statistics" -ForegroundColor Cyan
Write-Host "• GET /admin/payments/deposit-stats" -ForegroundColor Cyan

Write-Host "`n🖼️  Endpoints de imágenes disponibles:" -ForegroundColor Blue
Write-Host "• GET /imgs" -ForegroundColor Cyan
Write-Host "• POST /imgs/upload" -ForegroundColor Cyan
Write-Host "• GET /imgs/stats" -ForegroundColor Cyan

Write-Host "`n🧪 Para ejecutar pruebas de integración:" -ForegroundColor Blue
Write-Host "• npm run test-integration" -ForegroundColor Cyan

Write-Host "`n" + "=" * 60 -ForegroundColor Blue
Write-Host "🎉 Configuración de integración completada!" -ForegroundColor Green
Write-Host "`n💡 Próximos pasos:" -ForegroundColor Blue
Write-Host "1. Inicia el backend: npm start" -ForegroundColor White
Write-Host "2. Inicia el admin system: npm run dev" -ForegroundColor White
Write-Host "3. Ejecuta las pruebas: npm run test-integration" -ForegroundColor White
Write-Host "4. Accede al admin system en http://localhost:3000" -ForegroundColor White

Write-Host "`n📚 Documentación disponible en:" -ForegroundColor Blue
Write-Host "• docs/payment-system/INDEX.md" -ForegroundColor Cyan
Write-Host "• docs/payment-system/API_ENDPOINTS.md" -ForegroundColor Cyan
Write-Host "• docs/payment-system/TROUBLESHOOTING.md" -ForegroundColor Cyan 