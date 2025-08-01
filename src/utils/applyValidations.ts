import { Router } from 'express';
import {
  validate,
  validateId,
  validateFile,
  validateCoordinates,
  validateDateRange,
  validatePriceRange,
  validateUserRole,
  validateQueryLimit,
  validateSearchQuery,
  validatePagination,
} from '../middleware/validationMiddleware';
import {
  // Autenticación
  registerSchema,
  loginSchema,
  updateUserSchema,

  // Eventos
  createEventSchema,
  updateEventSchema,

  // Solicitudes de músicos
  createMusicianRequestSchema,
  updateMusicianRequestSchema,

  // Chat
  sendMessageSchema,
  createConversationSchema,

  // Pagos
  createPaymentMethodSchema,
  createPaymentIntentSchema,
  createInvoiceSchema,

  // Búsqueda
  searchEventsSchema,

  // Geolocalización
  coordinatesSchema,
  geocodeAddressSchema,
  optimizeRouteSchema,

  // Administración
  createAdminSchema,
  updateAdminSchema,

  // Notificaciones
  pushSubscriptionSchema,
  notificationTemplateSchema,

  // Paginación y filtros
  paginationSchema,
  dateRangeSchema,
  locationFilterSchema,
  priceRangeSchema,
} from './validationSchemas';

/**
 * Aplica validaciones a las rutas de autenticación
 */
export function applyAuthValidations(router: Router): void {
  // Registro
  router.post('/register', validate(registerSchema));
  router.post('/email-register', validate(registerSchema));

  // Login
  router.post('/login', validate(loginSchema));

  // Actualización de usuario
  router.put('/update/:userEmail', validateId, validate(updateUserSchema));

  // Validación de número
  router.get('/validate-number/:userEmail', validateId);

  // Agregar evento a usuario
  router.post('/add-event/:userEmail', validateId);

  // Eliminar usuario
  router.delete('/delete/:userEmail', validateId);
}

/**
 * Aplica validaciones a las rutas de eventos
 */
export function applyEventValidations(router: Router): void {
  // Crear evento
  router.post('/', validate(createEventSchema));

  // Obtener eventos con paginación
  router.get('/', validatePagination);

  // Obtener evento por ID
  router.get('/:id', validateId);

  // Actualizar evento
  router.put('/:id', validateId, validate(updateEventSchema));

  // Eliminar evento
  router.delete('/:id', validateId);

  // Buscar eventos
  router.get(
    '/search',
    validateSearchQuery,
    validate(searchEventsSchema, 'query')
  );

  // Eventos cercanos
  router.get('/nearby', validateCoordinates);

  // Eventos por fecha
  router.get('/by-date', validateDateRange);

  // Eventos por presupuesto
  router.get('/by-budget', validatePriceRange);

  // Subir imagen de evento
  router.post(
    '/:id/image',
    validateId,
    validateFile(
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      10 * 1024 * 1024
    )
  );
}

/**
 * Aplica validaciones a las rutas de solicitudes de músicos
 */
export function applyMusicianRequestValidations(router: Router): void {
  // Crear solicitud
  router.post('/', validate(createMusicianRequestSchema));

  // Obtener solicitudes con paginación
  router.get('/', validatePagination);

  // Obtener solicitud por ID
  router.get('/:id', validateId);

  // Actualizar solicitud
  router.put('/:id', validateId, validate(updateMusicianRequestSchema));

  // Eliminar solicitud
  router.delete('/:id', validateId);

  // Solicitudes por evento
  router.get('/event/:eventId', validateId);

  // Solicitudes por músico
  router.get('/musician/:musicianId', validateId);

  // Solicitudes por estado
  router.get('/status/:status', validateId);
}

/**
 * Aplica validaciones a las rutas de chat
 */
export function applyChatValidations(router: Router): void {
  // Enviar mensaje
  router.post('/messages', validate(sendMessageSchema));

  // Crear conversación
  router.post('/conversations', validate(createConversationSchema));

  // Obtener conversaciones con paginación
  router.get('/conversations', validatePagination);

  // Obtener conversación por ID
  router.get('/conversations/:id', validateId);

  // Obtener mensajes con paginación
  router.get('/conversations/:id/messages', validateId, validatePagination);

  // Eliminar conversación
  router.delete('/conversations/:id', validateId);

  // Subir archivo de chat
  router.post(
    '/conversations/:id/upload',
    validateId,
    validateFile(
      ['image/jpeg', 'image/png', 'audio/mpeg', 'audio/wav'],
      5 * 1024 * 1024
    )
  );
}

/**
 * Aplica validaciones a las rutas de pagos
 */
