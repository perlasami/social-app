import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3 = new S3Client({ region: "your-region" });

export const uploadMultiFiles = async ({
  files,
  path,
}: {
  files: Express.Multer.File[];
  path: string;
}): Promise<string[]> => {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const fileKey = `${path}/${randomUUID()}-${file.originalname}`;

    const uploadParams = {
      Bucket: "your-bucket-name",
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));
    uploadedUrls.push(`https://${"your-bucket-name"}.s3.amazonaws.com/${fileKey}`);
  }

  return uploadedUrls;
};
