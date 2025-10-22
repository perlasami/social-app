import { DBRepo } from "../../DB/DBRepo";
import { FriendRequestModel, IFreindReuest } from "../freindRequest";


export class FriendRequestRepo extends DBRepo<IFreindReuest> {
  constructor() {
    super(FriendRequestModel);
  }
}