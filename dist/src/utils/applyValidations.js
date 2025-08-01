"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyAuthValidations = applyAuthValidations;
exports.applyEventValidations = applyEventValidations;
exports.applyMusicianRequestValidations = applyMusicianRequestValidations;
exports.applyChatValidations = applyChatValidations;
exports.applyPaymentValidations = applyPaymentValidations;
exports.applySearchValidations = applySearchValidations;
exports.applyGeolocationValidations = applyGeolocationValidations;
exports.applyAdminValidations = applyAdminValidations;
exports.applyPushNotificationValidations = applyPushNotificationValidations;
exports.applyAnalyticsValidations = applyAnalyticsValidations;
exports.applyImageValidations = applyImageValidations;
exports.applySuperAdminValidations = applySuperAdminValidations;
exports.applyAllValidations = applyAllValidations;
exports.applyValidationToRoute = applyValidationToRoute;
exports.createCommonValidations = createCommonValidations;
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const validationSchemas_1 = require("./validationSchemas");
/**
 * Aplica validaciones a las rutas de autenticación
 */
function applyAuthValidations(router) {
    // Registro
    router.post('/register', (0, validationMiddleware_1.validate)(validationSchemas_1.registerSchema));
    router.post('/email-register', (0, validationMiddleware_1.validate)(validationSchemas_1.registerSchema));
    // Login
    router.post('/login', (0, validationMiddleware_1.validate)(validationSchemas_1.loginSchema));
    // Actualización de usuario
    router.put('/update/:userEmail', validationMiddleware_1.validateId, (0, validationMiddleware_1.validate)(validationSchemas_1.updateUserSchema));
    // Validación de número
    router.get('/validate-number/:userEmail', validationMiddleware_1.validateId);
    // Agregar evento a usuario
    router.post('/add-event/:userEmail', validationMiddleware_1.validateId);
    // Eliminar usuario
    router.delete('/delete/:userEmail', validationMiddleware_1.validateId);
}
/**
 * Aplica validaciones a las rutas de eventos
 */
function applyEventValidations(router) {
    // Crear evento
    router.post('/', (0, validationMiddleware_1.validate)(validationSchemas_1.createEventSchema));
    // Obtener eventos con paginación
    router.get('/', validationMiddleware_1.validatePagination);
    // Obtener evento por ID
    router.get('/:id', validationMiddleware_1.validateId);
    // Actualizar evento
    router.put('/:id', validationMiddleware_1.validateId, (0, validationMiddleware_1.validate)(validationSchemas_1.updateEventSchema));
    // Eliminar evento
    router.delete('/:id', validationMiddleware_1.validateId);
    // Buscar eventos
    router.get('/search', validationMiddleware_1.validateSearchQuery, (0, validationMiddleware_1.validate)(validationSchemas_1.searchEventsSchema, 'query'));
    // Eventos cercanos
    router.get('/nearby', validationMiddleware_1.validateCoordinates);
    // Eventos por fecha
    router.get('/by-date', validationMiddleware_1.validateDateRange);
    // Eventos por presupuesto
    router.get('/by-budget', validationMiddleware_1.validatePriceRange);
    // Subir imagen de evento
    router.post('/:id/image', validationMiddleware_1.validateId, (0, validationMiddleware_1.validateFile)(['image/jpeg', 'image/png', 'image/gif', 'image/webp'], 10 * 1024 * 1024));
}
/**
 * Aplica validaciones a las rutas de solicitudes de músicos
 */
function applyMusicianRequestValidations(router) {
    // Crear solicitud
    router.post('/', (0, validationMiddleware_1.validate)(validationSchemas_1.createMusicianRequestSchema));
    // Obtener solicitudes con paginación
    router.get('/', validationMiddleware_1.validatePagination);
    // Obtener solicitud por ID
    router.get('/:id', validationMiddleware_1.validateId);
    // Actualizar solicitud
    router.put('/:id', validationMiddleware_1.validateId, (0, validationMiddleware_1.validate)(validationSchemas_1.updateMusicianRequestSchema));
    // Eliminar solicitud
    router.delete('/:id', validationMiddleware_1.validateId);
    // Solicitudes por evento
    router.get('/event/:eventId', validationMiddleware_1.validateId);
    // Solicitudes por músico
    router.get('/musician/:musicianId', validationMiddleware_1.validateId);
    // Solicitudes por estado
    router.get('/status/:status', validationMiddleware_1.validateId);
}
/**
 * Aplica validaciones a las rutas de chat
 */
