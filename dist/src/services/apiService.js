"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiService = exports.ApiService = void 0;
class ApiService {
    constructor() { }
    static getInstance() {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }
    /**
     * Respuesta exitosa estandarizada
     */
    static success(res, data, msg = "Operación exitosa", statusCode = 200) {
        const response = {
            success: true,
            data,
            msg
        };
        res.status(statusCode).json(response);
    }
    /**
     * Respuesta de error estandarizada
     */
    static error(res, msg = "Error en la operación", statusCode = 500, error) {
        const response = {
            success: false,
            msg,
            error: (error === null || error === void 0 ? void 0 : error.message) || error
        };
        res.status(statusCode).json(response);
    }
    /**
     * Validar datos requeridos
     */
    static validateRequiredFields(data, requiredFields) {
        const missingFields = requiredFields.filter(field => {
            const value = data[field];
            return value === undefined || value === null || value === '';
        });
        return {
            isValid: missingFields.length === 0,
            missingFields
        };
    }
    /**
     * Validar estructura de ubicación
     */
    static validateLocation(location) {
        if (!location) {
            return { isValid: false, error: "La ubicación es requerida" };
        }
        if (!location.address || typeof location.address !== 'string') {
            return { isValid: false, error: "La dirección es requerida" };
        }
        if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
            return { isValid: false, error: "Latitud y longitud deben ser números" };
        }
        if (location.latitude < -90 || location.latitude > 90) {
            return { isValid: false, error: "Latitud debe estar entre -90 y 90" };
        }
        if (location.longitude < -180 || location.longitude > 180) {
            return { isValid: false, error: "Longitud debe estar entre -180 y 180" };
        }
        return { isValid: true };
    }
    /**
     * Validar presupuesto
     */
    static validateBudget(budget) {
        if (typeof budget !== 'number' || budget <= 0) {
            return { isValid: false, error: "El presupuesto debe ser un número positivo" };
        }
        if (budget > 1000000) { // 1 millón de pesos
            return { isValid: false, error: "El presupuesto no puede exceder 1,000,000 pesos" };
        }
        return { isValid: true };
    }
    /**
     * Validar duración
     */
    static validateDuration(duration) {
        if (typeof duration !== 'number' || duration <= 0) {
            return { isValid: false, error: "La duración debe ser un número positivo en minutos" };
        }
        if (duration > 1440) { // 24 horas en minutos
            return { isValid: false, error: "La duración no puede exceder 24 horas" };
        }
        return { isValid: true };
    }
    /**
     * Validar fecha y hora
     */
    static validateDateTime(date, time) {
        try {
            const dateTime = new Date(`${date}T${time}`);
            if (isNaN(dateTime.getTime())) {
                return { isValid: false, error: "Fecha u hora inválida" };
            }
            const now = new Date();
            if (dateTime <= now) {
                return { isValid: false, error: "La fecha del evento debe ser futura" };
            }
            return { isValid: true };
        }
        catch (error) {
            return { isValid: false, error: "Formato de fecha u hora inválido" };
        }
    }
    /**
     * Procesar datos del evento antes de guardar
     */
    static processEventData(eventData, userEmail) {
        return Object.assign(Object.assign({}, eventData), { user: userEmail, 
            // Asegurar que las imágenes sean un array
            images: Array.isArray(eventData.images) ? eventData.images : [], 
            // Asegurar que el presupuesto tenga min y max
            minBudget: eventData.minBudget || eventData.budget, maxBudget: eventData.maxBudget || eventData.budget, 
            // Asegurar que la descripción incluya la descripción de ubicación si existe
            description: eventData.locationDescription
                ? `${eventData.description}\n\nUbicación: ${eventData.locationDescription}`
                : eventData.description, 
            // Normalizar campos opcionales
            musicGenre: eventData.musicGenre || '', guestCount: eventData.guestCount || 0, specialRequirements: eventData.specialRequirements || '', additionalComments: eventData.additionalComments || '', paymentMethod: eventData.paymentMethod || '', paymentTerms: eventData.paymentTerms || '', equipmentIncluded: eventData.equipmentIncluded || '', budgetNotes: eventData.budgetNotes || '' });
    }
    /**
     * Aplicar paginación a los resultados
     */
    static applyPagination(data, page = 1, limit = 10) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = data.slice(startIndex, endIndex);
        return {
            data: paginatedData,
            pagination: {
                page,
                limit,
                total: data.length,
                totalPages: Math.ceil(data.length / limit)
            }
        };
    }
    /**
     * Aplicar filtros a los resultados
     */
    static applyFilters(data, filters) {
        return data.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (value === undefined || value === null || value === '') {
                    return true;
                }
                const itemValue = item[key];
                if (typeof value === 'string') {
                    return itemValue === null || itemValue === void 0 ? void 0 : itemValue.toLowerCase().includes(value.toLowerCase());
                }
                if (typeof value === 'number') {
                    return itemValue === value;
                }
                if (Array.isArray(value)) {
                    return value.includes(itemValue);
                }
                return itemValue === value;
            });
        });
    }
    /**
     * Aplicar ordenamiento a los resultados
     */
    static applySorting(data, sortBy, sortOrder = 'asc') {
        return data.sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];
            if (aValue === undefined || bValue === undefined) {
                return 0;
            }
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }
            if (aValue instanceof Date && bValue instanceof Date) {
                return sortOrder === 'asc'
                    ? aValue.getTime() - bValue.getTime()
                    : bValue.getTime() - aValue.getTime();
            }
            return 0;
        });
    }
    /**
     * Log de operaciones
     */
    static logOperation(operation, details, userId) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            operation,
            userId,
            details: typeof details === 'object' ? JSON.stringify(details) : details
        };
        console.log(`📊 [${timestamp}] ${operation}:`, logEntry);
    }
    /**
     * Manejar errores de manera consistente
     */
    static handleError(error, operation) {
        console.error(`❌ Error en ${operation}:`, error);
        if (error.name === 'ValidationError') {
            return { message: error.message, statusCode: 400 };
        }
        if (error.name === 'UnauthorizedError') {
            return { message: 'No autorizado', statusCode: 401 };
        }
        if (error.name === 'ForbiddenError') {
            return { message: 'Acceso denegado', statusCode: 403 };
        }
        if (error.name === 'NotFoundError') {
            return { message: 'Recurso no encontrado', statusCode: 404 };
        }
        return { message: 'Error interno del servidor', statusCode: 500 };
    }
}
exports.ApiService = ApiService;
// Exportar instancia singleton
exports.apiService = ApiService.getInstance();
