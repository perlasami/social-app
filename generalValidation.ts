import z from "zod";
import { fileTypes } from "./multer";
import { PostAvailabilityEnum } from "../../modules/postModule/post.types";

export const generalValidation = {
  content: z.string().optional(),
  files: ({ type = fileTypes.images,fieldname = "attachments" }: { type: string[], fieldname?: string }) => {
    return z.array(z.object({
      filename: z.enum([fieldname]),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.enum(type),
      buffer: z.any().optional(),
      path: z.string().optional(),
      size: z.number()
    })).optional();
  },
  availability: z.enum([
    PostAvailabilityEnum.PUBLIC,
    PostAvailabilityEnum.PRIVATE,
    PostAvailabilityEnum.FRIENDS
  ]).default(PostAvailabilityEnum.PUBLIC).optional(),
  allowComments: z.boolean().default(true).optional(),
  tags: z.array(z.string()).optional(),
};