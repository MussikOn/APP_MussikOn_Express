import Joi from 'joi';

// Data Transfer Objects for input validation
// Auth DTOs
export const registerDTO = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/
    )
    .required(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  role: Joi.string()
    .valid('user', 'musician', 'admin', 'super_admin')
    .default('user'),
  profileImage: Joi.string().uri().optional(),
});

export const loginDTO = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const googleAuthDTO = Joi.object({
  idToken: Joi.string().required(),
  accessToken: Joi.string().optional(),
});

// Event DTOs
export const createEventDTO = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  date: Joi.date().greater('now').required(),
  location: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    }).optional(),
  }).required(),
  budget: Joi.number().min(0).required(),
  genre: Joi.string().required(),
  duration: Joi.number().min(1).max(24).required(),
  attendees: Joi.number().min(1).required(),
  requirements: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
});

export const updateEventDTO = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  date: Joi.date().greater('now').optional(),
  location: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    }).optional(),
  }).optional(),
  budget: Joi.number().min(0).optional(),
  genre: Joi.string().optional(),
  duration: Joi.number().min(1).max(24).optional(),
  attendees: Joi.number().min(1).optional(),
  requirements: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
});

// Musician Request DTOs
export const createMusicianRequestDTO = Joi.object({
  eventId: Joi.string().required(),
  message: Joi.string().min(10).max(500).required(),
  proposedPrice: Joi.number().min(0).optional(),
  availability: Joi.object({
    startTime: Joi.date().required(),
    endTime: Joi.date().greater(Joi.ref('startTime')).required(),
  }).optional(),
});

export const updateMusicianRequestDTO = Joi.object({
  status: Joi.string()
    .valid('pending', 'accepted', 'rejected', 'canceled')
    .required(),
  responseMessage: Joi.string().min(1).max(500).optional(),
});

// Search DTOs
export const searchEventsDTO = Joi.object({
  query: Joi.string().min(1).max(100).optional(),
  genre: Joi.string().optional(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    radius: Joi.number().min(1).max(100).default(10),
  }).optional(),
  dateRange: Joi.object({
    start: Joi.date().required(),
    end: Joi.date().greater(Joi.ref('start')).required(),
  }).optional(),
  budgetRange: Joi.object({
    min: Joi.number().min(0).required(),
    max: Joi.number().min(Joi.ref('min')).required(),
  }).optional(),
  limit: Joi.number().min(1).max(50).default(10),
  offset: Joi.number().min(0).default(0),
});

export const searchMusicianRequestsDTO = Joi.object({
  eventId: Joi.string().optional(),
  status: Joi.string()
    .valid('pending', 'accepted', 'rejected', 'canceled')
    .optional(),
  musicianId: Joi.string().optional(),
  limit: Joi.number().min(1).max(50).default(10),
  offset: Joi.number().min(0).default(0),
});

export const searchUsersDTO = Joi.object({
  query: Joi.string().min(1).max(100).optional(),
  role: Joi.string()
    .valid('user', 'musician', 'admin', 'super_admin')
    .optional(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    radius: Joi.number().min(1).max(100).default(10),
  }).optional(),
  limit: Joi.number().min(1).max(50).default(10),
  offset: Joi.number().min(0).default(0),
});

// Analytics DTOs
export const analyticsEventsDTO = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  groupBy: Joi.string().valid('day', 'week', 'month').default('day'),
  filters: Joi.object({
    genre: Joi.string().optional(),
    status: Joi.string().valid('active', 'completed', 'canceled').optional(),
    location: Joi.string().optional(),
  }).optional(),
});

export const analyticsRequestsDTO = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  groupBy: Joi.string().valid('day', 'week', 'month').default('day'),
  filters: Joi.object({
    status: Joi.string()
      .valid('pending', 'accepted', 'rejected', 'canceled')
      .optional(),
    eventId: Joi.string().optional(),
    musicianId: Joi.string().optional(),
  }).optional(),
});

