import { authUserRegister, UpdateUser, User } from "../utils/DataTypes";
import { db } from "../utils/firebase";


export const registerModel = async (name:string, lastName:string, roll: string, userEmail:string ,userPassword:string)=>{
    try{
        if(!name || !lastName || !roll || !userEmail || !userPassword){console.info("Hay campos que no han sido llenados, \n verificar codigo en C:/programacion/Express/MusikOn/src/models/authModel.ts linea 4."); return "Hay campos que no han sido llenados";}
        const newUser:authUserRegister={
            name,
            lastName,
            roll,
            userEmail:userEmail.toLocaleLowerCase(),
            userPassword,
            create_at: Date().toString(),
            update_at:"",
            delete_at:"",
            status: false
        }
        const querySnapshot = await db.collection("users").where("userEmail", "==", userEmail).get();
        if(!querySnapshot.empty){
            return "El usuario ya Existe.";
        }
     
        await db.collection('users').doc(userEmail).set(newUser);
        return false;
    }catch(error){
        console.info("Error al Guardar los datos, \n verificar codigo en C:/programacion/Express/MusikOn/src/models/authModel.ts linea 4."); 
        return "Error al Guardar los datos.";
    }
}

export const  getUserByEmailModel = async (userEmail:string) => {
try{
    if(!userEmail){;return null;}
    const querySnapshot = await db.collection("users").where("userEmail", "==", userEmail.toLocaleLowerCase()).get();
    const data = querySnapshot.docs[0].data();
    return data;

}catch(error){
    console.info(`Error en la peticion getUserByEmail.\n\n`);
    return null;
}
}

export const updateUserByEmailModel = async (userEmail: string, updatedData: Partial<UpdateUser>) => {
    try {
      if (!userEmail || !updatedData) {
        console.info("Faltan datos para actualizar.");
        return "Faltan datos para actualizar.";
      }
  
      await db.collection("users").doc(userEmail.toLowerCase()).update({
        ...updatedData,
         update_at: new Date().toString(),
        });
  
      return false;
    } catch (error) {
      console.info("Error al actualizar los datos.");
      return "Error al actualizar los datos.";
    }
  };
  