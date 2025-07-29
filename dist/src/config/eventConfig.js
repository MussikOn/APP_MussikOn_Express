"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_SOCKET_EVENTS = exports.EVENT_LOGS = exports.EVENT_MESSAGES = exports.EVENT_CONFIG = void 0;
exports.EVENT_CONFIG = {
    // Estados de eventos
    STATUS: {
        PENDING_MUSICIAN: 'pending_musician',
        MUSICIAN_ASSIGNED: 'musician_assigned',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled',
        MUSICIAN_CANCELLED: 'musician_cancelled'
    },
    // Tipos de eventos
    EVENT_TYPES: {
        WEDDING: 'boda',
        BIRTHDAY: 'cumpleaños',
        CORPORATE: 'corporativo',
        RELIGIOUS: 'religioso',
        PARTY: 'fiesta',
        CONCERT: 'concierto',
        OTHER: 'otro'
    },
    // Instrumentos
    INSTRUMENTS: {
        GUITAR: 'guitarra',
        PIANO: 'piano',
        DRUMS: 'batería',
        BASS: 'bajo',
        VOCALS: 'vocal',
        SAXOPHONE: 'saxofón',
        TRUMPET: 'trompeta',
        VIOLIN: 'violín',
        ACCORDION: 'acordeón',
        OTHER: 'otro'
    },
    // Géneros musicales
    MUSIC_GENRES: {
        BACHATA: 'bachata',
        MERENGUE: 'merengue',
        SALSA: 'salsa',
        REGGAETON: 'reggaeton',
        POP: 'pop',
        ROCK: 'rock',
        JAZZ: 'jazz',
        CLASSICAL: 'clásica',
        BOLERO: 'bolero',
        OTHER: 'otro'
    },
    // Métodos de pago
    PAYMENT_METHODS: {
        CASH: 'efectivo',
        BANK_TRANSFER: 'transferencia bancaria',
        CREDIT_CARD: 'tarjeta de crédito',
        DEBIT_CARD: 'tarjeta de débito',
        DIGITAL_WALLET: 'billetera digital',
        OTHER: 'otro'
    },
    // Límites de validación
    VALIDATION_LIMITS: {
        MAX_BUDGET: 1000000, // 1 millón de pesos
        MIN_BUDGET: 1000, // 1 mil pesos
        MAX_DURATION: 1440, // 24 horas en minutos
        MIN_DURATION: 30, // 30 minutos
        MAX_GUEST_COUNT: 10000,
        MIN_GUEST_COUNT: 1,
        MAX_IMAGES: 10,
        MAX_REQUEST_NAME_LENGTH: 100,
        MIN_REQUEST_NAME_LENGTH: 3,
        MAX_DESCRIPTION_LENGTH: 2000,
        MIN_DESCRIPTION_LENGTH: 10,
        MAX_LOCATION_DESCRIPTION_LENGTH: 500
    },
    // Configuración de imágenes
    IMAGE_CONFIG: {
        MAX_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
        QUALITY: 0.8,
        MAX_WIDTH: 1920,
        MAX_HEIGHT: 1080
    },
    // Configuración de paginación
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    },
    // Configuración de búsqueda
    SEARCH_CONFIG: {
        MAX_RESULTS: 50,
        MIN_SEARCH_LENGTH: 2
    },
    // Configuración de notificaciones
    NOTIFICATION_CONFIG: {
        ENABLE_EMAIL: true,
        ENABLE_PUSH: true,
        ENABLE_SMS: false
    },
    // Configuración de geolocalización
    LOCATION_CONFIG: {
        DEFAULT_RADIUS: 50, // km
        MAX_RADIUS: 200, // km
        DEFAULT_LATITUDE: 18.4861, // Santo Domingo
        DEFAULT_LONGITUDE: -69.9312
    },
    // Configuración de tiempo
    TIME_CONFIG: {
        MIN_ADVANCE_NOTICE: 24 * 60 * 60 * 1000, // 24 horas en ms
        MAX_ADVANCE_NOTICE: 365 * 24 * 60 * 60 * 1000, // 1 año en ms
        DEFAULT_TIMEZONE: 'America/Santo_Domingo'
    }
};
exports.EVENT_MESSAGES = {
    VALIDATION: {
        REQUIRED_FIELDS: 'Campos requeridos faltantes',
        INVALID_LOCATION: 'Ubicación inválida',
        INVALID_BUDGET: 'Presupuesto inválido',
        INVALID_DURATION: 'Duración inválida',
        INVALID_DATE_TIME: 'Fecha u hora inválida',
        INVALID_IMAGES: 'Imágenes inválidas',
        INVALID_GUEST_COUNT: 'Número de invitados inválido',
        BUDGET_RANGE_INVALID: 'El presupuesto máximo debe ser mayor que el mínimo',
        TOO_MANY_IMAGES: 'No se pueden subir más de 10 imágenes',
        IMAGE_TOO_LARGE: 'Imagen demasiado grande',
        INVALID_IMAGE_TYPE: 'Tipo de imagen no soportado'
    },
    SUCCESS: {
        CREATED: 'Solicitud creada exitosamente',
        UPDATED: 'Solicitud actualizada exitosamente',
        DELETED: 'Solicitud eliminada exitosamente',
        ACCEPTED: 'Solicitud aceptada exitosamente',
        CANCELLED: 'Solicitud cancelada exitosamente',
        COMPLETED: 'Solicitud completada exitosamente'
    },
    ERROR: {
        NOT_FOUND: 'Solicitud no encontrada',
        UNAUTHORIZED: 'No autorizado',
        FORBIDDEN: 'Acceso denegado',
        INTERNAL_ERROR: 'Error interno del servidor',
        VALIDATION_ERROR: 'Error de validación',
        CREATION_ERROR: 'Error al crear la solicitud',
        UPDATE_ERROR: 'Error al actualizar la solicitud',
        DELETE_ERROR: 'Error al eliminar la solicitud',
        ACCEPT_ERROR: 'Error al aceptar la solicitud',
        CANCEL_ERROR: 'Error al cancelar la solicitud',
        COMPLETE_ERROR: 'Error al completar la solicitud'
    },
    PERMISSIONS: {
        CREATOR_ONLY: 'Solo los organizadores pueden crear solicitudes',
        MUSICIAN_ONLY: 'Solo los músicos pueden aceptar solicitudes',
        OWNER_ONLY: 'Solo el creador puede modificar esta solicitud',
        ASSIGNED_ONLY: 'Solo el músico asignado puede completar esta solicitud'
    }
};
exports.EVENT_LOGS = {
    OPERATIONS: {
        CREATED: 'request_musician_created',
        UPDATED: 'request_musician_updated',
        DELETED: 'request_musician_deleted',
        ACCEPTED: 'request_musician_accepted',
        CANCELLED: 'request_musician_cancelled',
        COMPLETED: 'request_musician_completed',
        VALIDATION_FAILED: 'request_musician_validation_failed',
        PERMISSION_DENIED: 'request_musician_permission_denied'
    },
    FIELDS: {
        EVENT_ID: 'eventId',
        USER_ID: 'userId',
        STATUS: 'status',
        BUDGET: 'budget',
        DURATION: 'duration',
        IMAGES_COUNT: 'imagesCount',
        LOCATION: 'location'
    }
};
exports.EVENT_SOCKET_EVENTS = {
    NEW_REQUEST: 'new_event_request',
    REQUEST_ACCEPTED: 'request_accepted',
    REQUEST_CANCELLED: 'request_cancelled',
    REQUEST_COMPLETED: 'request_completed',
    REQUEST_UPDATED: 'request_updated',
    REQUEST_DELETED: 'request_deleted'
};
