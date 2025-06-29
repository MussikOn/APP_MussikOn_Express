import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../../ENV";

export function createToken(name:string, lastName:string,userEmail:string, roll:string){
try{
    if(!userEmail || !name || !lastName || !roll){
        return false;
    }
    if(roll === "admin"){
        return jwt.sign({"name":name,"lastName":lastName,"userEmail":userEmail,"roll":roll}, TOKEN_SECRET, {expiresIn: "1h"});
    }else{
        return jwt.sign({name,lastName,userEmail,roll}, TOKEN_SECRET);
    }
    
}catch(error){
    return false;
}
    

}