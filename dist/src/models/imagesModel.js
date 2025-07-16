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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verImagen = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const s3 = new aws_sdk_1.default.S3({
    endpoint: process.env.IDRIVE_E2_ENDPOINT,
    accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY,
    secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY,
});
const verImagen = () => __awaiter(void 0, void 0, void 0, function* () {
    s3.listBuckets((err, data) => {
        if (err) {
            console.info("Error: ");
            console.info(err);
            return;
        }
        else {
            console.info("Data:");
            console.info(data);
            return;
        }
    });
});
exports.verImagen = verImagen;
// import { s3, ss3 } from "../utils/idriveE2";
// export const getAllImagesModel = async () =>{
//     try{
//         const response = await ss3.listObjectsV2({
//             Bucket:"musikon-media",
//             MaxKeys:1000,
//         }).promise();
//         console.info(ss3);
//         if(!response){return;}
//         const files = response.Contents?.map((item)=>{
//             const url = ss3.getSignedUrl("getObject",{
//                 Bucket:"musikon-media",
//                 Key:item.Key,
//                 Expires:60 * 60,
//             });
//             return {
//                 Key:item.Key,
//                 url,
//             }
//         });
//         console.info(files);
//         return files;
//     }catch(error){
//         return;
//     }
// }
// // ====================================================
// export const getAllDataModel = async () =>{
//     try {
//         // const command
//       } catch (error) {
//         console.error("Error al listar imágenes:", error);
//         return;
//       }
// }
