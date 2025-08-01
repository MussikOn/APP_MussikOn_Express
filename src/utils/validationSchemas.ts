import Joi from 'joi';

// ============================================================================
// ESQUEMAS DE AUTENTICACIÓN
// ============================================================================

export const registerSchema = Joi.object({
  name: Joi.string()
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
  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 50 caracteres',
      'string.pattern.base':
        'El apellido solo puede contener letras y espacios',
      'any.required': 'El apellido es requerido',
    }),
  userEmail: Joi.string()
    .email({ tlds: { allow: false } })
    .max(100)
    .required()
    .messages({
      'string.email': 'El email debe tener un formato válido',
      'string.max': 'El email no puede exceder 100 caracteres',
      'any.required': 'El email es requerido',
    }),
  userPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/
    )
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.max': 'La contraseña no puede exceder 128 caracteres',
      'string.pattern.base':
        'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial',
      'any.required': 'La contraseña es requerida',
    }),
  roll: Joi.string()
    .valid(
      'musico',
      'eventCreator',
      'usuario',
      'adminJunior',
      'adminMidLevel',
      'adminSenior',
      'superAdmin'
    )
    .default('usuario')
    .messages({
      'any.only': 'El rol debe ser uno de los valores permitidos',
      'any.default': 'El rol por defecto es usuario',
    }),
});

export const loginSchema = Joi.object({
  userEmail: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'El email debe tener un formato válido',
      'any.required': 'El email es requerido',
    }),
  userPassword: Joi.string().required().messages({
    'any.required': 'La contraseña es requerida',
  }),
});

export const updateUserSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .optional()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras y espacios',
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .optional()
    .messages({
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 50 caracteres',
      'string.pattern.base':
        'El apellido solo puede contener letras y espacios',
    }),
  userPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/
    )
    .optional()
    .messages({
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.max': 'La contraseña no puede exceder 128 caracteres',
      'string.pattern.base':
        'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial',
    }),
});

// ============================================================================
// ESQUEMAS DE EVENTOS
// ============================================================================

export const createEventSchema = Joi.object({
  eventName: Joi.string().min(3).max(100).required().messages({
    'string.min': 'El nombre del evento debe tener al menos 3 caracteres',
    'string.max': 'El nombre del evento no puede exceder 100 caracteres',
    'any.required': 'El nombre del evento es requerido',
  }),
  eventType: Joi.string()
    .valid(
      'concierto',
      'boda',
      'culto',
      'evento_corporativo',
      'festival',
      'fiesta_privada',
      'graduacion',
      'cumpleanos',
      'otro'
    )
    .required()
    .messages({
      'any.only': 'El tipo de evento debe ser uno de los valores permitidos',
      'any.required': 'El tipo de evento es requerido',
    }),
  date: Joi.date().greater('now').required().messages({
    'date.greater': 'La fecha del evento debe ser futura',
    'any.required': 'La fecha del evento es requerida',
  }),
  time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'La hora debe tener formato HH:MM',
      'any.required': 'La hora del evento es requerida',
    }),
  location: Joi.string().min(5).max(200).required().messages({
    'string.min': 'La ubicación debe tener al menos 5 caracteres',
    'string.max': 'La ubicación no puede exceder 200 caracteres',
    'any.required': 'La ubicación es requerida',
  }),
  duration: Joi.string()
    .pattern(/^([0-9]+h\s*)?([0-9]+m)?$/)
    .required()
    .messages({
      'string.pattern.base':
        'La duración debe tener formato "Xh Ym" o "Xh" o "Ym"',
      'any.required': 'La duración es requerida',
    }),
  instrument: Joi.string()
    .valid(
      'guitarra',
      'piano',
      'bajo',
      'bateria',
      'saxofon',
      'trompeta',
      'violin',
      'canto',
      'teclado',
      'flauta',
      'otro'
    )
    .required()
    .messages({
      'any.only': 'El instrumento debe ser uno de los valores permitidos',
      'any.required': 'El instrumento es requerido',
    }),
  bringInstrument: Joi.boolean().required().messages({
    'any.required': 'Debe especificar si el músico debe traer su instrumento',
  }),
  comment: Joi.string().max(500).optional().messages({
    'string.max': 'El comentario no puede exceder 500 caracteres',
  }),
  budget: Joi.string()
    .pattern(/^\d+(\.\d{1,2})?$/)
    .required()
    .messages({
      'string.pattern.base': 'El presupuesto debe ser un número válido',
      'any.required': 'El presupuesto es requerido',
    }),
  flyerUrl: Joi.string().uri().optional().messages({
    'string.uri': 'La URL del flyer debe ser válida',
  }),
  songs: Joi.array().items(Joi.string().max(100)).max(20).optional().messages({
    'array.max': 'No puede especificar más de 20 canciones',
  }),
  recommendations: Joi.array()
    .items(Joi.string().max(200))
    .max(10)
    .optional()
    .messages({
      'array.max': 'No puede especificar más de 10 recomendaciones',
    }),
  mapsLink: Joi.string().uri().optional().messages({
    'string.uri': 'La URL de Google Maps debe ser válida',
  }),
});

