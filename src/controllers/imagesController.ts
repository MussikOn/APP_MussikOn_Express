import {Request, Response} from "express";
import { listImages, getImageUrl, uploadImage, deleteImage, updateImageMetadata } from "../models/imagesModel";

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
export const getAllImagesController = async (req:Request, res:Response): Promise<void> =>{
    try{
        const files = await listImages();
        res.status(200).json({msg:"Galería de fotos.", files});
    }catch(error){
        res.status(405).json({msg:"Error al extraer las imágenes."})
    }
}

export const getImageUrlController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { key } = req.params;
        if (!key) {
            res.status(400).json({ error: "Missing file key" });
            return;
        }
        const url = getImageUrl(key);
        res.status(200).json({ url });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate file URL" });
    }
};

export const uploadImageController = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }
        const result = await uploadImage(req.file);
        res.status(200).json({ message: "File uploaded successfully", ...result });
    } catch (error) {
        res.status(500).json({ error: "Upload failed" });
    }
};

export const deleteImageController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { key } = req.params;
        if (!key) {
            res.status(400).json({ error: "Missing file key" });
            return;
        }
        await deleteImage(key);
        res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Delete failed" });
    }
};

export const updateImageMetadataController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { key } = req.params;
        const metadata = req.body;
        if (!key || !metadata || typeof metadata !== 'object') {
            res.status(400).json({ error: "Missing file key or metadata" });
            return;
        }
        await updateImageMetadata(key, metadata);
        res.status(200).json({ message: "Metadata updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Update metadata failed" });
    }
};