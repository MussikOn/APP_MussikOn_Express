"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceRangeSchema = exports.locationFilterSchema = exports.dateRangeSchema = exports.paginationSchema = exports.notificationTemplateSchema = exports.pushSubscriptionSchema = exports.updateAdminSchema = exports.createAdminSchema = exports.optimizeRouteSchema = exports.geocodeAddressSchema = exports.coordinatesSchema = exports.searchEventsSchema = exports.createInvoiceSchema = exports.createPaymentIntentSchema = exports.createPaymentMethodSchema = exports.createConversationSchema = exports.sendMessageSchema = exports.updateMusicianRequestSchema = exports.createMusicianRequestSchema = exports.updateEventSchema = exports.createEventSchema = exports.updateUserSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// ============================================================================
// ESQUEMAS DE AUTENTICACIÓN
// ============================================================================
exports.registerSchema = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .required()
        .messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 50 caracteres',
        'string.pattern.base': 'El nombre solo puede contener letras y espacios',
        'any.required': 'El nombre es requerido',
    }),
    lastName: joi_1.default.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .required()
        .messages({
        'string.min': 'El apellido debe tener al menos 2 caracteres',
        'string.max': 'El apellido no puede exceder 50 caracteres',
        'string.pattern.base': 'El apellido solo puede contener letras y espacios',
        'any.required': 'El apellido es requerido',
    }),
    userEmail: joi_1.default.string()
        .email({ tlds: { allow: false } })
        .max(100)
        .required()
        .messages({
        'string.email': 'El email debe tener un formato válido',
        'string.max': 'El email no puede exceder 100 caracteres',
        'any.required': 'El email es requerido',
    }),
    userPassword: joi_1.default.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/)
        .required()
        .messages({
        'string.min': 'La contraseña debe tener al menos 8 caracteres',
        'string.max': 'La contraseña no puede exceder 128 caracteres',
        'string.pattern.base': 'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial',
        'any.required': 'La contraseña es requerida',
    }),
    roll: joi_1.default.string()
        .valid('musico', 'eventCreator', 'usuario', 'adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin')
        .default('usuario')
        .messages({
        'any.only': 'El rol debe ser uno de los valores permitidos',
        'any.default': 'El rol por defecto es usuario',
    }),
});
exports.loginSchema = joi_1.default.object({
    userEmail: joi_1.default.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
        'string.email': 'El email debe tener un formato válido',
        'any.required': 'El email es requerido',
    }),
    userPassword: joi_1.default.string().required().messages({
        'any.required': 'La contraseña es requerida',
    }),
});
exports.updateUserSchema = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .optional()
        .messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 50 caracteres',
        'string.pattern.base': 'El nombre solo puede contener letras y espacios',
    }),
    lastName: joi_1.default.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .optional()
        .messages({
        'string.min': 'El apellido debe tener al menos 2 caracteres',
        'string.max': 'El apellido no puede exceder 50 caracteres',
        'string.pattern.base': 'El apellido solo puede contener letras y espacios',
    }),
    userPassword: joi_1.default.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/)
        .optional()
        .messages({
        'string.min': 'La contraseña debe tener al menos 8 caracteres',
        'string.max': 'La contraseña no puede exceder 128 caracteres',
        'string.pattern.base': 'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial',
    }),
});
// ============================================================================
// ESQUEMAS DE EVENTOS
// ============================================================================
exports.createEventSchema = joi_1.default.object({
    eventName: joi_1.default.string().min(3).max(100).required().messages({
        'string.min': 'El nombre del evento debe tener al menos 3 caracteres',
        'string.max': 'El nombre del evento no puede exceder 100 caracteres',
        'any.required': 'El nombre del evento es requerido',
    }),
    eventType: joi_1.default.string()
        .valid('concierto', 'boda', 'culto', 'evento_corporativo', 'festival', 'fiesta_privada', 'graduacion', 'cumpleanos', 'otro')
        .required()
        .messages({
        'any.only': 'El tipo de evento debe ser uno de los valores permitidos',
        'any.required': 'El tipo de evento es requerido',
    }),
    date: joi_1.default.date().greater('now').required().messages({
        'date.greater': 'La fecha del evento debe ser futura',
        'any.required': 'La fecha del evento es requerida',
    }),
    time: joi_1.default.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
        'string.pattern.base': 'La hora debe tener formato HH:MM',
        'any.required': 'La hora del evento es requerida',
    }),
    location: joi_1.default.string().min(5).max(200).required().messages({
        'string.min': 'La ubicación debe tener al menos 5 caracteres',
        'string.max': 'La ubicación no puede exceder 200 caracteres',
        'any.required': 'La ubicación es requerida',
    }),
    duration: joi_1.default.string()
        .pattern(/^([0-9]+h\s*)?([0-9]+m)?$/)
        .required()
        .messages({
        'string.pattern.base': 'La duración debe tener formato "Xh Ym" o "Xh" o "Ym"',
        'any.required': 'La duración es requerida',
    }),
    instrument: joi_1.default.string()
        .valid('guitarra', 'piano', 'bajo', 'bateria', 'saxofon', 'trompeta', 'violin', 'canto', 'teclado', 'flauta', 'otro')
        .required()
        .messages({
        'any.only': 'El instrumento debe ser uno de los valores permitidos',
        'any.required': 'El instrumento es requerido',
    }),
    bringInstrument: joi_1.default.boolean().required().messages({
        'any.required': 'Debe especificar si el músico debe traer su instrumento',
    }),
    comment: joi_1.default.string().max(500).optional().messages({
        'string.max': 'El comentario no puede exceder 500 caracteres',
    }),
    budget: joi_1.default.string()
        .pattern(/^\d+(\.\d{1,2})?$/)
        .required()
        .messages({
        'string.pattern.base': 'El presupuesto debe ser un número válido',
        'any.required': 'El presupuesto es requerido',
    }),
    flyerUrl: joi_1.default.string().uri().optional().messages({
        'string.uri': 'La URL del flyer debe ser válida',
    }),
    songs: joi_1.default.array().items(joi_1.default.string().max(100)).max(20).optional().messages({
        'array.max': 'No puede especificar más de 20 canciones',
    }),
    recommendations: joi_1.default.array()
        .items(joi_1.default.string().max(200))
        .max(10)
        .optional()
        .messages({
        'array.max': 'No puede especificar más de 10 recomendaciones',
    }),
    mapsLink: joi_1.default.string().uri().optional().messages({
        'string.uri': 'La URL de Google Maps debe ser válida',
    }),
});
exports.updateEventSchema = joi_1.default.object({
    eventName: joi_1.default.string().min(3).max(100).optional().messages({
        'string.min': 'El nombre del evento debe tener al menos 3 caracteres',
        'string.max': 'El nombre del evento no puede exceder 100 caracteres',
    }),
    eventType: joi_1.default.string()
        .valid('concierto', 'boda', 'culto', 'evento_corporativo', 'festival', 'fiesta_privada', 'graduacion', 'cumpleanos', 'otro')
        .optional()
        .messages({
        'any.only': 'El tipo de evento debe ser uno de los valores permitidos',
    }),
    date: joi_1.default.date().greater('now').optional().messages({
        'date.greater': 'La fecha del evento debe ser futura',
    }),
    time: joi_1.default.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
        'string.pattern.base': 'La hora debe tener formato HH:MM',
    }),
    location: joi_1.default.string().min(5).max(200).optional().messages({
        'string.min': 'La ubicación debe tener al menos 5 caracteres',
        'string.max': 'La ubicación no puede exceder 200 caracteres',
    }),
    duration: joi_1.default.string()
        .pattern(/^([0-9]+h\s*)?([0-9]+m)?$/)
        .optional()
        .messages({
        'string.pattern.base': 'La duración debe tener formato "Xh Ym" o "Xh" o "Ym"',
    }),
    instrument: joi_1.default.string()
        .valid('guitarra', 'piano', 'bajo', 'bateria', 'saxofon', 'trompeta', 'violin', 'canto', 'teclado', 'flauta', 'otro')
        .optional()
        .messages({
        'any.only': 'El instrumento debe ser uno de los valores permitidos',
    }),
    bringInstrument: joi_1.default.boolean().optional().messages({
        'any.required': 'Debe especificar si el músico debe traer su instrumento',
    }),
    comment: joi_1.default.string().max(500).optional().messages({
        'string.max': 'El comentario no puede exceder 500 caracteres',
    }),
    budget: joi_1.default.string()
        .pattern(/^\d+(\.\d{1,2})?$/)
        .optional()
        .messages({
        'string.pattern.base': 'El presupuesto debe ser un número válido',
    }),
    flyerUrl: joi_1.default.string().uri().optional().messages({
        'string.uri': 'La URL del flyer debe ser válida',
    }),
    songs: joi_1.default.array().items(joi_1.default.string().max(100)).max(20).optional().messages({
        'array.max': 'No puede especificar más de 20 canciones',
    }),
    recommendations: joi_1.default.array()
        .items(joi_1.default.string().max(200))
        .max(10)
        .optional()
        .messages({
        'array.max': 'No puede especificar más de 10 recomendaciones',
    }),
    mapsLink: joi_1.default.string().uri().optional().messages({
        'string.uri': 'La URL de Google Maps debe ser válida',
    }),
});
// ============================================================================
// ESQUEMAS DE SOLICITUDES DE MÚSICOS
// ============================================================================
exports.createMusicianRequestSchema = joi_1.default.object({
    eventType: joi_1.default.string()
        .valid('concierto', 'boda', 'culto', 'evento_corporativo', 'festival', 'fiesta_privada', 'graduacion', 'cumpleanos', 'otro')
        .required()
        .messages({
        'any.only': 'El tipo de evento debe ser uno de los valores permitidos',
        'any.required': 'El tipo de evento es requerido',
    }),
    date: joi_1.default.date().greater('now').required().messages({
        'date.greater': 'La fecha debe ser futura',
        'any.required': 'La fecha es requerida',
    }),
    time: joi_1.default.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
        'string.pattern.base': 'La hora debe tener formato HH:MM',
        'any.required': 'La hora es requerida',
    }),
    location: joi_1.default.string().min(5).max(200).required().messages({
        'string.min': 'La ubicación debe tener al menos 5 caracteres',
        'string.max': 'La ubicación no puede exceder 200 caracteres',
        'any.required': 'La ubicación es requerida',
    }),
    instrument: joi_1.default.string()
        .valid('guitarra', 'piano', 'bajo', 'bateria', 'saxofon', 'trompeta', 'violin', 'canto', 'teclado', 'flauta', 'otro')
        .required()
        .messages({
        'any.only': 'El instrumento debe ser uno de los valores permitidos',
        'any.required': 'El instrumento es requerido',
    }),
    budget: joi_1.default.number().min(0).max(999999).required().messages({
        'number.min': 'El presupuesto debe ser mayor o igual a 0',
        'number.max': 'El presupuesto no puede exceder 999,999',
        'any.required': 'El presupuesto es requerido',
    }),
    comments: joi_1.default.string().max(500).optional().messages({
        'string.max': 'Los comentarios no pueden exceder 500 caracteres',
    }),
});
exports.updateMusicianRequestSchema = joi_1.default.object({
    eventType: joi_1.default.string()
        .valid('concierto', 'boda', 'culto', 'evento_corporativo', 'festival', 'fiesta_privada', 'graduacion', 'cumpleanos', 'otro')
        .optional()
        .messages({
        'any.only': 'El tipo de evento debe ser uno de los valores permitidos',
    }),
    date: joi_1.default.date().greater('now').optional().messages({
        'date.greater': 'La fecha debe ser futura',
    }),
    time: joi_1.default.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
        'string.pattern.base': 'La hora debe tener formato HH:MM',
    }),
    location: joi_1.default.string().min(5).max(200).optional().messages({
        'string.min': 'La ubicación debe tener al menos 5 caracteres',
        'string.max': 'La ubicación no puede exceder 200 caracteres',
    }),
    instrument: joi_1.default.string()
        .valid('guitarra', 'piano', 'bajo', 'bateria', 'saxofon', 'trompeta', 'violin', 'canto', 'teclado', 'flauta', 'otro')
        .optional()
        .messages({
        'any.only': 'El instrumento debe ser uno de los valores permitidos',
    }),
    budget: joi_1.default.number().min(0).max(999999).optional().messages({
        'number.min': 'El presupuesto debe ser mayor o igual a 0',
        'number.max': 'El presupuesto no puede exceder 999,999',
    }),
    comments: joi_1.default.string().max(500).optional().messages({
        'string.max': 'Los comentarios no pueden exceder 500 caracteres',
    }),
});
// ============================================================================
// ESQUEMAS DE CHAT
// ============================================================================
exports.sendMessageSchema = joi_1.default.object({
    conversationId: joi_1.default.string().min(1).max(1500).required().messages({
        'string.min': 'El ID de conversación es requerido',
        'string.max': 'El ID de conversación es demasiado largo',
        'any.required': 'El ID de conversación es requerido',
    }),
    content: joi_1.default.string().min(1).max(1000).required().messages({
        'string.min': 'El mensaje no puede estar vacío',
        'string.max': 'El mensaje no puede exceder 1000 caracteres',
        'any.required': 'El contenido del mensaje es requerido',
    }),
    type: joi_1.default.string()
        .valid('text', 'image', 'audio', 'file')
        .default('text')
        .messages({
        'any.only': 'El tipo de mensaje debe ser uno de los valores permitidos',
    }),
    metadata: joi_1.default.object().optional().messages({
        'object.base': 'Los metadatos deben ser un objeto válido',
    }),
});
exports.createConversationSchema = joi_1.default.object({
    participants: joi_1.default.array()
        .items(joi_1.default.string().email())
        .min(2)
        .max(10)
        .required()
        .messages({
        'array.min': 'Debe haber al menos 2 participantes',
        'array.max': 'No puede haber más de 10 participantes',
        'any.required': 'Los participantes son requeridos',
    }),
    title: joi_1.default.string().min(1).max(100).optional().messages({
        'string.min': 'El título no puede estar vacío',
        'string.max': 'El título no puede exceder 100 caracteres',
    }),
    type: joi_1.default.string().valid('private', 'group').default('private').messages({
        'any.only': 'El tipo de conversación debe ser private o group',
    }),
});
// ============================================================================
// ESQUEMAS DE PAGOS
// ============================================================================
exports.createPaymentMethodSchema = joi_1.default.object({
    type: joi_1.default.string()
        .valid('card', 'bank_transfer', 'paypal', 'stripe')
        .required()
        .messages({
        'any.only': 'El tipo de método de pago debe ser uno de los valores permitidos',
        'any.required': 'El tipo de método de pago es requerido',
    }),
    cardNumber: joi_1.default.string()
        .when('type', {
        is: 'card',
        then: joi_1.default.string()
            .pattern(/^\d{13,19}$/)
            .required(),
        otherwise: joi_1.default.forbidden(),
    })
        .messages({
        'string.pattern.base': 'El número de tarjeta debe tener entre 13 y 19 dígitos',
        'any.required': 'El número de tarjeta es requerido para tarjetas',
        'any.forbidden': 'El número de tarjeta no es necesario para este tipo de método',
    }),
    expiryMonth: joi_1.default.number()
        .when('type', {
        is: 'card',
        then: joi_1.default.number().min(1).max(12).required(),
        otherwise: joi_1.default.forbidden(),
    })
        .messages({
        'number.min': 'El mes de expiración debe estar entre 1 y 12',
        'number.max': 'El mes de expiración debe estar entre 1 y 12',
        'any.required': 'El mes de expiración es requerido para tarjetas',
        'any.forbidden': 'El mes de expiración no es necesario para este tipo de método',
    }),
    expiryYear: joi_1.default.number()
        .when('type', {
        is: 'card',
        then: joi_1.default.number()
            .min(new Date().getFullYear())
            .max(new Date().getFullYear() + 20)
            .required(),
        otherwise: joi_1.default.forbidden(),
    })
        .messages({
        'number.min': 'El año de expiración debe ser futuro',
        'number.max': 'El año de expiración no puede ser más de 20 años en el futuro',
        'any.required': 'El año de expiración es requerido para tarjetas',
        'any.forbidden': 'El año de expiración no es necesario para este tipo de método',
    }),
    cvc: joi_1.default.string()
        .when('type', {
        is: 'card',
        then: joi_1.default.string()
            .pattern(/^\d{3,4}$/)
            .required(),
        otherwise: joi_1.default.forbidden(),
    })
        .messages({
        'string.pattern.base': 'El CVC debe tener 3 o 4 dígitos',
        'any.required': 'El CVC es requerido para tarjetas',
        'any.forbidden': 'El CVC no es necesario para este tipo de método',
    }),
    billingAddress: joi_1.default.object({
        line1: joi_1.default.string().min(5).max(100).required(),
        line2: joi_1.default.string().max(100).optional(),
        city: joi_1.default.string().min(2).max(50).required(),
        state: joi_1.default.string().min(2).max(50).required(),
        postalCode: joi_1.default.string()
            .pattern(/^\d{5}(-\d{4})?$/)
            .required(),
        country: joi_1.default.string().min(2).max(50).required(),
    })
        .when('type', {
        is: 'card',
        then: joi_1.default.required(),
        otherwise: joi_1.default.optional(),
    })
        .messages({
        'any.required': 'La dirección de facturación es requerida para tarjetas',
        'object.base': 'La dirección de facturación debe ser un objeto válido',
    }),
});
exports.createPaymentIntentSchema = joi_1.default.object({
    amount: joi_1.default.number().min(0.01).max(999999.99).required().messages({
        'number.min': 'El monto debe ser mayor a 0',
        'number.max': 'El monto no puede exceder 999,999.99',
        'any.required': 'El monto es requerido',
    }),
    currency: joi_1.default.string().valid('EUR', 'USD', 'GBP').default('EUR').messages({
        'any.only': 'La moneda debe ser EUR, USD o GBP',
    }),
    description: joi_1.default.string().min(1).max(255).required().messages({
        'string.min': 'La descripción no puede estar vacía',
        'string.max': 'La descripción no puede exceder 255 caracteres',
        'any.required': 'La descripción es requerida',
    }),
    metadata: joi_1.default.object().optional().messages({
        'object.base': 'Los metadatos deben ser un objeto válido',
    }),
});
exports.createInvoiceSchema = joi_1.default.object({
    items: joi_1.default.array()
        .items(joi_1.default.object({
        description: joi_1.default.string().min(1).max(255).required(),
        quantity: joi_1.default.number().min(1).max(999).required(),
        unitPrice: joi_1.default.number().min(0.01).max(999999.99).required(),
    }))
        .min(1)
        .max(50)
        .required()
        .messages({
        'array.min': 'Debe haber al menos un item',
        'array.max': 'No puede haber más de 50 items',
        'any.required': 'Los items son requeridos',
    }),
    dueDate: joi_1.default.date().greater('now').optional().messages({
        'date.greater': 'La fecha de vencimiento debe ser futura',
    }),
    eventId: joi_1.default.string().min(1).max(1500).optional().messages({
        'string.min': 'El ID del evento es requerido si se proporciona',
        'string.max': 'El ID del evento es demasiado largo',
    }),
});
// ============================================================================
// ESQUEMAS DE BÚSQUEDA
// ============================================================================
exports.searchEventsSchema = joi_1.default.object({
    query: joi_1.default.string().min(1).max(100).optional().messages({
        'string.min': 'El término de búsqueda no puede estar vacío',
        'string.max': 'El término de búsqueda no puede exceder 100 caracteres',
    }),
    status: joi_1.default.string()
        .valid('pending_musician', 'musician_assigned', 'completed', 'cancelled', 'musician_cancelled')
        .optional()
        .messages({
        'any.only': 'El estado debe ser uno de los valores permitidos',
    }),
    eventType: joi_1.default.string()
        .valid('concierto', 'boda', 'culto', 'evento_corporativo', 'festival', 'fiesta_privada', 'graduacion', 'cumpleanos', 'otro')
        .optional()
        .messages({
        'any.only': 'El tipo de evento debe ser uno de los valores permitidos',
    }),
    instrument: joi_1.default.string()
        .valid('guitarra', 'piano', 'bajo', 'bateria', 'saxofon', 'trompeta', 'violin', 'canto', 'teclado', 'flauta', 'otro')
        .optional()
        .messages({
        'any.only': 'El instrumento debe ser uno de los valores permitidos',
    }),
    dateFrom: joi_1.default.date().optional().messages({
        'date.base': 'La fecha de inicio debe ser una fecha válida',
    }),
    dateTo: joi_1.default.date().greater(joi_1.default.ref('dateFrom')).optional().messages({
        'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio',
        'date.base': 'La fecha de fin debe ser una fecha válida',
    }),
    location: joi_1.default.string().min(1).max(200).optional().messages({
        'string.min': 'La ubicación no puede estar vacía',
        'string.max': 'La ubicación no puede exceder 200 caracteres',
    }),
    budget: joi_1.default.number().min(0).max(999999).optional().messages({
        'number.min': 'El presupuesto debe ser mayor o igual a 0',
        'number.max': 'El presupuesto no puede exceder 999,999',
    }),
    budgetMax: joi_1.default.number()
        .min(joi_1.default.ref('budget'))
        .max(999999)
        .optional()
        .messages({
        'number.min': 'El presupuesto máximo debe ser mayor o igual al presupuesto mínimo',
        'number.max': 'El presupuesto máximo no puede exceder 999,999',
    }),
    limit: joi_1.default.number().min(1).max(50).default(20).messages({
        'number.min': 'El límite debe ser mayor a 0',
        'number.max': 'El límite no puede exceder 50',
    }),
    offset: joi_1.default.number().min(0).default(0).messages({
        'number.min': 'El offset debe ser mayor o igual a 0',
    }),
    sortBy: joi_1.default.string()
        .valid('date', 'budget', 'createdAt', 'eventName')
        .default('date')
        .messages({
        'any.only': 'El campo de ordenamiento debe ser uno de los valores permitidos',
    }),
    sortOrder: joi_1.default.string().valid('asc', 'desc').default('asc').messages({
        'any.only': 'El orden debe ser asc o desc',
    }),
});
// ============================================================================
// ESQUEMAS DE GEOLOCALIZACIÓN
// ============================================================================
exports.coordinatesSchema = joi_1.default.object({
    latitude: joi_1.default.number().min(-90).max(90).required().messages({
        'number.min': 'La latitud debe estar entre -90 y 90',
        'number.max': 'La latitud debe estar entre -90 y 90',
        'any.required': 'La latitud es requerida',
    }),
    longitude: joi_1.default.number().min(-180).max(180).required().messages({
        'number.min': 'La longitud debe estar entre -180 y 180',
        'number.max': 'La longitud debe estar entre -180 y 180',
        'any.required': 'La longitud es requerida',
    }),
});
exports.geocodeAddressSchema = joi_1.default.object({
    address: joi_1.default.string().min(5).max(500).required().messages({
        'string.min': 'La dirección debe tener al menos 5 caracteres',
        'string.max': 'La dirección no puede exceder 500 caracteres',
        'any.required': 'La dirección es requerida',
    }),
    country: joi_1.default.string().min(2).max(50).optional().messages({
        'string.min': 'El país debe tener al menos 2 caracteres',
        'string.max': 'El país no puede exceder 50 caracteres',
    }),
});
exports.optimizeRouteSchema = joi_1.default.object({
    waypoints: joi_1.default.array()
        .items(joi_1.default.object({
        latitude: joi_1.default.number().min(-90).max(90).required(),
        longitude: joi_1.default.number().min(-180).max(180).required(),
    }))
        .min(2)
        .max(25)
        .required()
        .messages({
        'array.min': 'Debe haber al menos 2 waypoints',
        'array.max': 'No puede haber más de 25 waypoints',
        'any.required': 'Los waypoints son requeridos',
    }),
    mode: joi_1.default.string()
        .valid('driving', 'walking', 'bicycling', 'transit')
        .default('driving')
        .messages({
        'any.only': 'El modo debe ser uno de los valores permitidos',
    }),
    avoid: joi_1.default.array()
        .items(joi_1.default.string().valid('tolls', 'highways', 'ferries'))
        .optional()
        .messages({
        'array.base': 'Los elementos a evitar deben ser un array',
    }),
});
// ============================================================================
// ESQUEMAS DE ADMINISTRACIÓN
// ============================================================================
exports.createAdminSchema = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .required()
        .messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 50 caracteres',
        'string.pattern.base': 'El nombre solo puede contener letras y espacios',
        'any.required': 'El nombre es requerido',
    }),
    lastName: joi_1.default.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .required()
        .messages({
        'string.min': 'El apellido debe tener al menos 2 caracteres',
        'string.max': 'El apellido no puede exceder 50 caracteres',
        'string.pattern.base': 'El apellido solo puede contener letras y espacios',
        'any.required': 'El apellido es requerido',
    }),
    userEmail: joi_1.default.string()
        .email({ tlds: { allow: false } })
        .max(100)
        .required()
        .messages({
        'string.email': 'El email debe tener un formato válido',
        'string.max': 'El email no puede exceder 100 caracteres',
        'any.required': 'El email es requerido',
    }),
    userPassword: joi_1.default.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/)
        .required()
        .messages({
        'string.min': 'La contraseña debe tener al menos 8 caracteres',
        'string.max': 'La contraseña no puede exceder 128 caracteres',
        'string.pattern.base': 'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial',
        'any.required': 'La contraseña es requerida',
    }),
    roll: joi_1.default.string()
        .valid('adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin')
        .required()
        .messages({
        'any.only': 'El rol debe ser uno de los valores permitidos',
        'any.required': 'El rol es requerido',
    }),
});
exports.updateAdminSchema = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .optional()
        .messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 50 caracteres',
        'string.pattern.base': 'El nombre solo puede contener letras y espacios',
    }),
    lastName: joi_1.default.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .optional()
        .messages({
        'string.min': 'El apellido debe tener al menos 2 caracteres',
        'string.max': 'El apellido no puede exceder 50 caracteres',
        'string.pattern.base': 'El apellido solo puede contener letras y espacios',
    }),
    userEmail: joi_1.default.string()
        .email({ tlds: { allow: false } })
        .max(100)
        .optional()
        .messages({
        'string.email': 'El email debe tener un formato válido',
        'string.max': 'El email no puede exceder 100 caracteres',
    }),
    roll: joi_1.default.string()
        .valid('adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin')
        .optional()
        .messages({
        'any.only': 'El rol debe ser uno de los valores permitidos',
    }),
    status: joi_1.default.boolean().optional().messages({
        'boolean.base': 'El estado debe ser true o false',
    }),
});
// ============================================================================
// ESQUEMAS DE NOTIFICACIONES PUSH
// ============================================================================
exports.pushSubscriptionSchema = joi_1.default.object({
    endpoint: joi_1.default.string().uri().required().messages({
        'string.uri': 'El endpoint debe ser una URL válida',
        'any.required': 'El endpoint es requerido',
    }),
    keys: joi_1.default.object({
        p256dh: joi_1.default.string().min(1).required().messages({
            'string.min': 'La clave p256dh es requerida',
            'any.required': 'La clave p256dh es requerida',
        }),
        auth: joi_1.default.string().min(1).required().messages({
            'string.min': 'La clave auth es requerida',
            'any.required': 'La clave auth es requerida',
        }),
    })
        .required()
        .messages({
        'any.required': 'Las claves son requeridas',
    }),
    isActive: joi_1.default.boolean().default(true).messages({
        'boolean.base': 'El estado activo debe ser true o false',
    }),
});
exports.notificationTemplateSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).required().messages({
        'string.min': 'El nombre no puede estar vacío',
        'string.max': 'El nombre no puede exceder 100 caracteres',
        'any.required': 'El nombre es requerido',
    }),
    title: joi_1.default.string().min(1).max(100).required().messages({
        'string.min': 'El título no puede estar vacío',
        'string.max': 'El título no puede exceder 100 caracteres',
        'any.required': 'El título es requerido',
    }),
    body: joi_1.default.string().min(1).max(500).required().messages({
        'string.min': 'El cuerpo no puede estar vacío',
        'string.max': 'El cuerpo no puede exceder 500 caracteres',
        'any.required': 'El cuerpo es requerido',
    }),
    icon: joi_1.default.string().uri().optional().messages({
        'string.uri': 'El icono debe ser una URL válida',
    }),
    badge: joi_1.default.string().uri().optional().messages({
        'string.uri': 'El badge debe ser una URL válida',
    }),
    tag: joi_1.default.string().min(1).max(50).optional().messages({
        'string.min': 'El tag no puede estar vacío',
        'string.max': 'El tag no puede exceder 50 caracteres',
    }),
    data: joi_1.default.object().optional().messages({
        'object.base': 'Los datos deben ser un objeto válido',
    }),
    category: joi_1.default.string().min(1).max(50).required().messages({
        'string.min': 'La categoría no puede estar vacía',
        'string.max': 'La categoría no puede exceder 50 caracteres',
        'any.required': 'La categoría es requerida',
    }),
    type: joi_1.default.string().min(1).max(50).required().messages({
        'string.min': 'El tipo no puede estar vacío',
        'string.max': 'El tipo no puede exceder 50 caracteres',
        'any.required': 'El tipo es requerido',
    }),
    isActive: joi_1.default.boolean().default(true).messages({
        'boolean.base': 'El estado activo debe ser true o false',
    }),
});
// ============================================================================
// ESQUEMAS DE PAGINACIÓN Y FILTROS
// ============================================================================
exports.paginationSchema = joi_1.default.object({
    page: joi_1.default.number().min(1).default(1).messages({
        'number.min': 'La página debe ser mayor a 0',
    }),
    limit: joi_1.default.number().min(1).max(100).default(10).messages({
        'number.min': 'El límite debe ser mayor a 0',
        'number.max': 'El límite no puede exceder 100',
    }),
    offset: joi_1.default.number().min(0).default(0).messages({
        'number.min': 'El offset debe ser mayor o igual a 0',
    }),
    sortBy: joi_1.default.string().optional().messages({
        'string.base': 'El campo de ordenamiento debe ser una cadena',
    }),
    sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc').messages({
        'any.only': 'El orden debe ser asc o desc',
    }),
});
exports.dateRangeSchema = joi_1.default.object({
    startDate: joi_1.default.date().required().messages({
        'any.required': 'La fecha de inicio es requerida',
        'date.base': 'La fecha de inicio debe ser una fecha válida',
    }),
    endDate: joi_1.default.date().greater(joi_1.default.ref('startDate')).required().messages({
        'any.required': 'La fecha de fin es requerida',
        'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio',
        'date.base': 'La fecha de fin debe ser una fecha válida',
    }),
});
exports.locationFilterSchema = joi_1.default.object({
    latitude: joi_1.default.number().min(-90).max(90).required().messages({
        'number.min': 'La latitud debe estar entre -90 y 90',
        'number.max': 'La latitud debe estar entre -90 y 90',
        'any.required': 'La latitud es requerida',
    }),
    longitude: joi_1.default.number().min(-180).max(180).required().messages({
        'number.min': 'La longitud debe estar entre -180 y 180',
        'number.max': 'La longitud debe estar entre -180 y 180',
        'any.required': 'La longitud es requerida',
    }),
    radius: joi_1.default.number().min(0.1).max(100).default(10).messages({
        'number.min': 'El radio debe ser mayor a 0.1',
        'number.max': 'El radio no puede exceder 100',
    }),
});
exports.priceRangeSchema = joi_1.default.object({
    min: joi_1.default.number().min(0).required().messages({
        'number.min': 'El precio mínimo debe ser mayor o igual a 0',
        'any.required': 'El precio mínimo es requerido',
    }),
    max: joi_1.default.number().min(joi_1.default.ref('min')).required().messages({
        'number.min': 'El precio máximo debe ser mayor o igual al precio mínimo',
        'any.required': 'El precio máximo es requerido',
    }),
});
