import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { getUserByEmailModel, registerModel, updateUserByEmailModel, addEventToUserModel } from "../models/authModel";
import { authUserRegister, UpdateUser, User } from "../utils/DataTypes";
import { validarEmail, validarPassword } from "../utils/validatios";
import { createToken } from "../utils/jwt";
import { sendEmail } from "../utils/mailer";
import { URL_API } from "../../ENV";
import { numberRandon } from "../utils/functions";
import { db } from "../utils/firebase";

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthUserRegister:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         lastName:
 *           type: string
 *         roll:
 *           type: string
 *         userEmail:
 *           type: string
 *         userPassword:
 *           type: string
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user:
 *           type: string
 *         eventName:
 *           type: string
 *         requesterName:
 *           type: string
 *         location:
 *           type: string
 *         date:
 *           type: string
 *         time:
 *           type: string
 *         duration:
 *           type: string
 *         instrument:
 *           type: string
 *         bringInstrument:
 *           type: boolean
 *         comment:
 *           type: string
 *         budget:
 *           type: string
 *         eventType:
 *           type: string
 *         flyerUrl:
 *           type: string
 *         songs:
 *           type: array
 *           items:
 *             type: string
 *         recommendations:
 *           type: array
 *           items:
 *             type: string
 *         mapsLink:
 *           type: string
 */
export async function registerController(req:Request, res:Response){
    try{
        const {name,lastName,roll,userEmail,userPassword}:authUserRegister = req.body;
        if(!name || !lastName || !roll || !userEmail || !userPassword){ res.status(400).json({msg:"Error al registrarse, todos los campos deben de ser llenados"}); return;}
        if(!validarPassword(userPassword)){
            res.status(400).json({msg:"La contraseña no cumple con los requisitos, debe de contener Mayúsculas, Minúsculas, Números y Carácteres especiales \n\n\nEjemplo: Tunombre*55 ."}); return;
        }
        if(!validarEmail(userEmail)){
            res.status(400).json({msg:"Correo Electrónico inválido."}); return;
        }
        const pass = await bcrypt.hash(userPassword,10);
        const saved = await registerModel(name, lastName, roll, userEmail, pass);
        if(!saved){
            const token = createToken(name,lastName,userEmail,roll);
            const user = await getUserByEmailModel(userEmail);
            res.status(200).json({msg:"Usuario Registrado con éxito.", token, user});
            return;
        }else if(saved === "Hay campos que no han sido llenados"){
            res.status(409).json({msg:"Hay campos que no han sido llenados", data:saved});
            return;
        }else if(saved === "El usuario ya Existe."){
            res.status(409).json({msg:"Ya hay un usuario con esta direccion de correo electrónico.", data:saved});
            return;
        }
    }catch(error){
        console.info(`Hubo un error al intentar registar un Usuario: ${error}`);
        res.status(400).json({msg:"Error al registrarse.", error});
        return;
    }
}

export async function loginController(req:Request, res:Response){
    try{
        const {userEmail, userPassword} = req.body;
        if(!userEmail || !userPassword){
            res.status(400).json({msg:"Todos los campos deben de ser llenados."});
            return;
        };
        if(!validarEmail(userEmail)){res.status(400).json({msg:"Dirección de correo electrónico no válido."});return;};
        const data = await getUserByEmailModel(userEmail);
        if(!data){res.status(401).json({msg:"Verifique su dirección de correo electrónico o regístrese si no tiene una cuenta."});return;};
        const name = data.name;
        const lastName = data.lastName;
        const roll = data.roll;
        const pass = data.userPassword;
        const isMatch = await bcrypt.compare(userPassword,pass);
        if(!isMatch){res.status(401).json({msg:"Contraseña incorrecta."}); return;}
        const token = createToken(name,lastName,userEmail,roll);
        res.status(200).json({msg:"Login Exitoso",token,user:data});
    }catch(error){
        res.status(401).json({msg:"Error en la petición, Inténtelo mas tarde.",error});
        return;
    }
}


export const updateUserByEmailController = async (req:Request, res:Response) =>{
try{
    const dataUsers = req.body;
    const userEmail = req.params.userEmail.toLocaleLowerCase();
    if(!dataUsers || !userEmail){res.status(401).json({msg:"No hay Datos para actualizar"})}
    if(!validarEmail(userEmail)){res.status(400).json({msg:"Dirección de correo electrónico no válido."});return;};
    const updateValidation = await updateUserByEmailModel(userEmail,dataUsers);
    if(updateValidation){
        console.info("Resultado de updateUserByEmailModel");
        console.info(updateValidation)
        res.status(401).json({msg:updateValidation})
    }
    res.status(200).json({msg:"Consulta éxitosa",});
}catch(error){
    console.info("Error al actualizar los datos.");
    res.status(401).json({msg:"Error al actualizar el usuario."});
}

}