export function applyPaymentValidations(router: Router): void {
  // Crear método de pago
  router.post('/payment-methods', validate(createPaymentMethodSchema));

  // Obtener métodos de pago
  router.get('/payment-methods', validatePagination);

  // Eliminar método de pago
  router.delete('/payment-methods/:id', validateId);

  // Crear intento de pago
  router.post('/payment-intents', validate(createPaymentIntentSchema));

  // Procesar pago
  router.post('/process-payment', validate(createPaymentIntentSchema));

  // Crear factura
  router.post('/invoices', validate(createInvoiceSchema));

  // Obtener facturas con paginación
  router.get('/invoices', validatePagination);

  // Obtener factura por ID
  router.get('/invoices/:id', validateId);

  // Reembolsos
  router.post('/refunds', validate(createPaymentIntentSchema));

  // Validar método de pago
  router.post('/validate-payment-method', validate(createPaymentMethodSchema));
}

/**
 * Aplica validaciones a las rutas de búsqueda
 */
export function applySearchValidations(router: Router): void {
  // Búsqueda de eventos
  router.get(
    '/events',
    validateSearchQuery,
    validate(searchEventsSchema, 'query')
  );

  // Búsqueda de músicos
  router.get('/musicians', validateSearchQuery);

  // Búsqueda de usuarios
  router.get('/users', validateSearchQuery);

  // Búsqueda por ubicación
  router.get('/nearby', validateCoordinates);

  // Búsqueda por fecha
  router.get('/by-date', validateDateRange);

  // Búsqueda por presupuesto
  router.get('/by-budget', validatePriceRange);

  // Búsqueda avanzada
  router.get(
    '/advanced',
    validateSearchQuery,
    validate(searchEventsSchema, 'query'),
    validateCoordinates,
    validateDateRange,
    validatePriceRange
  );
}

/**
 * Aplica validaciones a las rutas de geolocalización
 */
export function applyGeolocationValidations(router: Router): void {
  // Obtener coordenadas
  router.get('/coordinates', validate(coordinatesSchema, 'query'));

  // Geocodificar dirección
  router.post('/geocode', validate(geocodeAddressSchema));

  // Geocodificación inversa
  router.post('/reverse-geocode', validate(coordinatesSchema));

  // Calcular distancia
  router.post('/distance', validate(coordinatesSchema));

  // Verificar si está dentro del radio
  router.post('/within-radius', validate(coordinatesSchema));

  // Optimizar ruta
  router.post('/optimize-route', validate(optimizeRouteSchema));

  // Obtener direcciones
  router.get('/directions', validateCoordinates);
}

/**
 * Aplica validaciones a las rutas de administración
 */
export function applyAdminValidations(router: Router): void {
  // Crear administrador
  router.post('/admins', validate(createAdminSchema));

  // Obtener administradores con paginación
  router.get('/admins', validatePagination);

  // Obtener administrador por ID
  router.get('/admins/:id', validateId);

  // Actualizar administrador
  router.put('/admins/:id', validateId, validate(updateAdminSchema));

  // Eliminar administrador
  router.delete('/admins/:id', validateId);

  // Estadísticas con filtros de fecha
  router.get('/stats', validateDateRange);

  // Reportes
  router.get('/reports', validateDateRange);

  // Gestión de usuarios
  router.get('/users', validatePagination);
  router.put('/users/:id', validateId);
  router.delete('/users/:id', validateId);

  // Gestión de eventos
  router.get('/events', validatePagination);
  router.put('/events/:id', validateId);
  router.delete('/events/:id', validateId);
}

/**
 * Aplica validaciones a las rutas de notificaciones push
 */
export function applyPushNotificationValidations(router: Router): void {
  // Suscribirse a notificaciones
  router.post('/subscriptions', validate(pushSubscriptionSchema));

  // Obtener suscripciones
  router.get('/subscriptions', validatePagination);

  // Actualizar suscripción
  router.put(
    '/subscriptions/:id',
    validateId,
    validate(pushSubscriptionSchema)
  );

  // Eliminar suscripción
  router.delete('/subscriptions/:id', validateId);

  // Crear plantilla de notificación
  router.post('/templates', validate(notificationTemplateSchema));

  // Obtener plantillas
  router.get('/templates', validatePagination);

  // Actualizar plantilla
  router.put(
    '/templates/:id',
    validateId,
    validate(notificationTemplateSchema)
  );

  // Eliminar plantilla
  router.delete('/templates/:id', validateId);

  // Enviar notificación
  router.post('/send', validate(notificationTemplateSchema));

  // Enviar notificación masiva
  router.post('/send-bulk', validate(notificationTemplateSchema));
}

/**
 * Aplica validaciones a las rutas de análisis
 */
