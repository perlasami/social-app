import { Types } from "mongoose";
import { UserRepo } from "../../DB/user.repo";
import { NotFoundException } from "../../utils/error";
import { successHandler } from "../../utils/successHandler";
import { ChatRepo } from "./chat.repo";
import { Request, Response } from "express";

export class ChatServices {
  private userRepo = new UserRepo();
  private chatRepo = new ChatRepo();

  constructor() {}

  getChat = async (req: Request, res: Response) => {
    const loggedUser = res.locals.user;
    const userId = Types.ObjectId.createFromHexString(req.params.userId as string);
    const to = await this.userRepo.findOne({
      filter: {
        _id: userId,
      
      },options:{
        populate:"participants"
      }
    });

    if (!to) {
      throw new NotFoundException('user not found');
    }

    const chat = await this.chatRepo.findOne({
      filter: {
        participants: {
          $all: [to._id, loggedUser._id]
        },
        group: {
          $exists: false
        }
      }
    });

    if (!chat) {
      const newChat = await this.chatRepo.create({
        data: {
          participants: [to._id, loggedUser._id],
          createdBy: loggedUser._id,
          message: []
        }
      });
      return successHandler({ res, data: newChat });
      console.log({newChat})
    }
    console.log({chat})
    return successHandler({ res, data: chat });
  };
}