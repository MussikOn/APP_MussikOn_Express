import {Request, Response} from "express";
import { verImagen } from "../models/imagesModel";

export const getAllImagesController = async (req:Request, res:Response) =>{
    try{
        const files =  await verImagen();
        const files1 =  await verImagen();
        console.info(files);
        // if(!files1){console.info(files); res.status(402).json({msg:"No hay data para mostrar."});return;}
        console.info("Todas las Imagenes");
        console.info(files);
        res.status(200).json({msg:"Galería de fotos.",files});
    }catch(error){
        res.status(405).json({msg:"Error al extrael las Imagenes."})
    }
}