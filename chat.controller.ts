import { Router } from "express";
import { ChatServices } from "./chat.rest.services";
import { auth } from "../../middleware/auth.middleware";

const chatRouter = Router( {mergeParams:true}); // create router
const chatServices = new ChatServices();

// example route (you can add your real ones later)
chatRouter.get('/', async (req, res) => {
  res.json({ message: "Chat module working!" });
});
chatRouter.get("/",auth(),chatServices.getChat)
export default chatRouter;
