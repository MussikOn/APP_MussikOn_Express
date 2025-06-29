import express from "express";
import { getAllImagesController } from "../controllers/imagesController";

const imgRouter = express();
imgRouter.use(express.json());

imgRouter.get("/getAllImg",getAllImagesController);

export default imgRouter;