import { Server, Socket } from "socket.io"
import { Server as httpServer } from "node:http"
import { HydratedDocument } from "mongoose"
import { IUser } from "../../models/userModel"
import { decodeToken, tokenTypeEnum } from "../../middleware/auth.middleware"
import { ChatGateway } from "../chatModule/chat.gateway"


export    interface AuthenticatedSocket extends Socket {
  user?: HydratedDocument<IUser>
}
    const connectedSockets=new Map<string,string[]>()


const connection=(socket:AuthenticatedSocket)=>{
      const currentSockets = connectedSockets.get(socket.user?._id.toString() as string) || []
currentSockets.push(socket.id)
connectedSockets.set(socket.user?._id.toString() as string, currentSockets)
 
}

const disconnect=(socket:AuthenticatedSocket)=>{
     socket.on('disconnect', () => {
    const userId = socket.user?._id.toString();
    if (userId) {
      let currentSockets = connectedSockets.get(userId) || [];
      currentSockets = currentSockets.filter(id => id !== socket.id);
      connectedSockets.set(userId, currentSockets);
      console.log('Updated connectedSockets:', connectedSockets);
    }
  });
    
}
export const initialize=(httpServer:httpServer)=>{
    const io=new Server(httpServer,{
      cors:{
        origin:"*"
        
      }
    })

    const chatgateway=new ChatGateway()



io.use(async (socket: AuthenticatedSocket, next) => {
  const authHeader = socket.handshake.auth.authorization || socket.handshake.auth.token;
  const data = await decodeToken({ authorization: authHeader, tokenType: tokenTypeEnum.access });
  socket.user = data.user;
  next();
});



io.on("connection", (socket: AuthenticatedSocket) => {
  if (!socket.user) {
    console.log("❗ Unauthorized socket connection attempt");
    socket.disconnect();
    return;
  }

  const userId = socket.user._id.toString();

  connection(socket);
  console.log(connectedSockets);

  chatgateway.register(socket);
  console.log(socket.user);

  socket.join(userId);

  socket.broadcast.emit("user_status", { userId, status: "online" });

  socket.on("typing", ({ to }) => {
    socket.to(to).emit("typing", { from: userId });
  });

  socket.on("stop_typing", ({ to }) => {
    socket.to(to).emit("stop_typing", { from: userId });
  });

  disconnect(socket);

  console.log(connectedSockets);
});







}