export const updateEventSchema = Joi.object({
  eventName: Joi.string().min(3).max(100).optional().messages({
    'string.min': 'El nombre del evento debe tener al menos 3 caracteres',
    'string.max': 'El nombre del evento no puede exceder 100 caracteres',
  }),
  eventType: Joi.string()
    .valid(
      'concierto',
      'boda',
      'culto',
      'evento_corporativo',
      'festival',
      'fiesta_privada',
      'graduacion',
      'cumpleanos',
      'otro'
    )
    .optional()
    .messages({
      'any.only': 'El tipo de evento debe ser uno de los valores permitidos',
    }),
  date: Joi.date().greater('now').optional().messages({
    'date.greater': 'La fecha del evento debe ser futura',
  }),
  time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      'string.pattern.base': 'La hora debe tener formato HH:MM',
    }),
  location: Joi.string().min(5).max(200).optional().messages({
    'string.min': 'La ubicación debe tener al menos 5 caracteres',
    'string.max': 'La ubicación no puede exceder 200 caracteres',
  }),
  duration: Joi.string()
    .pattern(/^([0-9]+h\s*)?([0-9]+m)?$/)
    .optional()
    .messages({
      'string.pattern.base':
        'La duración debe tener formato "Xh Ym" o "Xh" o "Ym"',
    }),
  instrument: Joi.string()
    .valid(
      'guitarra',
      'piano',
      'bajo',
      'bateria',
      'saxofon',
      'trompeta',
      'violin',
      'canto',
      'teclado',
      'flauta',
      'otro'
    )
    .optional()
    .messages({
      'any.only': 'El instrumento debe ser uno de los valores permitidos',
    }),
  bringInstrument: Joi.boolean().optional().messages({
    'any.required': 'Debe especificar si el músico debe traer su instrumento',
  }),
  comment: Joi.string().max(500).optional().messages({
    'string.max': 'El comentario no puede exceder 500 caracteres',
  }),
  budget: Joi.string()
    .pattern(/^\d+(\.\d{1,2})?$/)
    .optional()
    .messages({
      'string.pattern.base': 'El presupuesto debe ser un número válido',
    }),
  flyerUrl: Joi.string().uri().optional().messages({
    'string.uri': 'La URL del flyer debe ser válida',
  }),
  songs: Joi.array().items(Joi.string().max(100)).max(20).optional().messages({
    'array.max': 'No puede especificar más de 20 canciones',
  }),
  recommendations: Joi.array()
    .items(Joi.string().max(200))
    .max(10)
    .optional()
    .messages({
      'array.max': 'No puede especificar más de 10 recomendaciones',
    }),
  mapsLink: Joi.string().uri().optional().messages({
    'string.uri': 'La URL de Google Maps debe ser válida',
  }),
});

// ============================================================================
// ESQUEMAS DE SOLICITUDES DE MÚSICOS
// ============================================================================