function applyChatValidations(router) {
    // Enviar mensaje
    router.post('/messages', (0, validationMiddleware_1.validate)(validationSchemas_1.sendMessageSchema));
    // Crear conversación
    router.post('/conversations', (0, validationMiddleware_1.validate)(validationSchemas_1.createConversationSchema));
    // Obtener conversaciones con paginación
    router.get('/conversations', validationMiddleware_1.validatePagination);
    // Obtener conversación por ID
    router.get('/conversations/:id', validationMiddleware_1.validateId);
    // Obtener mensajes con paginación
    router.get('/conversations/:id/messages', validationMiddleware_1.validateId, validationMiddleware_1.validatePagination);
    // Eliminar conversación
    router.delete('/conversations/:id', validationMiddleware_1.validateId);
    // Subir archivo de chat
    router.post('/conversations/:id/upload', validationMiddleware_1.validateId, (0, validationMiddleware_1.validateFile)(['image/jpeg', 'image/png', 'audio/mpeg', 'audio/wav'], 5 * 1024 * 1024));
}
/**
 * Aplica validaciones a las rutas de pagos
 */
function applyPaymentValidations(router) {
    // Crear método de pago
    router.post('/payment-methods', (0, validationMiddleware_1.validate)(validationSchemas_1.createPaymentMethodSchema));
    // Obtener métodos de pago
    router.get('/payment-methods', validationMiddleware_1.validatePagination);
    // Eliminar método de pago
    router.delete('/payment-methods/:id', validationMiddleware_1.validateId);
    // Crear intento de pago
    router.post('/payment-intents', (0, validationMiddleware_1.validate)(validationSchemas_1.createPaymentIntentSchema));
    // Procesar pago
    router.post('/process-payment', (0, validationMiddleware_1.validate)(validationSchemas_1.createPaymentIntentSchema));
    // Crear factura
    router.post('/invoices', (0, validationMiddleware_1.validate)(validationSchemas_1.createInvoiceSchema));
    // Obtener facturas con paginación
    router.get('/invoices', validationMiddleware_1.validatePagination);
    // Obtener factura por ID
    router.get('/invoices/:id', validationMiddleware_1.validateId);
    // Reembolsos
    router.post('/refunds', (0, validationMiddleware_1.validate)(validationSchemas_1.createPaymentIntentSchema));
    // Validar método de pago
    router.post('/validate-payment-method', (0, validationMiddleware_1.validate)(validationSchemas_1.createPaymentMethodSchema));
}
/**
 * Aplica validaciones a las rutas de búsqueda
 */
function applySearchValidations(router) {
    // Búsqueda de eventos
    router.get('/events', validationMiddleware_1.validateSearchQuery, (0, validationMiddleware_1.validate)(validationSchemas_1.searchEventsSchema, 'query'));
    // Búsqueda de músicos
    router.get('/musicians', validationMiddleware_1.validateSearchQuery);
    // Búsqueda de usuarios
    router.get('/users', validationMiddleware_1.validateSearchQuery);
    // Búsqueda por ubicación
    router.get('/nearby', validationMiddleware_1.validateCoordinates);
    // Búsqueda por fecha
    router.get('/by-date', validationMiddleware_1.validateDateRange);
    // Búsqueda por presupuesto
    router.get('/by-budget', validationMiddleware_1.validatePriceRange);
    // Búsqueda avanzada
    router.get('/advanced', validationMiddleware_1.validateSearchQuery, (0, validationMiddleware_1.validate)(validationSchemas_1.searchEventsSchema, 'query'), validationMiddleware_1.validateCoordinates, validationMiddleware_1.validateDateRange, validationMiddleware_1.validatePriceRange);
}
/**
 * Aplica validaciones a las rutas de geolocalización
 */
function applyGeolocationValidations(router) {
    // Obtener coordenadas
    router.get('/coordinates', (0, validationMiddleware_1.validate)(validationSchemas_1.coordinatesSchema, 'query'));
    // Geocodificar dirección
    router.post('/geocode', (0, validationMiddleware_1.validate)(validationSchemas_1.geocodeAddressSchema));
    // Geocodificación inversa
    router.post('/reverse-geocode', (0, validationMiddleware_1.validate)(validationSchemas_1.coordinatesSchema));
    // Calcular distancia
    router.post('/distance', (0, validationMiddleware_1.validate)(validationSchemas_1.coordinatesSchema));
    // Verificar si está dentro del radio
    router.post('/within-radius', (0, validationMiddleware_1.validate)(validationSchemas_1.coordinatesSchema));
    // Optimizar ruta
    router.post('/optimize-route', (0, validationMiddleware_1.validate)(validationSchemas_1.optimizeRouteSchema));
    // Obtener direcciones
    router.get('/directions', validationMiddleware_1.validateCoordinates);
}
/**
 * Aplica validaciones a las rutas de administración
 */
