import { sessionModel } from "../model/session.schema";
import BaseEntity from "./base-mongo-entity";

class SessionEntity extends BaseEntity {
  constructor() {
    super(sessionModel);
  }
  async userlogout(userId : string){
    await this.updateOne({userId : userId}, {isActive : false},{})
  }
}
export const userSessionE = new SessionEntity();