export const createMusicianRequestSchema = Joi.object({
  eventType: Joi.string()
    .valid(
      'concierto',
      'boda',
      'culto',
      'evento_corporativo',
      'festival',
      'fiesta_privada',
      'graduacion',
      'cumpleanos',
      'otro'
    )
    .required()
    .messages({
      'any.only': 'El tipo de evento debe ser uno de los valores permitidos',
      'any.required': 'El tipo de evento es requerido',
    }),
  date: Joi.date().greater('now').required().messages({
    'date.greater': 'La fecha debe ser futura',
    'any.required': 'La fecha es requerida',
  }),
  time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'La hora debe tener formato HH:MM',
      'any.required': 'La hora es requerida',
    }),
  location: Joi.string().min(5).max(200).required().messages({
    'string.min': 'La ubicación debe tener al menos 5 caracteres',
    'string.max': 'La ubicación no puede exceder 200 caracteres',
    'any.required': 'La ubicación es requerida',
  }),
  instrument: Joi.string()
    .valid(
      'guitarra',
      'piano',
      'bajo',
      'bateria',
      'saxofon',
      'trompeta',
      'violin',
      'canto',
      'teclado',
      'flauta',
      'otro'
    )
    .required()
    .messages({
      'any.only': 'El instrumento debe ser uno de los valores permitidos',
      'any.required': 'El instrumento es requerido',
    }),
  budget: Joi.number().min(0).max(999999).required().messages({
    'number.min': 'El presupuesto debe ser mayor o igual a 0',
    'number.max': 'El presupuesto no puede exceder 999,999',
    'any.required': 'El presupuesto es requerido',
  }),
  comments: Joi.string().max(500).optional().messages({
    'string.max': 'Los comentarios no pueden exceder 500 caracteres',
  }),
});

export const updateMusicianRequestSchema = Joi.object({
  eventType: Joi.string()
    .valid(
      'concierto',
      'boda',
      'culto',
      'evento_corporativo',
      'festival',
      'fiesta_privada',
      'graduacion',
      'cumpleanos',
      'otro'
    )
    .optional()
    .messages({
      'any.only': 'El tipo de evento debe ser uno de los valores permitidos',
    }),
  date: Joi.date().greater('now').optional().messages({
    'date.greater': 'La fecha debe ser futura',
  }),
  time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      'string.pattern.base': 'La hora debe tener formato HH:MM',
    }),
  location: Joi.string().min(5).max(200).optional().messages({
    'string.min': 'La ubicación debe tener al menos 5 caracteres',
    'string.max': 'La ubicación no puede exceder 200 caracteres',
  }),
  instrument: Joi.string()
    .valid(
      'guitarra',
      'piano',
      'bajo',
      'bateria',
      'saxofon',
      'trompeta',
      'violin',
      'canto',
      'teclado',
      'flauta',
      'otro'
    )
    .optional()
    .messages({
      'any.only': 'El instrumento debe ser uno de los valores permitidos',
    }),
  budget: Joi.number().min(0).max(999999).optional().messages({
    'number.min': 'El presupuesto debe ser mayor o igual a 0',
    'number.max': 'El presupuesto no puede exceder 999,999',
  }),
  comments: Joi.string().max(500).optional().messages({
    'string.max': 'Los comentarios no pueden exceder 500 caracteres',
  }),
});

// ============================================================================
// ESQUEMAS DE CHAT
// ============================================================================

export const sendMessageSchema = Joi.object({
  conversationId: Joi.string().min(1).max(1500).required().messages({
    'string.min': 'El ID de conversación es requerido',
    'string.max': 'El ID de conversación es demasiado largo',
    'any.required': 'El ID de conversación es requerido',
  }),
  content: Joi.string().min(1).max(1000).required().messages({
    'string.min': 'El mensaje no puede estar vacío',
    'string.max': 'El mensaje no puede exceder 1000 caracteres',
    'any.required': 'El contenido del mensaje es requerido',
  }),
  type: Joi.string()
    .valid('text', 'image', 'audio', 'file')
    .default('text')
    .messages({
      'any.only': 'El tipo de mensaje debe ser uno de los valores permitidos',
    }),
  metadata: Joi.object().optional().messages({
    'object.base': 'Los metadatos deben ser un objeto válido',
  }),
});

