import z from "zod";
import { createPostSchema } from "./post.validation";



export type CreatePostDTO=z.infer<typeof createPostSchema >