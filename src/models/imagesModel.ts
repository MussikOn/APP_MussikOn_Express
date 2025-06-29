import AWS from "aws-sdk";


const s3 = new AWS.S3({
    endpoint:"https://musikon-media.c8q1.va03.idrivee2-84.com",
    accessKeyId:"une5qsW31Zlf7yi1lF34",
    secretAccessKey:"cgTHQ9ut0UkUp9locWBDJDDJDBiwKrvtOaB2KVt4",
})

export const verImagen = async () =>{
    s3.listBuckets((err, data)=>{
        if(err){
            console.info("Error: ");
            console.info(err);
            return;
        }else{
            console.info("Data:");
            console.info(data);
            return;
        }
    });
}

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