export const createConversationSchema = Joi.object({
  participants: Joi.array()
    .items(Joi.string().email())
    .min(2)
    .max(10)
    .required()
    .messages({
      'array.min': 'Debe haber al menos 2 participantes',
      'array.max': 'No puede haber más de 10 participantes',
      'any.required': 'Los participantes son requeridos',
    }),
  title: Joi.string().min(1).max(100).optional().messages({
    'string.min': 'El título no puede estar vacío',
    'string.max': 'El título no puede exceder 100 caracteres',
  }),
  type: Joi.string().valid('private', 'group').default('private').messages({
    'any.only': 'El tipo de conversación debe ser private o group',
  }),
});

// ============================================================================
// ESQUEMAS DE PAGOS
// ============================================================================

export const createPaymentMethodSchema = Joi.object({
  type: Joi.string()
    .valid('card', 'bank_transfer', 'paypal', 'stripe')
    .required()
    .messages({
      'any.only':
        'El tipo de método de pago debe ser uno de los valores permitidos',
      'any.required': 'El tipo de método de pago es requerido',
    }),
  cardNumber: Joi.string()
    .when('type', {
      is: 'card',
      then: Joi.string()
        .pattern(/^\d{13,19}$/)
        .required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      'string.pattern.base':
        'El número de tarjeta debe tener entre 13 y 19 dígitos',
      'any.required': 'El número de tarjeta es requerido para tarjetas',
      'any.forbidden':
        'El número de tarjeta no es necesario para este tipo de método',
    }),
  expiryMonth: Joi.number()
    .when('type', {
      is: 'card',
      then: Joi.number().min(1).max(12).required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      'number.min': 'El mes de expiración debe estar entre 1 y 12',
      'number.max': 'El mes de expiración debe estar entre 1 y 12',
      'any.required': 'El mes de expiración es requerido para tarjetas',
      'any.forbidden':
        'El mes de expiración no es necesario para este tipo de método',
    }),
  expiryYear: Joi.number()
    .when('type', {
      is: 'card',
      then: Joi.number()
        .min(new Date().getFullYear())
        .max(new Date().getFullYear() + 20)
        .required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      'number.min': 'El año de expiración debe ser futuro',
      'number.max':
        'El año de expiración no puede ser más de 20 años en el futuro',
      'any.required': 'El año de expiración es requerido para tarjetas',
      'any.forbidden':
        'El año de expiración no es necesario para este tipo de método',
    }),
  cvc: Joi.string()
    .when('type', {
      is: 'card',
      then: Joi.string()
        .pattern(/^\d{3,4}$/)
        .required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      'string.pattern.base': 'El CVC debe tener 3 o 4 dígitos',
      'any.required': 'El CVC es requerido para tarjetas',
      'any.forbidden': 'El CVC no es necesario para este tipo de método',
    }),
  billingAddress: Joi.object({
    line1: Joi.string().min(5).max(100).required(),
    line2: Joi.string().max(100).optional(),
    city: Joi.string().min(2).max(50).required(),
    state: Joi.string().min(2).max(50).required(),
    postalCode: Joi.string()
      .pattern(/^\d{5}(-\d{4})?$/)
      .required(),
    country: Joi.string().min(2).max(50).required(),
  })
    .when('type', {
      is: 'card',
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      'any.required': 'La dirección de facturación es requerida para tarjetas',
      'object.base': 'La dirección de facturación debe ser un objeto válido',
    }),
});

export const createPaymentIntentSchema = Joi.object({
  amount: Joi.number().min(0.01).max(999999.99).required().messages({
    'number.min': 'El monto debe ser mayor a 0',
    'number.max': 'El monto no puede exceder 999,999.99',
    'any.required': 'El monto es requerido',
  }),
  currency: Joi.string().valid('EUR', 'USD', 'GBP').default('EUR').messages({
    'any.only': 'La moneda debe ser EUR, USD o GBP',
  }),
  description: Joi.string().min(1).max(255).required().messages({
    'string.min': 'La descripción no puede estar vacía',
    'string.max': 'La descripción no puede exceder 255 caracteres',
    'any.required': 'La descripción es requerida',
  }),
  metadata: Joi.object().optional().messages({
    'object.base': 'Los metadatos deben ser un objeto válido',
  }),
});

