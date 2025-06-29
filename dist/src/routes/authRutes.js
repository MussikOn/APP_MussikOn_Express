"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const authController_1 = require("../controllers/authController");
const routAuth = (0, express_1.default)();
routAuth.use(express_1.default.json());
routAuth.get("/verToken", authMiddleware_1.authMiddleware, (req, res) => {
    const data = req.body;
    res.send({ msg: "La data es:", data });
});
routAuth.post("/Register", authController_1.registerController);
routAuth.post("/login", authController_1.loginController);
routAuth.put("/update/:userEmail", authController_1.updateUserByEmailController);
exports.default = routAuth;
