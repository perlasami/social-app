import { DeleteObjectCommand, DeleteObjectCommandOutput, DeleteObjectsCommand, GetObjectAclCommand, GetObjectCommand, GetObjectCommandOutput, ObjectCannedACL, PutObjectCommand } from "@aws-sdk/client-s3"
import { storeIn } from "./multer"
import { createReadStream } from "fs"
import { s3Config } from "./s3config"
import { ApplicationException } from "../error"
import { Upload } from "@aws-sdk/lib-storage"
import { nanoid } from "nanoid"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"




export const uploadFile=async({
        Bucket=process.env.BUCKET_NAME as string,
        ACL="private",
        pathh="general",
        File,
        StoreIn=storeIn.memory
}:{
        Bucket?:string,
        ACL?:ObjectCannedACL,
        pathh?:string,
        File:Express.Multer.File,
        StoreIn?:storeIn
}):Promise<string>=>{
    const commend=new PutObjectCommand({
        Bucket,
        ACL,
        Key:`socialApp/${pathh}/${nanoid(15)}__${File.originalname}`,
        Body:StoreIn==storeIn.memory?File.buffer :createReadStream(File.path),
        ContentType:File.mimetype
    })
    await s3Config().send(commend)
    if(!commend.input.Key){
        throw new ApplicationException("file upload failed",400)
    }
    return commend.input.Key
}



export const uploadLargeFile=async({
        Bucket=process.env.BUCKET_NAME as string,
        ACL="private",
        pathh="general",
        File,
        StoreIn=storeIn.memory
}:{
        Bucket?:string,
        ACL?:ObjectCannedACL,
        pathh?:string,
        File:Express.Multer.File,
        StoreIn?:storeIn
}):Promise<string>=>{
    const upload=new Upload({
        client:s3Config(),
        params:{

            Bucket,
            ACL,
            Key:`socialApp/${pathh}/${nanoid(15)}__${File.originalname}`,
            Body:StoreIn==storeIn.memory?File.buffer :createReadStream(File.path),
            ContentType:File.mimetype
        }
    })
    upload.on("httpUploadProgress",(process)=>{
        console.log({process})
    })
    const {  Key }=await upload.done()
    if(!Key){
        throw new ApplicationException("file upload failed",400)
    }
      return Key
   
}




export const uploadMultipleFile=async({
        Bucket=process.env.BUCKET_NAME as string,
        ACL="private",
        pathh="general",
        Files,
        StoreIn=storeIn.memory
}:{
        Bucket?:string,
        ACL?:ObjectCannedACL,
        pathh?:string,
        Files:Express.Multer.File[],
        StoreIn?:storeIn
}):Promise<string[]>=>{
    const keys=Promise.all(
        StoreIn==storeIn.memory?
            Files.map(File=>{
                return uploadFile({
                Bucket,
                ACL,
                pathh,
                File,
                StoreIn

                })
        })
        :
                Files.map(File=>{
                return uploadLargeFile({
                Bucket,
                ACL,
                pathh,
                File,
                StoreIn

                })
        })

    )
    return keys
   
   
}


export const createPresignedUrl=async({
        Bucket=process.env.BUCKET_NAME as string,
        pathh="general",
        ContentType,
        originalname,
        expiresIn=120
     
}:{
        Bucket?:string,
        pathh?:string,
        ContentType:string,
        originalname:string,
        expiresIn ?:number
        
})=>{
        const commend=new PutObjectCommand({
            Bucket,
            Key:`socialApp/${pathh}/${nanoid(15)}_presigned_${originalname}`,
            ContentType
    })
    const url=await getSignedUrl(s3Config(),commend,{ expiresIn })
    if(!url || !commend?.input?.Key){
        throw new ApplicationException("fail to generate presigned url",409)
    }
    return { url, Key: commend.input.Key }

   
   
   
}

export const getFile=async({
        Bucket=process.env.BUCKET_NAME as string,
        Key
       
}:{
        Bucket?:string,
        Key:string
       
}):Promise<GetObjectCommandOutput>=>{
    const commend=new GetObjectCommand({
        Bucket,
        Key,
    });
    return await s3Config().send(commend)
    
}

export const createGetPresignedUrl=async({
        Bucket=process.env.BUCKET_NAME as string,
        Key,
        downloadName='dummy',
        download='falses',
        expiresIn=120
     
}:{
        Bucket?:string,
        Key:string,
        downloadName ?:string,
        download?:string,      
        expiresIn ?:number
        
})=>{
       const command = new GetObjectCommand({
  Bucket,
  Key,
  ResponseContentDisposition: download === "true" ? `attachment; filename=${downloadName}` : undefined,
});

const url = await getSignedUrl(s3Config(), command, {
  expiresIn,
});

if (!url) throw new ApplicationException("Fail to generate presignedURL",409);

return url;
   
   
}

export const deleteFile=async({
        Bucket=process.env.BUCKET_NAME as string,
        Key
       
}:{
        Bucket?:string,
        Key:string
       
}):Promise<DeleteObjectCommandOutput>=>{
    const commend=new DeleteObjectCommand({
        Bucket,
        Key,
    });
    return await s3Config().send(commend)
    
}

export const deleteFiles = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  urls,
  Quiet = false,
}: {
  Bucket?: string;
  urls: string[];
  Quiet?: boolean;
}) => {
  const Objects = urls.map((url) => {
    return { Key: url };
  });

  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: {
      Objects,
      Quiet,
    },
  });

  return await s3Config().send(command);
};