# 📚 Documentación de MussikOn API

## 🎯 Descripción General

MussikOn es una plataforma completa que conecta músicos con organizadores de eventos, proporcionando un ecosistema integral para la gestión de eventos musicales, pagos, comunicación y administración.

## 🏗️ Arquitectura del Sistema

### Tecnologías Principales
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Auth + JWT
- **Almacenamiento**: IDrive E2 (S3-compatible)
- **Pagos**: Stripe
- **Notificaciones**: Expo Push Notifications
- **Tiempo Real**: Socket.IO

### Estructura del Proyecto
```
src/
├── controllers/     # Controladores de la API
├── services/        # Lógica de negocio
├── routes/          # Definición de rutas
├── middleware/      # Middlewares personalizados
├── models/          # Modelos de datos
├── types/           # Tipos TypeScript
├── utils/           # Utilidades y helpers
├── sockets/         # Manejo de WebSockets
└── __tests__/       # Tests unitarios e integración
```

## 📖 Guía de Navegación

### 🚀 [Inicio Rápido](./getting-started/README.md)
- Instalación y configuración
- Primeros pasos
- Configuración del entorno

### 🔧 [Desarrollo](./development/README.md)
- Guías de desarrollo
- Estándares de código
- Testing y debugging
- Optimización de rendimiento

### 🏢 [Sistema de Administración](./admin-system/README.md)
- Panel de administración
- Gestión de usuarios
- Moderación de contenido
- Analytics y reportes

### 💳 [Sistema de Pagos](./payment-system/README.md)
- Integración con Stripe
- Gestión de transacciones
- Vouchers y reembolsos
- Reportes financieros

### 🎵 [Gestión de Músicos](./musician-management/README.md)
- Perfiles de músicos
- Búsqueda inteligente
- Calificaciones y reviews
- Gestión de disponibilidad

### 📅 [Gestión de Eventos](./event-management/README.md)
- Creación y gestión de eventos
- Calendario y conflictos
- Contratación de músicos
- Notificaciones

### 💬 [Sistema de Chat](./chat-system/README.md)
- Chat en tiempo real
- Notificaciones push
- Gestión de conversaciones
- Integración con eventos

### 🖼️ [Sistema de Imágenes](./image-system/README.md)
- Almacenamiento en IDrive E2
- Optimización de imágenes
- URLs firmadas
- Gestión de vouchers

### 🔍 [Búsqueda Avanzada](./search-system/README.md)
- Algoritmos de búsqueda
- Filtros y geolocalización
- Optimización de consultas
- Índices de Firestore

### 🔐 [Seguridad](./security/README.md)
- Autenticación y autorización
- Validación de datos
- Protección de endpoints
- Auditoría de seguridad

### 🚀 [Despliegue](./deployment/README.md)
- Configuración de Firebase
- Despliegue en producción
- Monitoreo y logs
- Backup y recuperación

### 📱 [Integración Móvil](./mobile-integration/README.md)
- API para aplicaciones móviles
- Push notifications
- Sincronización offline
- Optimización de rendimiento

### 🧪 [Testing](./testing/README.md)
- Tests unitarios
- Tests de integración
- Tests de rendimiento
   - Automatización de tests

### 🔧 [Troubleshooting](./troubleshooting/README.md)
- Problemas comunes
- Soluciones y workarounds
- Logs y debugging
- Contacto de soporte

## 📊 Estado del Proyecto

### ✅ Funcionalidades Implementadas
- [x] Sistema de autenticación completo
- [x] Gestión de perfiles de músicos
- [x] Sistema de eventos y calendario
- [x] Chat en tiempo real
- [x] Sistema de pagos con Stripe
- [x] Búsqueda avanzada de músicos
- [x] Sistema de imágenes con IDrive E2
- [x] Panel de administración
- [x] Notificaciones push
- [x] Sistema de calificaciones

### 🚧 En Desarrollo
- [ ] Optimizaciones de rendimiento
- [ ] Mejoras en la búsqueda
- [ ] Analytics avanzados
- [ ] Integración con redes sociales

### 📋 Próximas Funcionalidades
- [ ] Sistema de recomendaciones
- [ ] Integración con calendarios externos
- [ ] API pública para desarrolladores
- [ ] Sistema de afiliados

## 🤝 Contribución

Para contribuir al proyecto, consulta la [Guía de Contribución](./development/contribution-guide.md).

## 📞 Soporte

- **Email**: soporte@mussikon.com
- **Documentación**: Esta guía
- **Issues**: [GitHub Issues](https://github.com/MussikOn/APP_MussikOn_Express/issues)

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](../LICENSE) para más detalles.

---

**Última actualización**: Diciembre 2024  
**Versión**: 1.0.0  
**Mantenedor**: Equipo de Desarrollo MussikOn 