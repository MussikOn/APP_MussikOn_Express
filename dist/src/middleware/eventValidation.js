"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEventStatus = exports.validateEventId = exports.validateEventData = void 0;
const apiService_1 = require("../services/apiService");
const eventConfig_1 = require("../config/eventConfig");
const validateEventData = (req, res, next) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    try {
        const eventData = req.body;
        // Validar campos requeridos
        const requiredFields = [
            'requestName', 'requestType', 'date', 'time', 'location',
            'duration', 'instrument', 'budget', 'description'
        ];
        const validation = apiService_1.ApiService.validateRequiredFields(eventData, requiredFields);
        if (!validation.isValid) {
            return apiService_1.ApiService.error(res, `Campos requeridos faltantes: ${validation.missingFields.join(', ')}`, 400);
        }
        // Validar tipos de datos usando configuraciones centralizadas
        if (typeof eventData.requestName !== 'string' ||
            eventData.requestName.trim().length < eventConfig_1.EVENT_CONFIG.VALIDATION_LIMITS.MIN_REQUEST_NAME_LENGTH ||
            eventData.requestName.trim().length > eventConfig_1.EVENT_CONFIG.VALIDATION_LIMITS.MAX_REQUEST_NAME_LENGTH) {
            return apiService_1.ApiService.error(res, `El nombre del evento debe tener entre ${eventConfig_1.EVENT_CONFIG.VALIDATION_LIMITS.MIN_REQUEST_NAME_LENGTH} y ${eventConfig_1.EVENT_CONFIG.VALIDATION_LIMITS.MAX_REQUEST_NAME_LENGTH} caracteres`, 400);
        }
        if (typeof eventData.requestType !== 'string' || eventData.requestType.trim().length === 0) {
            return apiService_1.ApiService.error(res, eventConfig_1.EVENT_MESSAGES.VALIDATION.REQUIRED_FIELDS, 400);
        }
        if (typeof eventData.instrument !== 'string' || eventData.instrument.trim().length === 0) {
            return apiService_1.ApiService.error(res, eventConfig_1.EVENT_MESSAGES.VALIDATION.REQUIRED_FIELDS, 400);
        }
        if (typeof eventData.description !== 'string' ||
            eventData.description.trim().length < eventConfig_1.EVENT_CONFIG.VALIDATION_LIMITS.MIN_DESCRIPTION_LENGTH ||
            eventData.description.trim().length > eventConfig_1.EVENT_CONFIG.VALIDATION_LIMITS.MAX_DESCRIPTION_LENGTH) {
            return apiService_1.ApiService.error(res, `La descripción debe tener entre ${eventConfig_1.EVENT_CONFIG.VALIDATION_LIMITS.MIN_DESCRIPTION_LENGTH} y ${eventConfig_1.EVENT_CONFIG.VALIDATION_LIMITS.MAX_DESCRIPTION_LENGTH} caracteres`, 400);
        }
        // Validar ubicación
        const locationValidation = apiService_1.ApiService.validateLocation(eventData.location);
        if (!locationValidation.isValid) {
            return apiService_1.ApiService.error(res, locationValidation.error, 400);
        }
        // Validar presupuesto
        const budgetValidation = apiService_1.ApiService.validateBudget(eventData.budget);
        if (!budgetValidation.isValid) {
            return apiService_1.ApiService.error(res, budgetValidation.error, 400);
        }
        // Validar duración
        const durationValidation = apiService_1.ApiService.validateDuration(eventData.duration);
        if (!durationValidation.isValid) {
            return apiService_1.ApiService.error(res, durationValidation.error, 400);
        }
        // Validar fecha y hora
        const dateTimeValidation = apiService_1.ApiService.validateDateTime(eventData.date, eventData.time);
        if (!dateTimeValidation.isValid) {
            return apiService_1.ApiService.error(res, dateTimeValidation.error, 400);
        }
        // Validar imágenes si existen usando configuraciones centralizadas
        if (eventData.images && Array.isArray(eventData.images)) {
            if (eventData.images.length > eventConfig_1.EVENT_CONFIG.VALIDATION_LIMITS.MAX_IMAGES) {
                return apiService_1.ApiService.error(res, eventConfig_1.EVENT_MESSAGES.VALIDATION.TOO_MANY_IMAGES, 400);
            }
            // Validar que todas las imágenes sean URLs válidas o base64
            for (const image of eventData.images) {
                if (typeof image !== 'string') {
                    return apiService_1.ApiService.error(res, eventConfig_1.EVENT_MESSAGES.VALIDATION.INVALID_IMAGES, 400);
                }
            }
        }
        // Validar campos opcionales si están presentes usando configuraciones centralizadas
        if (eventData.guestCount !== undefined) {
            if (typeof eventData.guestCount !== 'number' ||
                eventData.guestCount < eventConfig_1.EVENT_CONFIG.VALIDATION_LIMITS.MIN_GUEST_COUNT ||
                eventData.guestCount > eventConfig_1.EVENT_CONFIG.VALIDATION_LIMITS.MAX_GUEST_COUNT) {
                return apiService_1.ApiService.error(res, eventConfig_1.EVENT_MESSAGES.VALIDATION.INVALID_GUEST_COUNT, 400);
            }
        }
        if (eventData.minBudget !== undefined) {
            const minBudgetValidation = apiService_1.ApiService.validateBudget(eventData.minBudget);
            if (!minBudgetValidation.isValid) {
                return apiService_1.ApiService.error(res, minBudgetValidation.error, 400);
            }
        }
        if (eventData.maxBudget !== undefined) {
            const maxBudgetValidation = apiService_1.ApiService.validateBudget(eventData.maxBudget);
            if (!maxBudgetValidation.isValid) {
                return apiService_1.ApiService.error(res, maxBudgetValidation.error, 400);
            }
        }
        // Validar que maxBudget sea mayor que minBudget si ambos están presentes
        if (eventData.minBudget && eventData.maxBudget && eventData.maxBudget <= eventData.minBudget) {
            return apiService_1.ApiService.error(res, eventConfig_1.EVENT_MESSAGES.VALIDATION.BUDGET_RANGE_INVALID, 400);
        }
        // Sanitizar y normalizar datos
        const sanitizedData = {
            requestName: eventData.requestName.trim(),
            requestType: eventData.requestType.trim(),
            date: eventData.date,
            time: eventData.time,
            location: {
                address: eventData.location.address.trim(),
                city: ((_a = eventData.location.city) === null || _a === void 0 ? void 0 : _a.trim()) || '',
                latitude: eventData.location.latitude,
                longitude: eventData.location.longitude,
                description: (_b = eventData.location.description) === null || _b === void 0 ? void 0 : _b.trim()
            },
            duration: eventData.duration,
            instrument: eventData.instrument.trim(),
            budget: eventData.budget,
            description: eventData.description.trim(),
            images: eventData.images || [],
            musicGenre: (_c = eventData.musicGenre) === null || _c === void 0 ? void 0 : _c.trim(),
            guestCount: eventData.guestCount,
            specialRequirements: (_d = eventData.specialRequirements) === null || _d === void 0 ? void 0 : _d.trim(),
            additionalComments: (_e = eventData.additionalComments) === null || _e === void 0 ? void 0 : _e.trim(),
            minBudget: eventData.minBudget,
            maxBudget: eventData.maxBudget,
            paymentMethod: (_f = eventData.paymentMethod) === null || _f === void 0 ? void 0 : _f.trim(),
            paymentTerms: (_g = eventData.paymentTerms) === null || _g === void 0 ? void 0 : _g.trim(),
            equipmentIncluded: (_h = eventData.equipmentIncluded) === null || _h === void 0 ? void 0 : _h.trim(),
            budgetNotes: (_j = eventData.budgetNotes) === null || _j === void 0 ? void 0 : _j.trim(),
            locationDescription: (_k = eventData.locationDescription) === null || _k === void 0 ? void 0 : _k.trim()
        };
        // Agregar datos validados al request
        req.validatedEventData = sanitizedData;
        apiService_1.ApiService.logOperation('event_validation_success', {
            requestName: sanitizedData.requestName,
            requestType: sanitizedData.requestType,
            budget: sanitizedData.budget,
            imagesCount: ((_l = sanitizedData.images) === null || _l === void 0 ? void 0 : _l.length) || 0
        });
        next();
    }
    catch (error) {
        const { message, statusCode } = apiService_1.ApiService.handleError(error, 'event_validation');
        return apiService_1.ApiService.error(res, message, statusCode, error);
    }
};
exports.validateEventData = validateEventData;
const validateEventId = (req, res, next) => {
    try {
        const { eventId } = req.params;
        if (!eventId || typeof eventId !== 'string' || eventId.trim().length === 0) {
            return apiService_1.ApiService.error(res, "ID de evento inválido", 400);
        }
        // Validar formato del ID (asumiendo que es un ID de Firestore)
        if (!/^[a-zA-Z0-9]{20}$/.test(eventId)) {
            return apiService_1.ApiService.error(res, "Formato de ID de evento inválido", 400);
        }
        req.eventId = eventId.trim();
        next();
    }
    catch (error) {
        const { message, statusCode } = apiService_1.ApiService.handleError(error, 'event_id_validation');
        return apiService_1.ApiService.error(res, message, statusCode, error);
    }
};
exports.validateEventId = validateEventId;
const validateEventStatus = (allowedStatuses) => {
    return (req, res, next) => {
        try {
            const { status } = req.params;
            if (!status || !allowedStatuses.includes(status)) {
                return apiService_1.ApiService.error(res, `Estado inválido. Estados permitidos: ${allowedStatuses.join(', ')}`, 400);
            }
            req.eventStatus = status;
            next();
        }
        catch (error) {
            const { message, statusCode } = apiService_1.ApiService.handleError(error, 'event_status_validation');
            return apiService_1.ApiService.error(res, message, statusCode, error);
        }
    };
};
exports.validateEventStatus = validateEventStatus;