export const analyticsUsersDTO = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  groupBy: Joi.string().valid('day', 'week', 'month').default('day'),
  filters: Joi.object({
    role: Joi.string()
      .valid('user', 'musician', 'admin', 'super_admin')
      .optional(),
    location: Joi.string().optional(),
  }).optional(),
});

// Chat DTOs
export const sendMessageDTO = Joi.object({
  receiverId: Joi.string().required(),
  content: Joi.string().min(1).max(1000).required(),
  messageType: Joi.string().valid('text', 'image', 'file').default('text'),
  metadata: Joi.object().optional(),
});

export const createChatRoomDTO = Joi.object({
  participants: Joi.array().items(Joi.string()).min(2).required(),
  name: Joi.string().min(1).max(100).optional(),
  isGroup: Joi.boolean().default(false),
});

// Geolocation DTOs
export const coordinatesDTO = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

export const geocodeAddressDTO = Joi.object({
  address: Joi.string().min(1).max(500).required(),
  country: Joi.string().optional(),
});

export const reverseGeocodeDTO = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

export const calculateDistanceDTO = Joi.object({
  origin: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }).required(),
  destination: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }).required(),
});

export const isWithinRadiusDTO = Joi.object({
  center: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }).required(),
  point: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }).required(),
  radius: Joi.number().min(0.1).max(100).required(),
});

export const optimizeRouteDTO = Joi.object({
  waypoints: Joi.array()
    .items(
      Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
      })
    )
    .min(2)
    .max(25)
    .required(),
  mode: Joi.string()
    .valid('driving', 'walking', 'bicycling', 'transit')
    .default('driving'),
  avoid: Joi.array()
    .items(Joi.string().valid('tolls', 'highways', 'ferries'))
    .optional(),
});

// Payment DTOs
export const createPaymentMethodDTO = Joi.object({
  type: Joi.string().valid('card', 'bank_account', 'paypal').required(),
  cardNumber: Joi.string().when('type', {
    is: 'card',
    then: Joi.string()
      .pattern(/^\d{13,19}$/)
      .required(),
    otherwise: Joi.forbidden(),
  }),
  expiryMonth: Joi.number().when('type', {
    is: 'card',
    then: Joi.number().min(1).max(12).required(),
    otherwise: Joi.forbidden(),
  }),
  expiryYear: Joi.number().when('type', {
    is: 'card',
    then: Joi.number()
      .min(new Date().getFullYear())
      .max(new Date().getFullYear() + 20)
      .required(),
    otherwise: Joi.forbidden(),
  }),
  cvc: Joi.string().when('type', {
    is: 'card',
    then: Joi.string()
      .pattern(/^\d{3,4}$/)
      .required(),
    otherwise: Joi.forbidden(),
  }),
  billingAddress: Joi.object({
    line1: Joi.string().required(),
    line2: Joi.string().optional(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
  }).when('type', {
    is: 'card',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

export const createPaymentIntentDTO = Joi.object({
  amount: Joi.number().min(0.01).max(999999.99).required(),
  currency: Joi.string().valid('USD', 'EUR', 'MXN', 'COP').default('USD'),
  description: Joi.string().min(1).max(255).required(),
  metadata: Joi.object().optional(),
});

export const createInvoiceDTO = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        description: Joi.string().min(1).max(255).required(),
        quantity: Joi.number().min(1).required(),
        unitPrice: Joi.number().min(0.01).required(),
      })
    )
    .min(1)
    .required(),
  description: Joi.string().min(1).max(500).optional(),
  dueDate: Joi.date().greater('now').optional(),
  metadata: Joi.object().optional(),
});

export const processPaymentDTO = Joi.object({
  paymentIntentId: Joi.string().required(),
  paymentMethodId: Joi.string().required(),
});

export const processRefundDTO = Joi.object({
  paymentIntentId: Joi.string().required(),
  amount: Joi.number().min(0.01).required(),
  reason: Joi.string().min(1).max(255).required(),
});