function applyAdminValidations(router) {
    // Crear administrador
    router.post('/admins', (0, validationMiddleware_1.validate)(validationSchemas_1.createAdminSchema));
    // Obtener administradores con paginación
    router.get('/admins', validationMiddleware_1.validatePagination);
    // Obtener administrador por ID
    router.get('/admins/:id', validationMiddleware_1.validateId);
    // Actualizar administrador
    router.put('/admins/:id', validationMiddleware_1.validateId, (0, validationMiddleware_1.validate)(validationSchemas_1.updateAdminSchema));
    // Eliminar administrador
    router.delete('/admins/:id', validationMiddleware_1.validateId);
    // Estadísticas con filtros de fecha
    router.get('/stats', validationMiddleware_1.validateDateRange);
    // Reportes
    router.get('/reports', validationMiddleware_1.validateDateRange);
    // Gestión de usuarios
    router.get('/users', validationMiddleware_1.validatePagination);
    router.put('/users/:id', validationMiddleware_1.validateId);
    router.delete('/users/:id', validationMiddleware_1.validateId);
    // Gestión de eventos
    router.get('/events', validationMiddleware_1.validatePagination);
    router.put('/events/:id', validationMiddleware_1.validateId);
    router.delete('/events/:id', validationMiddleware_1.validateId);
}
/**
 * Aplica validaciones a las rutas de notificaciones push
 */
function applyPushNotificationValidations(router) {
    // Suscribirse a notificaciones
    router.post('/subscriptions', (0, validationMiddleware_1.validate)(validationSchemas_1.pushSubscriptionSchema));
    // Obtener suscripciones
    router.get('/subscriptions', validationMiddleware_1.validatePagination);
    // Actualizar suscripción
    router.put('/subscriptions/:id', validationMiddleware_1.validateId, (0, validationMiddleware_1.validate)(validationSchemas_1.pushSubscriptionSchema));
    // Eliminar suscripción
    router.delete('/subscriptions/:id', validationMiddleware_1.validateId);
    // Crear plantilla de notificación
    router.post('/templates', (0, validationMiddleware_1.validate)(validationSchemas_1.notificationTemplateSchema));
    // Obtener plantillas
    router.get('/templates', validationMiddleware_1.validatePagination);
    // Actualizar plantilla
    router.put('/templates/:id', validationMiddleware_1.validateId, (0, validationMiddleware_1.validate)(validationSchemas_1.notificationTemplateSchema));
    // Eliminar plantilla
    router.delete('/templates/:id', validationMiddleware_1.validateId);
    // Enviar notificación
    router.post('/send', (0, validationMiddleware_1.validate)(validationSchemas_1.notificationTemplateSchema));
    // Enviar notificación masiva
    router.post('/send-bulk', (0, validationMiddleware_1.validate)(validationSchemas_1.notificationTemplateSchema));
}
/**
 * Aplica validaciones a las rutas de análisis
 */
function applyAnalyticsValidations(router) {
    // Eventos por período
    router.get('/events', validationMiddleware_1.validateDateRange);
    // Solicitudes por período
    router.get('/requests', validationMiddleware_1.validateDateRange);
    // Usuarios por período
    router.get('/users', validationMiddleware_1.validateDateRange);
    // Ingresos por período
    router.get('/revenue', validationMiddleware_1.validateDateRange);
    // Estadísticas geográficas
    router.get('/geographic', validationMiddleware_1.validateCoordinates);
    // Métricas de rendimiento
    router.get('/performance', validationMiddleware_1.validateDateRange);
    // Reportes personalizados
    router.post('/custom-reports', validationMiddleware_1.validateDateRange);
}
/**
 * Aplica validaciones a las rutas de imágenes
 */
function applyImageValidations(router) {
    // Subir imagen
    router.post('/upload', (0, validationMiddleware_1.validateFile)(['image/jpeg', 'image/png', 'image/gif', 'image/webp'], 10 * 1024 * 1024));
    // Subir múltiples imágenes
    router.post('/upload-multiple', (0, validationMiddleware_1.validateFile)(['image/jpeg', 'image/png', 'image/gif', 'image/webp'], 10 * 1024 * 1024));
    // Obtener imagen por ID
    router.get('/:id', validationMiddleware_1.validateId);
    // Eliminar imagen
    router.delete('/:id', validationMiddleware_1.validateId);
    // Optimizar imagen
    router.post('/:id/optimize', validationMiddleware_1.validateId);
    // Redimensionar imagen
    router.post('/:id/resize', validationMiddleware_1.validateId);
}
/**
 * Aplica validaciones a las rutas de super administrador
 */