export function applyAnalyticsValidations(router: Router): void {
  // Eventos por período
  router.get('/events', validateDateRange);

  // Solicitudes por período
  router.get('/requests', validateDateRange);

  // Usuarios por período
  router.get('/users', validateDateRange);

  // Ingresos por período
  router.get('/revenue', validateDateRange);

  // Estadísticas geográficas
  router.get('/geographic', validateCoordinates);

  // Métricas de rendimiento
  router.get('/performance', validateDateRange);

  // Reportes personalizados
  router.post('/custom-reports', validateDateRange);
}

/**
 * Aplica validaciones a las rutas de imágenes
 */
export function applyImageValidations(router: Router): void {
  // Subir imagen
  router.post(
    '/upload',
    validateFile(
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      10 * 1024 * 1024
    )
  );

  // Subir múltiples imágenes
  router.post(
    '/upload-multiple',
    validateFile(
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      10 * 1024 * 1024
    )
  );

  // Obtener imagen por ID
  router.get('/:id', validateId);

  // Eliminar imagen
  router.delete('/:id', validateId);

  // Optimizar imagen
  router.post('/:id/optimize', validateId);

  // Redimensionar imagen
  router.post('/:id/resize', validateId);
}

/**
 * Aplica validaciones a las rutas de super administrador
 */
export function applySuperAdminValidations(router: Router): void {
  // Gestión de administradores
  router.post('/admins', validate(createAdminSchema));
  router.get('/admins', validatePagination);
  router.get('/admins/:id', validateId);
  router.put('/admins/:id', validateId, validate(updateAdminSchema));
  router.delete('/admins/:id', validateId);

  // Gestión de usuarios
  router.get('/users', validatePagination);
  router.put('/users/:id', validateId);
  router.delete('/users/:id', validateId);

  // Gestión de eventos
  router.get('/events', validatePagination);
  router.put('/events/:id', validateId);
  router.delete('/events/:id', validateId);

  // Configuración del sistema
  router.get('/config', validatePagination);
  router.put('/config/:key', validateId);

  // Logs del sistema
  router.get('/logs', validateDateRange);

  // Backup del sistema
  router.post('/backup', validateDateRange);

  // Restaurar sistema
  router.post('/restore', validateId);
}

/**
 * Aplica validaciones a todas las rutas de una aplicación Express
 */
export function applyAllValidations(app: any): void {
  // Aplicar validaciones a rutas específicas
  if (app._router) {
    const router = app._router;

    // Buscar y aplicar validaciones a las rutas existentes
    router.stack.forEach((layer: any) => {
      if (layer.route) {
        const path = layer.route.path;
        const methods = Object.keys(layer.route.methods);

        // Aplicar validaciones según el tipo de ruta
        if (path.startsWith('/auth')) {
          applyAuthValidations(router);
        } else if (path.startsWith('/events')) {
          applyEventValidations(router);
        } else if (path.startsWith('/musician-requests')) {
          applyMusicianRequestValidations(router);
        } else if (path.startsWith('/chat')) {
          applyChatValidations(router);
        } else if (path.startsWith('/payments')) {
          applyPaymentValidations(router);
        } else if (path.startsWith('/search')) {
          applySearchValidations(router);
        } else if (path.startsWith('/geolocation')) {
          applyGeolocationValidations(router);
        } else if (path.startsWith('/admin')) {
          applyAdminValidations(router);
        } else if (path.startsWith('/push-notifications')) {
          applyPushNotificationValidations(router);
        } else if (path.startsWith('/analytics')) {
          applyAnalyticsValidations(router);
        } else if (path.startsWith('/images')) {
          applyImageValidations(router);
        } else if (path.startsWith('/super-admin')) {
          applySuperAdminValidations(router);
        }
      }
    });
  }
}

/**
 * Función helper para aplicar validaciones a una ruta específica
 */
export function applyValidationToRoute(
  router: Router,
  method: string,
  path: string,
  validations: any[]
): void {
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
export function createCommonValidations(
  schema?: any,
  requireAuth: boolean = false,
  allowedRoles?: string[],
  requireId: boolean = false,
  fileValidation?: { types: string[]; maxSize: number }
): any[] {
  const validations: any[] = [];

  // Validación de ID si es requerida
  if (requireId) {
    validations.push(validateId);
  }

  // Autenticación si es requerida
  if (requireAuth) {
    // Aquí se agregaría el middleware de autenticación
    // validations.push(authMiddleware);
  }

  // Validación de roles si se especifican
  if (allowedRoles && allowedRoles.length > 0) {
    validations.push(validateUserRole(allowedRoles));
  }

  // Validación de esquema si se proporciona
  if (schema) {
    validations.push(validate(schema));
  }

  // Validación de archivo si se especifica
  if (fileValidation) {
    validations.push(
      validateFile(fileValidation.types, fileValidation.maxSize)
    );
  }

  return validations;
}

export default {
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
  createCommonValidations,
};
