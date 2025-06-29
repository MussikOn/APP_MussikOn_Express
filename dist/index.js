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
const express_1 = __importDefault(require("express"));
const ENV_1 = require("./ENV");
const cors_1 = __importDefault(require("cors"));
const authRutes_1 = __importDefault(require("./src/routes/authRutes"));
const firebase_1 = require("./src/utils/firebase");
const superAdminRouter_1 = __importDefault(require("./src/routes/superAdminRouter"));
const dotenv_1 = __importDefault(require("dotenv"));
const musicianProfileRoutes_1 = __importDefault(require("./src/routes/musicianProfileRoutes"));
const port = process.env.PORT || 10000;
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/auth", authRutes_1.default);
app.use("/superAdmin", superAdminRouter_1.default);
app.use("/media", musicianProfileRoutes_1.default);
app.get('/getAllUsers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const snapshot = yield firebase_1.db.collection('users').get();
        const users = [];
        snapshot.forEach(doc => {
            users.push(doc.data());
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Error al obtener datos de Firestore:', error);
        res.status(500).send('Error al obtener datos de Firebase');
    }
}));
app.get('/', (req, res) => {
    res.send(`<h1>MusikOn API</h1>`);
});
app.listen(port, () => {
    console.log(`MusikOn API:${ENV_1.URL_API}${port}`);
});
