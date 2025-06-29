"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const musicianProfileController_1 = require("../controllers/musicianProfileController");
const musician = (0, express_1.Router)();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
musician.use(upload.single("file"));
musician.post("/saveImage", musicianProfileController_1.uploadFile);
musician.get("/getImage/:key", musicianProfileController_1.getFileUrl);
exports.default = musician;