function applySuperAdminValidations(router) {
    // Gestión de administradores
    router.post('/admins', (0, validationMiddleware_1.validate)(validationSchemas_1.createAdminSchema));
    router.get('/admins', validationMiddleware_1.validatePagination);
    router.get('/admins/:id', validationMiddleware_1.validateId);
    router.put('/admins/:id', validationMiddleware_1.validateId, (0, validationMiddleware_1.validate)(validationSchemas_1.updateAdminSchema));
    router.delete('/admins/:id', validationMiddleware_1.validateId);
    // Gestión de usuarios
    router.get('/users', validationMiddleware_1.validatePagination);
    router.put('/users/:id', validationMiddleware_1.validateId);
    router.delete('/users/:id', validationMiddleware_1.validateId);
    // Gestión de eventos
    router.get('/events', validationMiddleware_1.validatePagination);
    router.put('/events/:id', validationMiddleware_1.validateId);
    router.delete('/events/:id', validationMiddleware_1.validateId);
    // Configuración del sistema
    router.get('/config', validationMiddleware_1.validatePagination);
    router.put('/config/:key', validationMiddleware_1.validateId);
    // Logs del sistema
    router.get('/logs', validationMiddleware_1.validateDateRange);
    // Backup del sistema
    router.post('/backup', validationMiddleware_1.validateDateRange);
    // Restaurar sistema
    router.post('/restore', validationMiddleware_1.validateId);
}
/**
 * Aplica validaciones a todas las rutas de una aplicación Express
 */
function applyAllValidations(app) {
    // Aplicar validaciones a rutas específicas
    if (app._router) {
        const router = app._router;
        // Buscar y aplicar validaciones a las rutas existentes
        router.stack.forEach((layer) => {
            if (layer.route) {
                const path = layer.route.path;
                const methods = Object.keys(layer.route.methods);
                // Aplicar validaciones según el tipo de ruta
                if (path.startsWith('/auth')) {
                    applyAuthValidations(router);
                }
                else if (path.startsWith('/events')) {
                    applyEventValidations(router);
                }
                else if (path.startsWith('/musician-requests')) {
                    applyMusicianRequestValidations(router);
                }
                else if (path.startsWith('/chat')) {
                    applyChatValidations(router);
                }
                else if (path.startsWith('/payments')) {
                    applyPaymentValidations(router);
                }
                else if (path.startsWith('/search')) {
                    applySearchValidations(router);
                }
                else if (path.startsWith('/geolocation')) {
                    applyGeolocationValidations(router);
                }
                else if (path.startsWith('/admin')) {
                    applyAdminValidations(router);
                }
                else if (path.startsWith('/push-notifications')) {
                    applyPushNotificationValidations(router);
                }
                else if (path.startsWith('/analytics')) {
                    applyAnalyticsValidations(router);
                }
                else if (path.startsWith('/images')) {
                    applyImageValidations(router);
                }
                else if (path.startsWith('/super-admin')) {
                    applySuperAdminValidations(router);
                }
            }
        });
    }
}
/**
 * Función helper para aplicar validaciones a una ruta específica
 */
function applyValidationToRoute(router, method, path, validations) {
    const route = router.route(path);
    switch (method.toLowerCase()) {
        case 'get':
            route.get(...validations);
            break;
        case 'post':
            route.post(...validations);
            break;
        case 'put':
            route.put(...validations);
            break;
        case 'delete':
            route.delete(...validations);
            break;
        case 'patch':
            route.patch(...validations);
            break;
        default:
            throw new Error(`Método HTTP no soportado: ${method}`);
    }
}
/**
 * Función helper para crear validaciones comunes
 */
function createCommonValidations(schema, requireAuth = false, allowedRoles, requireId = false, fileValidation) {
    const validations = [];
    // Validación de ID si es requerida
    if (requireId) {
        validations.push(validationMiddleware_1.validateId);
    }
    // Autenticación si es requerida
    if (requireAuth) {
        // Aquí se agregaría el middleware de autenticación
        // validations.push(authMiddleware);
    }
    // Validación de roles si se especifican
    if (allowedRoles && allowedRoles.length > 0) {
        validations.push((0, validationMiddleware_1.validateUserRole)(allowedRoles));
    }
    // Validación de esquema si se proporciona
    if (schema) {
        validations.push((0, validationMiddleware_1.validate)(schema));
    }
    // Validación de archivo si se especifica
    if (fileValidation) {
        validations.push((0, validationMiddleware_1.validateFile)(fileValidation.types, fileValidation.maxSize));
    }
    return validations;
}
exports.default = {
    applyAuthValidations,
    applyEventValidations,
    applyMusicianRequestValidations,
    applyChatValidations,
    applyPaymentValidations,
    applySearchValidations,
    applyGeolocationValidations,
    applyAdminValidations,
    applyPushNotificationValidations,
    applyAnalyticsValidations,
    applyImageValidations,
    applySuperAdminValidations,
    applyAllValidations,
    applyValidationToRoute,
    createCommonValidations
};
