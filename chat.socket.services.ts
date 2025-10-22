import { NotFoundException } from "../../utils/error";
import { AuthenticatedSocket } from "../gateway/gateway";
import { UserRepo } from "../../DB/user.repo";
import { ChatRepo } from "./chat.repo";

export class ChatSocketServices {
  private userModel = new UserRepo();
  private chatModel = new ChatRepo();

  constructor() {}

  sendMessage = async (socket: AuthenticatedSocket, data: { sendTo: string, content: string }) => {
    try {
      const createdBy = socket.user?._id;
      const to = await this.userModel.findById({ id: data.sendTo });

      if (!to) {
        throw new Error('user not found');
      }

      const chat = await this.chatModel.findOne({
        filter: {
          participants: {
            $all: [to._id, createdBy]
          },
          group: {
            $exists: false
          }
        }
      });

      if (!chat) {
        throw new NotFoundException('chat not found');
      }

      await chat.updateOne({ $push: { message: { content: data.content, createdBy } } });
      socket.emit('successMessage', data.content);
    } catch (error) {
      socket.emit('customError', error);
    }
  };
}