"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceRangeDTO = exports.locationFilterDTO = exports.dateRangeDTO = exports.paginationDTO = exports.uploadImageDTO = exports.updateAdminDTO = exports.createAdminDTO = exports.validatePaymentMethodDTO = exports.processRefundDTO = exports.processPaymentDTO = exports.createInvoiceDTO = exports.createPaymentIntentDTO = exports.createPaymentMethodDTO = exports.optimizeRouteDTO = exports.isWithinRadiusDTO = exports.calculateDistanceDTO = exports.reverseGeocodeDTO = exports.geocodeAddressDTO = exports.coordinatesDTO = exports.createChatRoomDTO = exports.sendMessageDTO = exports.analyticsUsersDTO = exports.analyticsRequestsDTO = exports.analyticsEventsDTO = exports.searchUsersDTO = exports.searchMusicianRequestsDTO = exports.searchEventsDTO = exports.updateMusicianRequestDTO = exports.createMusicianRequestDTO = exports.updateEventDTO = exports.createEventDTO = exports.googleAuthDTO = exports.loginDTO = exports.registerDTO = void 0;
const joi_1 = __importDefault(require("joi"));
// Data Transfer Objects for input validation
// Auth DTOs
exports.registerDTO = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/).required(),
    phone: joi_1.default.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    role: joi_1.default.string().valid('user', 'musician', 'admin', 'super_admin').default('user'),
    profileImage: joi_1.default.string().uri().optional()
});
exports.loginDTO = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
});
exports.googleAuthDTO = joi_1.default.object({
    idToken: joi_1.default.string().required(),
    accessToken: joi_1.default.string().optional()
});
// Event DTOs
exports.createEventDTO = joi_1.default.object({
    title: joi_1.default.string().min(3).max(100).required(),
    description: joi_1.default.string().min(10).max(1000).required(),
    date: joi_1.default.date().greater('now').required(),
    location: joi_1.default.object({
        address: joi_1.default.string().required(),
        city: joi_1.default.string().required(),
        state: joi_1.default.string().required(),
        country: joi_1.default.string().required(),
        coordinates: joi_1.default.object({
            latitude: joi_1.default.number().min(-90).max(90).required(),
            longitude: joi_1.default.number().min(-180).max(180).required()
        }).optional()
    }).required(),
    budget: joi_1.default.number().min(0).required(),
    genre: joi_1.default.string().required(),
    duration: joi_1.default.number().min(1).max(24).required(),
    attendees: joi_1.default.number().min(1).required(),
    requirements: joi_1.default.array().items(joi_1.default.string()).optional(),
    images: joi_1.default.array().items(joi_1.default.string().uri()).optional()
});
exports.updateEventDTO = joi_1.default.object({
    title: joi_1.default.string().min(3).max(100).optional(),
    description: joi_1.default.string().min(10).max(1000).optional(),
    date: joi_1.default.date().greater('now').optional(),
    location: joi_1.default.object({
        address: joi_1.default.string().required(),
        city: joi_1.default.string().required(),
        state: joi_1.default.string().required(),
        country: joi_1.default.string().required(),
        coordinates: joi_1.default.object({
            latitude: joi_1.default.number().min(-90).max(90).required(),
            longitude: joi_1.default.number().min(-180).max(180).required()
        }).optional()
    }).optional(),
    budget: joi_1.default.number().min(0).optional(),
    genre: joi_1.default.string().optional(),
    duration: joi_1.default.number().min(1).max(24).optional(),
    attendees: joi_1.default.number().min(1).optional(),
    requirements: joi_1.default.array().items(joi_1.default.string()).optional(),
    images: joi_1.default.array().items(joi_1.default.string().uri()).optional()
});
// Musician Request DTOs
exports.createMusicianRequestDTO = joi_1.default.object({
    eventId: joi_1.default.string().required(),
    message: joi_1.default.string().min(10).max(500).required(),
    proposedPrice: joi_1.default.number().min(0).optional(),
    availability: joi_1.default.object({
        startTime: joi_1.default.date().required(),
        endTime: joi_1.default.date().greater(joi_1.default.ref('startTime')).required()
    }).optional()
});
exports.updateMusicianRequestDTO = joi_1.default.object({
    status: joi_1.default.string().valid('pending', 'accepted', 'rejected', 'canceled').required(),
    responseMessage: joi_1.default.string().min(1).max(500).optional()
});
// Search DTOs
exports.searchEventsDTO = joi_1.default.object({
    query: joi_1.default.string().min(1).max(100).optional(),
    genre: joi_1.default.string().optional(),
    location: joi_1.default.object({
        latitude: joi_1.default.number().min(-90).max(90).required(),
        longitude: joi_1.default.number().min(-180).max(180).required(),
        radius: joi_1.default.number().min(1).max(100).default(10)
    }).optional(),
    dateRange: joi_1.default.object({
        start: joi_1.default.date().required(),
        end: joi_1.default.date().greater(joi_1.default.ref('start')).required()
    }).optional(),
    budgetRange: joi_1.default.object({
        min: joi_1.default.number().min(0).required(),
        max: joi_1.default.number().min(joi_1.default.ref('min')).required()
    }).optional(),
    limit: joi_1.default.number().min(1).max(50).default(10),
    offset: joi_1.default.number().min(0).default(0)
});
exports.searchMusicianRequestsDTO = joi_1.default.object({
    eventId: joi_1.default.string().optional(),
    status: joi_1.default.string().valid('pending', 'accepted', 'rejected', 'canceled').optional(),
    musicianId: joi_1.default.string().optional(),
    limit: joi_1.default.number().min(1).max(50).default(10),
    offset: joi_1.default.number().min(0).default(0)
});
exports.searchUsersDTO = joi_1.default.object({
    query: joi_1.default.string().min(1).max(100).optional(),
    role: joi_1.default.string().valid('user', 'musician', 'admin', 'super_admin').optional(),
    location: joi_1.default.object({
        latitude: joi_1.default.number().min(-90).max(90).required(),
        longitude: joi_1.default.number().min(-180).max(180).required(),
        radius: joi_1.default.number().min(1).max(100).default(10)
    }).optional(),
    limit: joi_1.default.number().min(1).max(50).default(10),
    offset: joi_1.default.number().min(0).default(0)
});
// Analytics DTOs
exports.analyticsEventsDTO = joi_1.default.object({
    startDate: joi_1.default.date().required(),
    endDate: joi_1.default.date().greater(joi_1.default.ref('startDate')).required(),
    groupBy: joi_1.default.string().valid('day', 'week', 'month').default('day'),
    filters: joi_1.default.object({
        genre: joi_1.default.string().optional(),
        status: joi_1.default.string().valid('active', 'completed', 'canceled').optional(),
        location: joi_1.default.string().optional()
    }).optional()
});
exports.analyticsRequestsDTO = joi_1.default.object({
    startDate: joi_1.default.date().required(),
    endDate: joi_1.default.date().greater(joi_1.default.ref('startDate')).required(),
    groupBy: joi_1.default.string().valid('day', 'week', 'month').default('day'),
    filters: joi_1.default.object({
        status: joi_1.default.string().valid('pending', 'accepted', 'rejected', 'canceled').optional(),
        eventId: joi_1.default.string().optional(),
        musicianId: joi_1.default.string().optional()
    }).optional()
});
exports.analyticsUsersDTO = joi_1.default.object({
    startDate: joi_1.default.date().required(),
    endDate: joi_1.default.date().greater(joi_1.default.ref('startDate')).required(),
    groupBy: joi_1.default.string().valid('day', 'week', 'month').default('day'),
    filters: joi_1.default.object({
        role: joi_1.default.string().valid('user', 'musician', 'admin', 'super_admin').optional(),
        location: joi_1.default.string().optional()
    }).optional()
});
// Chat DTOs
exports.sendMessageDTO = joi_1.default.object({
    receiverId: joi_1.default.string().required(),
    content: joi_1.default.string().min(1).max(1000).required(),
    messageType: joi_1.default.string().valid('text', 'image', 'file').default('text'),
    metadata: joi_1.default.object().optional()
});
exports.createChatRoomDTO = joi_1.default.object({
    participants: joi_1.default.array().items(joi_1.default.string()).min(2).required(),
    name: joi_1.default.string().min(1).max(100).optional(),
    isGroup: joi_1.default.boolean().default(false)
});
// Geolocation DTOs
exports.coordinatesDTO = joi_1.default.object({
    latitude: joi_1.default.number().min(-90).max(90).required(),
    longitude: joi_1.default.number().min(-180).max(180).required()
});
exports.geocodeAddressDTO = joi_1.default.object({
    address: joi_1.default.string().min(1).max(500).required(),
    country: joi_1.default.string().optional()
});
exports.reverseGeocodeDTO = joi_1.default.object({
    latitude: joi_1.default.number().min(-90).max(90).required(),
    longitude: joi_1.default.number().min(-180).max(180).required()
});
exports.calculateDistanceDTO = joi_1.default.object({
    origin: joi_1.default.object({
        latitude: joi_1.default.number().min(-90).max(90).required(),
        longitude: joi_1.default.number().min(-180).max(180).required()
    }).required(),
    destination: joi_1.default.object({
        latitude: joi_1.default.number().min(-90).max(90).required(),
        longitude: joi_1.default.number().min(-180).max(180).required()
    }).required()
});
exports.isWithinRadiusDTO = joi_1.default.object({
    center: joi_1.default.object({
        latitude: joi_1.default.number().min(-90).max(90).required(),
        longitude: joi_1.default.number().min(-180).max(180).required()
    }).required(),
    point: joi_1.default.object({
        latitude: joi_1.default.number().min(-90).max(90).required(),
        longitude: joi_1.default.number().min(-180).max(180).required()
    }).required(),
    radius: joi_1.default.number().min(0.1).max(100).required()
});
exports.optimizeRouteDTO = joi_1.default.object({
    waypoints: joi_1.default.array().items(joi_1.default.object({
        latitude: joi_1.default.number().min(-90).max(90).required(),
        longitude: joi_1.default.number().min(-180).max(180).required()
    })).min(2).max(25).required(),
    mode: joi_1.default.string().valid('driving', 'walking', 'bicycling', 'transit').default('driving'),
    avoid: joi_1.default.array().items(joi_1.default.string().valid('tolls', 'highways', 'ferries')).optional()
});
// Payment DTOs
exports.createPaymentMethodDTO = joi_1.default.object({
    type: joi_1.default.string().valid('card', 'bank_account', 'paypal').required(),
    cardNumber: joi_1.default.string().when('type', {
        is: 'card',
        then: joi_1.default.string().pattern(/^\d{13,19}$/).required(),
        otherwise: joi_1.default.forbidden()
    }),
    expiryMonth: joi_1.default.number().when('type', {
        is: 'card',
        then: joi_1.default.number().min(1).max(12).required(),
        otherwise: joi_1.default.forbidden()
    }),
    expiryYear: joi_1.default.number().when('type', {
        is: 'card',
        then: joi_1.default.number().min(new Date().getFullYear()).max(new Date().getFullYear() + 20).required(),
        otherwise: joi_1.default.forbidden()
    }),
    cvc: joi_1.default.string().when('type', {
        is: 'card',
        then: joi_1.default.string().pattern(/^\d{3,4}$/).required(),
        otherwise: joi_1.default.forbidden()
    }),
    billingAddress: joi_1.default.object({
        line1: joi_1.default.string().required(),
        line2: joi_1.default.string().optional(),
        city: joi_1.default.string().required(),
        state: joi_1.default.string().required(),
        postalCode: joi_1.default.string().required(),
        country: joi_1.default.string().required()
    }).when('type', {
        is: 'card',
        then: joi_1.default.required(),
        otherwise: joi_1.default.optional()
    })
});
exports.createPaymentIntentDTO = joi_1.default.object({
    amount: joi_1.default.number().min(0.01).max(999999.99).required(),
    currency: joi_1.default.string().valid('USD', 'EUR', 'MXN', 'COP').default('USD'),
    description: joi_1.default.string().min(1).max(255).required(),
    metadata: joi_1.default.object().optional()
});
exports.createInvoiceDTO = joi_1.default.object({
    items: joi_1.default.array().items(joi_1.default.object({
        description: joi_1.default.string().min(1).max(255).required(),
        quantity: joi_1.default.number().min(1).required(),
        unitPrice: joi_1.default.number().min(0.01).required()
    })).min(1).required(),
    description: joi_1.default.string().min(1).max(500).optional(),
    dueDate: joi_1.default.date().greater('now').optional(),
    metadata: joi_1.default.object().optional()
});
exports.processPaymentDTO = joi_1.default.object({
    paymentIntentId: joi_1.default.string().required(),
    paymentMethodId: joi_1.default.string().required()
});
exports.processRefundDTO = joi_1.default.object({
    paymentIntentId: joi_1.default.string().required(),
    amount: joi_1.default.number().min(0.01).required(),
    reason: joi_1.default.string().min(1).max(255).required()
});
exports.validatePaymentMethodDTO = joi_1.default.object({
    cardNumber: joi_1.default.string().pattern(/^\d{13,19}$/).required(),
    expiryMonth: joi_1.default.number().min(1).max(12).required(),
    expiryYear: joi_1.default.number().min(new Date().getFullYear()).max(new Date().getFullYear() + 20).required(),
    cvc: joi_1.default.string().pattern(/^\d{3,4}$/).required()
});
// Admin DTOs
exports.createAdminDTO = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/).required(),
    role: joi_1.default.string().valid('admin', 'super_admin').required(),
    permissions: joi_1.default.array().items(joi_1.default.string()).optional()
});
exports.updateAdminDTO = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).optional(),
    email: joi_1.default.string().email().optional(),
    role: joi_1.default.string().valid('admin', 'super_admin').optional(),
    permissions: joi_1.default.array().items(joi_1.default.string()).optional(),
    isActive: joi_1.default.boolean().optional()
});
// Image DTOs
exports.uploadImageDTO = joi_1.default.object({
    type: joi_1.default.string().valid('profile', 'event', 'chat').required(),
    description: joi_1.default.string().min(1).max(255).optional()
});
// Pagination DTOs
exports.paginationDTO = joi_1.default.object({
    limit: joi_1.default.number().min(1).max(100).default(10),
    offset: joi_1.default.number().min(0).default(0),
    sortBy: joi_1.default.string().optional(),
    sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc')
});
// Filter DTOs
exports.dateRangeDTO = joi_1.default.object({
    startDate: joi_1.default.date().required(),
    endDate: joi_1.default.date().greater(joi_1.default.ref('startDate')).required()
});
exports.locationFilterDTO = joi_1.default.object({
    latitude: joi_1.default.number().min(-90).max(90).required(),
    longitude: joi_1.default.number().min(-180).max(180).required(),
    radius: joi_1.default.number().min(0.1).max(100).default(10)
});
exports.priceRangeDTO = joi_1.default.object({
    min: joi_1.default.number().min(0).required(),
    max: joi_1.default.number().min(joi_1.default.ref('min')).required()
});
