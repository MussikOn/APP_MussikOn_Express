"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllImagesController = void 0;
const imagesModel_1 = require("../models/imagesModel");
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
 */
const getAllImagesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield (0, imagesModel_1.verImagen)();
        // files1 es redundante, se elimina
        console.info(files);
        // if(!files){ res.status(402).json({msg:"No hay data para mostrar."});return;}
        console.info("Todas las Imagenes");
        res.status(200).json({ msg: "Galería de fotos.", files });
    }
    catch (error) {
        res.status(405).json({ msg: "Error al extrael las Imagenes." });
    }
});
exports.getAllImagesController = getAllImagesController;
