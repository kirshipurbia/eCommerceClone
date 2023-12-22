import mongoose, { NumberSchemaDefinition, Schema } from "mongoose";
import { mongo } from "../provider/mongo/mongo";
import { COLLECTION, ChatReaction, ChatStatus, USER_TYPE } from "../interface/enum";

interface IChat extends Document {
  topic: string;
  replyToMessageId : Schema.Types.ObjectId
  reciverId :Schema.Types.ObjectId
  reviewId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  name: string;
  message: string;
  status : string;
  reaction : string;
  reactionAddById : Schema.Types.ObjectId
}

const ChatSchema = new Schema<IChat>(
  {
    topic: String,
    replyToMessageId : {type : Schema.Types.ObjectId},
    reciverId : {type : Schema.Types.ObjectId },
    reviewId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId },
    name: String,
    message: String,
    status : {
      type : String,
      enum : Object.values(ChatStatus)
    },
    reaction : {
      type : String,
      enum : Object.values(ChatReaction)
    },
    reactionAddById : {type : Schema.Types.ObjectId}
    
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ChatModel = mongo
  .getConnection()
  .model<IChat>(COLLECTION.CHAT, ChatSchema);
