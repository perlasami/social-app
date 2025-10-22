import { Request,Response } from "express";
import { successHandler } from "../../utils/successHandler";
import { PostRepo } from "./post.repo";
import { IUser, userModel } from "../../models/userModel";
import { nanoid } from "nanoid";
import { availabilityCondition, postModel } from "../../models/postModel";
import { uploadFiles } from "../../utils/multer/multer";
import { uploadMultiFiles } from "../../utils/multer/uploadMultipleFiles";
import { HydratedDocument, Types } from "mongoose";
import { NotFoundException } from "../../utils/error";
import { PostAvailabilityEnum } from "./post.types";
import { deleteFiles } from "../../utils/multer/s3.services";

interface IPostService{
    createPost(req:Request,res:Response):Promise<Response>;
    likePost(req:Request,res:Response):Promise<Response>
    updatePost(req:Request,res:Response):Promise<Response>

}

export class PostServices implements IPostService{
    private Postmodel=new PostRepo()
    createPost=async(req: Request, res: Response): Promise<Response>=> {
        const files: Express.Multer.File[] = req.files as Express.Multer.File[];
const assetsFolderId = nanoid(15);
const path = `users/${res.locals.user._id}/posts/${assetsFolderId}`;
if (req.body.tags?.length) {
  const users = await this.userModel.find({
    filter: {
      _id: {
        $in: req.body.tags
      }
    }
  });
  if (users.length !== req.body.tags.length) {
    throw new Error('there is some tags not found');
  }
}
let attachments: string[] = [];
if (files?.length) {
  attachments = await uploadMultiFiles({
    files,
    path
  });
}
const post = await this.Postmodel.create({
  data: {
    ...req.body,
    attachments,
    createdBy: res.locals.user._id,
    assetsFolderId
  }
});


        return successHandler({res,data:post})
        
    }
    userModel: any;



   likePost = async (req: Request, res: Response): Promise<Response> => {
  const { postId, likeType }: {
    postId: Types.ObjectId,
    likeType: 'like' | 'unlike'
  } = req.body;

  const user: HydratedDocument<IUser> = res.locals.user;
  const post = await this.Postmodel.findOne({
    filter: {
      _id: postId,
      $or: availabilityCondition(user)
    }
  });

  if(!post){
    throw new NotFoundException()
  }

  if (likeType === 'like') {
    await post?.updateOne({
      $addToSet: {
        likes: user._id
      }
    });
  } else {
    await post?.updateOne({
      $pull: {
        likes: user._id
      }
    });
  }

  await post.save();

  return successHandler({ res,data:post });
}


updatePost = async (req: Request, res: Response): Promise<Response> => {
    const postId = req.params.id as string;
    const userId = res.locals.user._id;

    const {
      content,
      availability,
      allowsComments,
      removedAttachments = [],
      newTags = [],
      removedTags = [],
    }: {
      content?: string;
      availability?: PostAvailabilityEnum;
      allowsComments?: boolean;
      removedAttachments?: string[];
      newTags?: Types.ObjectId[];
      removedTags?: Types.ObjectId[];
    } = req.body;

    const post = await this.Postmodel.findOne({
      filter: { _id: postId, createdBy: userId },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    // ✅ Verify that all newTags exist
    if (newTags.length) {
      const users = await this.userModel.find({
        filter: { _id: { $in: newTags } },
      });

      if (users.length !== newTags.length) {
        throw new Error("Some tags were not found");
      }
    }

    // ✅ Upload new attachments
    let attachmentsLink: string[] = [];
    const newAttachments = req.files as Express.Multer.File[];

    if (newAttachments?.length) {
      attachmentsLink = await uploadMultiFiles({
        files: newAttachments,
        path: `users/${userId}/posts/${post.assetsFolderId}`,
      });
    }

//     // ✅ Update arrays safely
//     const updatedAttachments = [
//       ...(post.attachments || []),
//       ...attachmentsLink,
//     ].filter((link) => !removedAttachments.includes(link));

//    const updatedTags = [
//   ...(post.tags || []),
//   ...newTags.map((id) => new Types.ObjectId(id)), // convert strings to ObjectId
// ].filter((tag) => 
//   !removedTags.some((removed) => removed.toString() === tag.toString())
// );


//     await post.updateOne({
//   content: content || post.content,
//   availability: availability || post.availability,
//   allowComments: allowsComments || post.allowsComments,
//   $addToSet: {
//     attachments: { $each: attachmentsLink },
//     tags: { $each: newTags }
//   }
// });

// await post.updateOne({
//   $pull: {
//     attachments: { $in: req.body.removedAttachments || [] },
//     tags: { $in: req.body.removedTags || [] }
//   }
// });

await post.updateOne({
  $set: {
    content: content || post.content,
    allowComments: allowsComments || post.allowsComments,
    availability: availability || post.availability,
    attachments: {
      $setUnion: [
        {
          $setDifference: ["$attachments", removedAttachments]
        },
        attachmentsLink
      ]
    },
    tags: {
      $setUnion: {
        $setDifference: ["$tags", removedTags],
        newTags
      }
    }
  }
});

    // ✅ Delete removed files from S3
    if (removedAttachments.length) {
      await deleteFiles({ urls: removedAttachments });
    }

    return successHandler({ res, msg: "Post updated successfully" });
  };
}

