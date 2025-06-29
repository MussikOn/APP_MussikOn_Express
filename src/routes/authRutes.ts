import express, {Request, Response} from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { emailRegisterController, loginController, registerController, updateUserByEmailController, validNumberGetByEmail } from "../controllers/authController";

const routAuth = express();
routAuth.use(express.json());
routAuth.get("/verToken", authMiddleware, (req:Request, res:Response)=>{
    const data = req.body;
    res.send({msg:"La data es:", data});
});
routAuth.post("/Register",registerController);
routAuth.post("/login",loginController);
routAuth.put("/update/:userEmail",updateUserByEmailController);
routAuth.post("/authEmail", emailRegisterController); 
routAuth.post("/validEmail/:vaildNumber", validNumberGetByEmail); 


export default routAuth;