export const emailRegisterController = async (req:Request, res:Response) =>{
  const numRandon = numberRandon().toString();
  const numParam = await bcrypt.hash(numRandon,10);
  const html = `<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Verifica tu correo - MusikOn</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', sans-serif;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #004aad; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <!-- Logo -->
            <tr>
              <td style="padding: 30px 0; text-align: center; background-color: #ffffff;">
                <img src="https://lh3.googleusercontent.com/a/ACg8ocLSs4B7UmP4bKLb26G-puyYjCURVh0Qnf9yHD_zxbCfRJTd3DFOovBly95OzJTWk34hnBf1RhigsdCnM0Wwg3TKCgsJ3rs=s288-c-no" alt="MusikOn Logo" width="120" style="border-radius: 50%;" />
              </td>
            </tr>

            <!-- Título -->
            <tr>
              <td style="padding: 30px; text-align: center;">
                <h2 style="margin: 0; font-size: 26px; color: #fff;">¡Bienvenido a <span style="color: #f1f1f1;">MusikOn</span>!</h2>
                <p style="font-size: 16px; color: hsl(246, 100%, 92%);">Gracias por registrarte. Solo falta un paso para activar tu cuenta.</p>
              </td>
            </tr>

            <!-- Botón -->
            <tr>
              <td style="text-align: center; padding: 20px;">
                <h1 style="display: inline-block; padding: 15px 30px; background-color: #004aad; color: #fff; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 50px;">
                  ${numRandon}
                </h1>
              </td>
            </tr>

            <!-- Mensaje de soporte -->
            <tr>
              <td style="padding: 20px 40px; text-align: center; font-size: 14px; color: #b6c9ff;">
                Si no creaste esta cuenta, puedes ignorar este mensaje. Si tienes dudas, contáctanos en <a href="mailto:appmusikon@gmail.com" style="color: hsl(214, 100%, 77%);">appmusikon@gmail.com</a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="text-align: center; padding: 30px; background-color: #f0f0f0; font-size: 12px; color: #0041f3;">
                &copy; 2025 MusikOn. Todos los derechos reservados.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
    try{
        const userEmail = req.body.userEmail.toLocaleLowerCase();
        if(!userEmail){res.status(400).json({msg:"Todos los campos deben de ser llenados."});return;}
        if(!validarEmail(userEmail)){res.status(402).json({msg:"Dirección de correo electrónico no válido."});return;}
         const querySnapshot = await db.collection("users").where("userEmail", "==", userEmail).get();
                if(!querySnapshot.empty){res.status(409).json({msg:"Ya hay un usuario con esta dirección de correo electrónico."}); return;}else{
                    await sendEmail(userEmail, "Verifica tu cuenta en MusikOn", html);
                    res.status(200).json({msg:"Email recibido con exito!", numParam});
                }
    }catch(err){
        res.status(400).json({msg:"Verifique bien su dirección de correo electrónico.",err});
        return;
    }
}

export const validNumberGetByEmail = async (req:Request, res:Response) =>{
try{
  const numBack = req.body.vaildNumber.toString();
  const numParam = req.params.vaildNumber.toString();
  if(numBack ===  "" || numParam === ""){res.status(402).json({msg:"Faltan datos requeridos."}); return;}
  const isMatch = await bcrypt.compare(numParam,numBack);
  if(!isMatch){
    console.info(`Son Iguales: ${numBack},${numParam}.`);
    res.status(402).json({msg:"Codigo Incorrecto."});
    return;
  }
  console.info(`Numero del Body: ${numBack}`);
  console.info(`Numero del Parametros: ${numParam}`);
  res.status(200).json({msg:"Bien hecho!"});
}catch(err){
  res.status(402).json({msg:"Fallo el proceso!"});
}
}

export const addEventToUserController = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user || !user.userEmail) {
            res.status(401).json({ msg: "Usuario no autenticado." });
            return;
        }
        const eventData = req.body;
        if (!eventData) {
            res.status(400).json({ msg: "No se proporcionó información del evento." });
            return;
        }
        const result = await addEventToUserModel(user.userEmail, eventData);
        if (!result) {
            res.status(200).json({ msg: "Evento guardado exitosamente." });
        } else {
            res.status(400).json({ msg: result });
        }
    } catch (error) {
        res.status(500).json({ msg: "Error al guardar el evento.", error });
    }
}