export const createInvoiceSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        description: Joi.string().min(1).max(255).required(),
        quantity: Joi.number().min(1).max(999).required(),
        unitPrice: Joi.number().min(0.01).max(999999.99).required(),
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.min': 'Debe haber al menos un item',
      'array.max': 'No puede haber más de 50 items',
      'any.required': 'Los items son requeridos',
    }),
  dueDate: Joi.date().greater('now').optional().messages({
    'date.greater': 'La fecha de vencimiento debe ser futura',
  }),
  eventId: Joi.string().min(1).max(1500).optional().messages({
    'string.min': 'El ID del evento es requerido si se proporciona',
    'string.max': 'El ID del evento es demasiado largo',
  }),
});

// ============================================================================
// ESQUEMAS DE BÚSQUEDA
// ============================================================================

export const searchEventsSchema = Joi.object({
  query: Joi.string().min(1).max(100).optional().messages({
    'string.min': 'El término de búsqueda no puede estar vacío',
    'string.max': 'El término de búsqueda no puede exceder 100 caracteres',
  }),
  status: Joi.string()
    .valid(
      'pending_musician',
      'musician_assigned',
      'completed',
      'cancelled',
      'musician_cancelled'
    )
    .optional()
    .messages({
      'any.only': 'El estado debe ser uno de los valores permitidos',
    }),
  eventType: Joi.string()
    .valid(
      'concierto',
      'boda',
      'culto',
      'evento_corporativo',
      'festival',
      'fiesta_privada',
      'graduacion',
      'cumpleanos',
      'otro'
    )
    .optional()
    .messages({
      'any.only': 'El tipo de evento debe ser uno de los valores permitidos',
    }),
  instrument: Joi.string()
    .valid(
      'guitarra',
      'piano',
      'bajo',
      'bateria',
      'saxofon',
      'trompeta',
      'violin',
      'canto',
      'teclado',
      'flauta',
      'otro'
    )
    .optional()
    .messages({
      'any.only': 'El instrumento debe ser uno de los valores permitidos',
    }),
  dateFrom: Joi.date().optional().messages({
    'date.base': 'La fecha de inicio debe ser una fecha válida',
  }),
  dateTo: Joi.date().greater(Joi.ref('dateFrom')).optional().messages({
    'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio',
    'date.base': 'La fecha de fin debe ser una fecha válida',
  }),
  location: Joi.string().min(1).max(200).optional().messages({
    'string.min': 'La ubicación no puede estar vacía',
    'string.max': 'La ubicación no puede exceder 200 caracteres',
  }),
  budget: Joi.number().min(0).max(999999).optional().messages({
    'number.min': 'El presupuesto debe ser mayor o igual a 0',
    'number.max': 'El presupuesto no puede exceder 999,999',
  }),
  budgetMax: Joi.number()
    .min(Joi.ref('budget'))
    .max(999999)
    .optional()
    .messages({
      'number.min':
        'El presupuesto máximo debe ser mayor o igual al presupuesto mínimo',
      'number.max': 'El presupuesto máximo no puede exceder 999,999',
    }),
  limit: Joi.number().min(1).max(50).default(20).messages({
    'number.min': 'El límite debe ser mayor a 0',
    'number.max': 'El límite no puede exceder 50',
  }),
  offset: Joi.number().min(0).default(0).messages({
    'number.min': 'El offset debe ser mayor o igual a 0',
  }),
  sortBy: Joi.string()
    .valid('date', 'budget', 'createdAt', 'eventName')
    .default('date')
    .messages({
      'any.only':
        'El campo de ordenamiento debe ser uno de los valores permitidos',
    }),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc').messages({
    'any.only': 'El orden debe ser asc o desc',
  }),
});

// ============================================================================
// ESQUEMAS DE GEOLOCALIZACIÓN
// ============================================================================

