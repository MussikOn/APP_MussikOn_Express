"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const imagesController_1 = require("../controllers/imagesController");
const imgRouter = (0, express_1.default)();
imgRouter.use(express_1.default.json());
/**
 * @swagger
 * /imgs/getAllImg:
 *   get:
 *     summary: Obtiene la galería de imágenes
 *     responses:
 *       200:
 *         description: Galería de imágenes obtenida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *       405:
 *         description: Error al extraer las imágenes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 */
imgRouter.get("/getAllImg", imagesController_1.getAllImagesController);
exports.default = imgRouter;
