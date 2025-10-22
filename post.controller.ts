import { Router } from 'express';
import { PostServices } from './post.services';
import { validation } from '../../middleware/validation.middleware';
import { createPostSchema } from './post.validation';
import { uploadFiles } from '../../utils/multer/multer';
import { auth } from '../../middleware/auth.middleware';
import { uploadFile } from '../../utils/multer/s3.services';

const router=Router()

const postServices=new PostServices()
router.post("/",auth(),uploadFiles({}).array("attachments",4),validation(createPostSchema),postServices.createPost)
router.patch("/like-unlike",auth(),postServices.likePost)
router.patch(
  "/update-post/:id",
  auth(),
  uploadFiles({}).array("newAttachments", 4),  
  postServices.updatePost
);

export default router