export const coordinatesSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'La latitud debe estar entre -90 y 90',
    'number.max': 'La latitud debe estar entre -90 y 90',
    'any.required': 'La latitud es requerida',
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'La longitud debe estar entre -180 y 180',
    'number.max': 'La longitud debe estar entre -180 y 180',
    'any.required': 'La longitud es requerida',
  }),
});

export const geocodeAddressSchema = Joi.object({
  address: Joi.string().min(5).max(500).required().messages({
    'string.min': 'La dirección debe tener al menos 5 caracteres',
    'string.max': 'La dirección no puede exceder 500 caracteres',
    'any.required': 'La dirección es requerida',
  }),
  country: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'El país debe tener al menos 2 caracteres',
    'string.max': 'El país no puede exceder 50 caracteres',
  }),
});

export const optimizeRouteSchema = Joi.object({
  waypoints: Joi.array()
    .items(
      Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
      })
    )
    .min(2)
    .max(25)
    .required()
    .messages({
      'array.min': 'Debe haber al menos 2 waypoints',
      'array.max': 'No puede haber más de 25 waypoints',
      'any.required': 'Los waypoints son requeridos',
    }),
  mode: Joi.string()
    .valid('driving', 'walking', 'bicycling', 'transit')
    .default('driving')
    .messages({
      'any.only': 'El modo debe ser uno de los valores permitidos',
    }),
  avoid: Joi.array()
    .items(Joi.string().valid('tolls', 'highways', 'ferries'))
    .optional()
    .messages({
      'array.base': 'Los elementos a evitar deben ser un array',
    }),
});

// ============================================================================
// ESQUEMAS DE ADMINISTRACIÓN
// ============================================================================

export const createAdminSchema = Joi.object({
  name: Joi.string()
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
  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 50 caracteres',
      'string.pattern.base':
        'El apellido solo puede contener letras y espacios',
      'any.required': 'El apellido es requerido',
    }),
  userEmail: Joi.string()
    .email({ tlds: { allow: false } })
    .max(100)
    .required()
    .messages({
      'string.email': 'El email debe tener un formato válido',
      'string.max': 'El email no puede exceder 100 caracteres',
      'any.required': 'El email es requerido',
    }),
  userPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/
    )
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.max': 'La contraseña no puede exceder 128 caracteres',
      'string.pattern.base':
        'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial',
      'any.required': 'La contraseña es requerida',
    }),
  roll: Joi.string()
    .valid('adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin')
    .required()
    .messages({
      'any.only': 'El rol debe ser uno de los valores permitidos',
      'any.required': 'El rol es requerido',
    }),
});

export const updateAdminSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .optional()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras y espacios',
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .optional()
    .messages({
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 50 caracteres',
      'string.pattern.base':
        'El apellido solo puede contener letras y espacios',
    }),
  userEmail: Joi.string()
    .email({ tlds: { allow: false } })
    .max(100)
    .optional()
    .messages({
      'string.email': 'El email debe tener un formato válido',
      'string.max': 'El email no puede exceder 100 caracteres',
    }),
  roll: Joi.string()
    .valid('adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin')
    .optional()
    .messages({
      'any.only': 'El rol debe ser uno de los valores permitidos',
    }),
  status: Joi.boolean().optional().messages({
    'boolean.base': 'El estado debe ser true o false',
  }),
});

// ============================================================================
// ESQUEMAS DE NOTIFICACIONES PUSH
// ============================================================================

export const pushSubscriptionSchema = Joi.object({
  endpoint: Joi.string().uri().required().messages({
    'string.uri': 'El endpoint debe ser una URL válida',
    'any.required': 'El endpoint es requerido',
  }),
  keys: Joi.object({
    p256dh: Joi.string().min(1).required().messages({
      'string.min': 'La clave p256dh es requerida',
      'any.required': 'La clave p256dh es requerida',
    }),
    auth: Joi.string().min(1).required().messages({
      'string.min': 'La clave auth es requerida',
      'any.required': 'La clave auth es requerida',
    }),
  })
    .required()
    .messages({
      'any.required': 'Las claves son requeridas',
    }),
  isActive: Joi.boolean().default(true).messages({
    'boolean.base': 'El estado activo debe ser true o false',
  }),
});

