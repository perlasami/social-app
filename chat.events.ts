import { AuthenticatedSocket } from "../gateway/gateway";
import { ChatSocketServices } from "./chat.socket.services";


export class ChatEvent {
  private chatSocketServices = new ChatSocketServices();

  constructor() {}

  sendMessage = async (socket: AuthenticatedSocket) => {
    socket.on('sendMessage', (data) => {
      return this.chatSocketServices.sendMessage(socket, data);
    });
  };
}