export const validatePaymentMethodDTO = Joi.object({
  cardNumber: Joi.string()
    .pattern(/^\d{13,19}$/)
    .required(),
  expiryMonth: Joi.number().min(1).max(12).required(),
  expiryYear: Joi.number()
    .min(new Date().getFullYear())
    .max(new Date().getFullYear() + 20)
    .required(),
  cvc: Joi.string()
    .pattern(/^\d{3,4}$/)
    .required(),
});

// Admin DTOs
export const createAdminDTO = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/
    )
    .required(),
  role: Joi.string().valid('admin', 'super_admin').required(),
  permissions: Joi.array().items(Joi.string()).optional(),
});

export const updateAdminDTO = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('admin', 'super_admin').optional(),
  permissions: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().optional(),
});

// Image DTOs
export const uploadImageDTO = Joi.object({
  type: Joi.string().valid('profile', 'event', 'chat').required(),
  description: Joi.string().min(1).max(255).optional(),
});

// Pagination DTOs
export const paginationDTO = Joi.object({
  limit: Joi.number().min(1).max(100).default(10),
  offset: Joi.number().min(0).default(0),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// Filter DTOs
export const dateRangeDTO = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
});

export const locationFilterDTO = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  radius: Joi.number().min(0.1).max(100).default(10),
});

export const priceRangeDTO = Joi.object({
  min: Joi.number().min(0).required(),
  max: Joi.number().min(Joi.ref('min')).required(),
});

// DTOs para el sistema de depósitos DPT
export const reportDepositDTO = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.base': 'El monto debe ser un número',
    'number.positive': 'El monto debe ser positivo',
    'any.required': 'El monto es requerido'
  }),
  currency: Joi.string().valid('EUR', 'USD', 'GBP').default('EUR').messages({
    'string.base': 'La moneda debe ser una cadena de texto',
    'any.only': 'La moneda debe ser EUR, USD o GBP'
  }),
  depositDate: Joi.date().max('now').required().messages({
    'date.base': 'La fecha debe ser válida',
    'date.max': 'La fecha no puede ser futura',
    'any.required': 'La fecha del depósito es requerida'
  }),
  bankName: Joi.string().min(2).max(100).required().messages({
    'string.base': 'El nombre del banco debe ser una cadena de texto',
    'string.min': 'El nombre del banco debe tener al menos 2 caracteres',
    'string.max': 'El nombre del banco no puede exceder 100 caracteres',
    'any.required': 'El nombre del banco es requerido'
  }),
  accountNumber: Joi.string().min(5).max(50).required().messages({
    'string.base': 'El número de cuenta debe ser una cadena de texto',
    'string.min': 'El número de cuenta debe tener al menos 5 caracteres',
    'string.max': 'El número de cuenta no puede exceder 50 caracteres',
    'any.required': 'El número de cuenta es requerido'
  }),
  reference: Joi.string().min(3).max(100).required().messages({
    'string.base': 'La referencia debe ser una cadena de texto',
    'string.min': 'La referencia debe tener al menos 3 caracteres',
    'string.max': 'La referencia no puede exceder 100 caracteres',
    'any.required': 'La referencia es requerida'
  }),
  purpose: Joi.string().min(5).max(200).required().messages({
    'string.base': 'El propósito debe ser una cadena de texto',
    'string.min': 'El propósito debe tener al menos 5 caracteres',
    'string.max': 'El propósito no puede exceder 200 caracteres',
    'any.required': 'El propósito es requerido'
  })
});

export const rejectDepositDTO = Joi.object({
  reason: Joi.string().min(10).max(500).required().messages({
    'string.base': 'La razón debe ser una cadena de texto',
    'string.min': 'La razón debe tener al menos 10 caracteres',
    'string.max': 'La razón no puede exceder 500 caracteres',
    'any.required': 'La razón del rechazo es requerida'
  })
});

export const depositStatusDTO = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected').messages({
    'string.base': 'El estado debe ser una cadena de texto',
    'any.only': 'El estado debe ser pending, approved o rejected'
  })
});
