"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizationRoutes = exports.advancedSearchRoutes = exports.chatRoutes = exports.musicianRequestRoutes = exports.eventsRoutes = exports.musicianProfileRoutes = exports.imagesRoutes = exports.superAdminRoutes = exports.adminRoutes = exports.authRoutes = void 0;
// Exportar todas las rutas
var authRutes_1 = require("./authRutes");
Object.defineProperty(exports, "authRoutes", { enumerable: true, get: function () { return __importDefault(authRutes_1).default; } });
var adminRoutes_1 = require("./adminRoutes");
Object.defineProperty(exports, "adminRoutes", { enumerable: true, get: function () { return __importDefault(adminRoutes_1).default; } });
var superAdminRouter_1 = require("./superAdminRouter");
Object.defineProperty(exports, "superAdminRoutes", { enumerable: true, get: function () { return __importDefault(superAdminRouter_1).default; } });
var imagesRoutes_1 = require("./imagesRoutes");
Object.defineProperty(exports, "imagesRoutes", { enumerable: true, get: function () { return __importDefault(imagesRoutes_1).default; } });
var musicianProfileRoutes_1 = require("./musicianProfileRoutes");
Object.defineProperty(exports, "musicianProfileRoutes", { enumerable: true, get: function () { return __importDefault(musicianProfileRoutes_1).default; } });
var eventsRoutes_1 = require("./eventsRoutes");
Object.defineProperty(exports, "eventsRoutes", { enumerable: true, get: function () { return __importDefault(eventsRoutes_1).default; } });
var musicianRequestRoutes_1 = require("./musicianRequestRoutes");
Object.defineProperty(exports, "musicianRequestRoutes", { enumerable: true, get: function () { return __importDefault(musicianRequestRoutes_1).default; } });
var chatRoutes_1 = require("./chatRoutes");
Object.defineProperty(exports, "chatRoutes", { enumerable: true, get: function () { return __importDefault(chatRoutes_1).default; } });
var advancedSearchRoutes_1 = require("./advancedSearchRoutes");
Object.defineProperty(exports, "advancedSearchRoutes", { enumerable: true, get: function () { return __importDefault(advancedSearchRoutes_1).default; } });
var optimizationRoutes_1 = require("./optimizationRoutes");
Object.defineProperty(exports, "optimizationRoutes", { enumerable: true, get: function () { return __importDefault(optimizationRoutes_1).default; } });
