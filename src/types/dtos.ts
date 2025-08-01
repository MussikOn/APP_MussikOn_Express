import Joi from 'joi';

// DTOs para Autenticación
export const LoginDTO = Joi.object({
  userEmail: Joi.string().email().required().messages({
    'string.email': 'Email debe tener un formato válido',
    'any.required': 'Email es requerido',
  }),
  userPassword: Joi.string().min(6).required().messages({
    'string.min': 'Contraseña debe tener al menos 6 caracteres',
    'any.required': 'Contraseña es requerida',
  }),
});

export const RegisterDTO = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Nombre debe tener al menos 2 caracteres',
    'string.max': 'Nombre no puede exceder 50 caracteres',
    'any.required': 'Nombre es requerido',
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Apellido debe tener al menos 2 caracteres',
    'string.max': 'Apellido no puede exceder 50 caracteres',
    'any.required': 'Apellido es requerido',
  }),
  userEmail: Joi.string().email().required().messages({
    'string.email': 'Email debe tener un formato válido',
    'any.required': 'Email es requerido',
  }),
  userPassword: Joi.string().min(6).required().messages({
    'string.min': 'Contraseña debe tener al menos 6 caracteres',
    'any.required': 'Contraseña es requerida',
  }),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Teléfono debe tener un formato válido',
      'any.required': 'Teléfono es requerido',
    }),
  roll: Joi.string()
    .valid('admin', 'superadmin', 'eventCreator', 'musician')
    .default('eventCreator')
    .messages({
      'any.only':
        'Rol debe ser uno de: admin, superadmin, eventCreator, musician',
    }),
});

// DTOs para Eventos
export const CreateEventDTO = Joi.object({
  eventName: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Nombre del evento debe tener al menos 3 caracteres',
    'string.max': 'Nombre del evento no puede exceder 100 caracteres',
    'any.required': 'Nombre del evento es requerido',
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
      'any.only': 'Tipo de evento debe ser uno de los valores permitidos',
      'any.required': 'Tipo de evento es requerido',
    }),
  date: Joi.date().iso().min('now').required().messages({
    'date.base': 'Fecha debe tener un formato válido',
    'date.min': 'Fecha debe ser futura',
    'any.required': 'Fecha es requerida',
  }),
  time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'Hora debe tener formato HH:MM',
      'any.required': 'Hora es requerida',
    }),
  location: Joi.string().min(5).max(200).required().messages({
    'string.min': 'Ubicación debe tener al menos 5 caracteres',
    'string.max': 'Ubicación no puede exceder 200 caracteres',
    'any.required': 'Ubicación es requerida',
  }),
  duration: Joi.string().min(1).max(50).required().messages({
    'string.min': 'Duración es requerida',
    'string.max': 'Duración no puede exceder 50 caracteres',
    'any.required': 'Duración es requerida',
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
      'any.only': 'Instrumento debe ser uno de los valores permitidos',
      'any.required': 'Instrumento es requerido',
    }),
  bringInstrument: Joi.boolean().default(false),
  comment: Joi.string().max(500).optional().messages({
    'string.max': 'Comentario no puede exceder 500 caracteres',
  }),
  budget: Joi.string().max(50).optional().messages({
    'string.max': 'Presupuesto no puede exceder 50 caracteres',
  }),
  songs: Joi.array().items(Joi.string().max(100)).max(20).optional().messages({
    'array.max': 'No se pueden agregar más de 20 canciones',
  }),
  recommendations: Joi.array()
    .items(Joi.string().max(200))
    .max(10)
    .optional()
    .messages({
      'array.max': 'No se pueden agregar más de 10 recomendaciones',
    }),
  mapsLink: Joi.string().uri().optional().messages({
    'string.uri': 'Enlace de mapa debe ser una URL válida',
  }),
});

// DTOs para Imágenes
export const UploadImageDTO = Joi.object({
  category: Joi.string()
    .valid('profile', 'post', 'event', 'gallery', 'admin')
    .required()
    .messages({
      'any.only': 'Categoría debe ser una de las permitidas',
      'any.required': 'Categoría es requerida',
    }),
  description: Joi.string().max(200).optional().messages({
    'string.max': 'Descripción no puede exceder 200 caracteres',
  }),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional().messages({
    'array.max': 'No se pueden agregar más de 10 etiquetas',
  }),
  isPublic: Joi.boolean().default(true),
  metadata: Joi.object().optional(),
});

// DTOs para Chat
export const CreateMessageDTO = Joi.object({
  conversationId: Joi.string().required().messages({
    'any.required': 'ID de conversación es requerido',
  }),
  content: Joi.string().min(1).max(1000).required().messages({
    'string.min': 'Mensaje no puede estar vacío',
    'string.max': 'Mensaje no puede exceder 1000 caracteres',
    'any.required': 'Contenido del mensaje es requerido',
  }),
  type: Joi.string()
    .valid('text', 'image', 'audio', 'file')
    .default('text')
    .messages({
      'any.only': 'Tipo debe ser uno de: text, image, audio, file',
    }),
});

// DTOs para Actualización de Usuario
export const UpdateUserDTO = Joi.object({
  name: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Nombre debe tener al menos 2 caracteres',
    'string.max': 'Nombre no puede exceder 50 caracteres',
  }),
  lastName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Apellido debe tener al menos 2 caracteres',
    'string.max': 'Apellido no puede exceder 50 caracteres',
  }),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Teléfono debe tener un formato válido',
    }),
  roll: Joi.string()
    .valid('admin', 'superadmin', 'eventCreator', 'musician')
    .optional()
    .messages({
      'any.only':
        'Rol debe ser uno de: admin, superadmin, eventCreator, musician',
    }),
});

// DTOs para Filtros y Paginación
export const PaginationDTO = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Página debe ser un número',
    'number.integer': 'Página debe ser un número entero',
    'number.min': 'Página debe ser mayor a 0',
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Límite debe ser un número',
    'number.integer': 'Límite debe ser un número entero',
    'number.min': 'Límite debe ser mayor a 0',
    'number.max': 'Límite no puede exceder 100',
  }),
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'name', 'date')
    .default('createdAt')
    .messages({
      'any.only':
        'Ordenar por debe ser uno de: createdAt, updatedAt, name, date',
    }),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'Orden debe ser asc o desc',
  }),
});

export const EventFiltersDTO = PaginationDTO.keys({
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
      'any.only': 'Estado debe ser uno de los valores permitidos',
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
      'any.only': 'Tipo de evento debe ser uno de los valores permitidos',
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
      'any.only': 'Instrumento debe ser uno de los valores permitidos',
    }),
  dateFrom: Joi.date().iso().optional().messages({
    'date.base': 'Fecha desde debe tener un formato válido',
  }),
  dateTo: Joi.date().iso().min(Joi.ref('dateFrom')).optional().messages({
    'date.base': 'Fecha hasta debe tener un formato válido',
    'date.min': 'Fecha hasta debe ser posterior a fecha desde',
  }),
});
