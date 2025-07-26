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
exports.updateImageMetadataController = exports.deleteImageController = exports.uploadImageController = exports.getImageUrlController = exports.getAllImagesController = void 0;
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
        const files = yield (0, imagesModel_1.listImages)();
        res.status(200).json({ msg: "Galería de fotos.", files });
    }
    catch (error) {
        res.status(405).json({ msg: "Error al extraer las imágenes." });
    }
});
exports.getAllImagesController = getAllImagesController;
const getImageUrlController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key } = req.params;
        if (!key) {
            res.status(400).json({ error: "Missing file key" });
            return;
        }
        const url = (0, imagesModel_1.getImageUrl)(key);
        res.status(200).json({ url });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate file URL" });
    }
});
exports.getImageUrlController = getImageUrlController;
const uploadImageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }
        const result = yield (0, imagesModel_1.uploadImage)(req.file);
        res.status(200).json(Object.assign({ message: "File uploaded successfully" }, result));
    }
    catch (error) {
        res.status(500).json({ error: "Upload failed" });
    }
});
exports.uploadImageController = uploadImageController;
const deleteImageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key } = req.params;
        if (!key) {
            res.status(400).json({ error: "Missing file key" });
            return;
        }
        yield (0, imagesModel_1.deleteImage)(key);
        res.status(200).json({ message: "Image deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Delete failed" });
    }
});
exports.deleteImageController = deleteImageController;
const updateImageMetadataController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key } = req.params;
        const metadata = req.body;
        if (!key || !metadata || typeof metadata !== 'object') {
            res.status(400).json({ error: "Missing file key or metadata" });
            return;
        }
        yield (0, imagesModel_1.updateImageMetadata)(key, metadata);
        res.status(200).json({ message: "Metadata updated successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Update metadata failed" });
    }
});
exports.updateImageMetadataController = updateImageMetadataController;
