import { Socket } from "socket.io";
import { AuthenticatedSocket } from "../gateway/gateway";
import { ChatEvent } from "./chat.events";

export class ChatGateway {
  private chatEvent = new ChatEvent();

  constructor() {}

  register = (socket: AuthenticatedSocket) => {
    this.chatEvent.sendMessage(socket);
  };
}