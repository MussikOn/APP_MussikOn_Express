import { Router } from "express";
import multer from "multer";
import { getFileUrl, uploadFile } from "../controllers/musicianProfileController";

const musician = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
musician.use(upload.single("file"));
musician.post("/saveImage", uploadFile);
musician.get("/getImage/:key", getFileUrl);

export default musician;