export const notificationTemplateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'El nombre no puede estar vacío',
    'string.max': 'El nombre no puede exceder 100 caracteres',
    'any.required': 'El nombre es requerido',
  }),
  title: Joi.string().min(1).max(100).required().messages({
    'string.min': 'El título no puede estar vacío',
    'string.max': 'El título no puede exceder 100 caracteres',
    'any.required': 'El título es requerido',
  }),
  body: Joi.string().min(1).max(500).required().messages({
    'string.min': 'El cuerpo no puede estar vacío',
    'string.max': 'El cuerpo no puede exceder 500 caracteres',
    'any.required': 'El cuerpo es requerido',
  }),
  icon: Joi.string().uri().optional().messages({
    'string.uri': 'El icono debe ser una URL válida',
  }),
  badge: Joi.string().uri().optional().messages({
    'string.uri': 'El badge debe ser una URL válida',
  }),
  tag: Joi.string().min(1).max(50).optional().messages({
    'string.min': 'El tag no puede estar vacío',
    'string.max': 'El tag no puede exceder 50 caracteres',
  }),
  data: Joi.object().optional().messages({
    'object.base': 'Los datos deben ser un objeto válido',
  }),
  category: Joi.string().min(1).max(50).required().messages({
    'string.min': 'La categoría no puede estar vacía',
    'string.max': 'La categoría no puede exceder 50 caracteres',
    'any.required': 'La categoría es requerida',
  }),
  type: Joi.string().min(1).max(50).required().messages({
    'string.min': 'El tipo no puede estar vacío',
    'string.max': 'El tipo no puede exceder 50 caracteres',
    'any.required': 'El tipo es requerido',
  }),
  isActive: Joi.boolean().default(true).messages({
    'boolean.base': 'El estado activo debe ser true o false',
  }),
});

// ============================================================================
// ESQUEMAS DE PAGINACIÓN Y FILTROS
// ============================================================================

export const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1).messages({
    'number.min': 'La página debe ser mayor a 0',
  }),
  limit: Joi.number().min(1).max(100).default(10).messages({
    'number.min': 'El límite debe ser mayor a 0',
    'number.max': 'El límite no puede exceder 100',
  }),
  offset: Joi.number().min(0).default(0).messages({
    'number.min': 'El offset debe ser mayor o igual a 0',
  }),
  sortBy: Joi.string().optional().messages({
    'string.base': 'El campo de ordenamiento debe ser una cadena',
  }),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'El orden debe ser asc o desc',
  }),
});

export const dateRangeSchema = Joi.object({
  startDate: Joi.date().required().messages({
    'any.required': 'La fecha de inicio es requerida',
    'date.base': 'La fecha de inicio debe ser una fecha válida',
  }),
  endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
    'any.required': 'La fecha de fin es requerida',
    'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio',
    'date.base': 'La fecha de fin debe ser una fecha válida',
  }),
});

export const locationFilterSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'La latitud debe estar entre -90 y 90',
    'number.max': 'La latitud debe estar entre -90 y 90',
    'any.required': 'La latitud es requerida',
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'La longitud debe estar entre -180 y 180',
    'number.max': 'La longitud debe estar entre -180 y 180',
    'any.required': 'La longitud es requerida',
  }),
  radius: Joi.number().min(0.1).max(100).default(10).messages({
    'number.min': 'El radio debe ser mayor a 0.1',
    'number.max': 'El radio no puede exceder 100',
  }),
});

export const priceRangeSchema = Joi.object({
  min: Joi.number().min(0).required().messages({
    'number.min': 'El precio mínimo debe ser mayor o igual a 0',
    'any.required': 'El precio mínimo es requerido',
  }),
  max: Joi.number().min(Joi.ref('min')).required().messages({
    'number.min': 'El precio máximo debe ser mayor o igual al precio mínimo',
    'any.required': 'El precio máximo es requerido',
  }),
});
