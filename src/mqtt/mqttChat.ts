import mqtt, { connect, MqttClient } from "mqtt";
import express, { Request, Response } from "express";
import { userEntity } from "../entity/user.entity";
import { CustomException } from "../utils/exception.utils";
import {
  ChatReaction,
  ChatStatus,
  ExceptionMessage,
  HttpStatusCode,
  HttpStatusMessage,
  SuccessMessage,
} from "../interface/enum";
import { responseUitls } from "../utils/response.util";
import { ChatModel } from "../model/chat.schema";
import { productE } from "../entity/product.entity";

const messageArray: string[] = [];
const client: MqttClient = connect("mqtt://broker.hivemq.com");

client.on("connect", () => {
  console.log("Connected to MQTT broker");
});

client.on("message", (topic, message) => {
  const jsonstring = message.toString();
  const recivedData = JSON.parse(jsonstring);
  console.log(`Received message from topic ${topic}: ${jsonstring}`);

  messageArray.push(recivedData);
});

export async function subscribeToReviewerChatMessages(
  req: Request,
  res: Response
) {
  const { reviewId } = req.params;
  const userId = req.body.id;
  const userData = await userEntity.findUser(userId);
  if (!userData) {
    throw new CustomException(
      ExceptionMessage.USER_NOT_FOUND,
      HttpStatusMessage.NOT_FOUND
    ).getError();
  }

  client.subscribe(`chat/reviewer/${reviewId}`, { qos: 2 }, (error) => {
    if (error) {
      console.error(`Error subscribing to topic: ${error}`);
      const errorResponce = responseUitls.errorResponse(
        error,
        ExceptionMessage.ISSUE_IN_SUBSCRIBING,
        HttpStatusMessage.INTERNAL_SERVER_ERROR
      );
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(errorResponce);
    } else {
      console.log(`Subscribed to topic chat/reviewer/${reviewId}`);
      res.status(HttpStatusCode.OK).send("Subscribed");
    }
  });
}

export function getReviewerChatMessages(req: Request, res: Response): void {
  try {
    // JSON.stringify(messageArray)

    res.send(messageArray);
  } catch (error) {
    console.log(error);
    const err = responseUitls.errorResponse(
      error,
      ExceptionMessage.SOMETHING_WENT_WRONG,
      HttpStatusMessage.INTERNAL_SERVER_ERROR
    );
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(err);
  }
}

export async function sendChatToReviewer(req: Request, res: Response) {
  try {
    const userId = req.body.id;
    const { message, reviewId, reciverId, replyToMessageId } = req.body;
    console.log(req.body);
    const response = await userEntity.findUser(userId);
    if (!response) {
      throw new CustomException(
        ExceptionMessage.USER_NOT_FOUND,
        HttpStatusMessage.NOT_FOUND
      ).getError();
    }
    const Object: any = {
      replyToMessageId: replyToMessageId,
      reciverId: reciverId,
      name: response.name,
      message: message,
      // status: ChatStatus.DELIVERED,
    };
    ChatModel.create({
      replyToMessageId: replyToMessageId,
      topic: `chat/reviewer/${reviewId}`,
      reciverId: reciverId,
      userId: userId,
      reviewId: reviewId,
      name: response.name,
      message: message,
      status: ChatStatus.DELIVERED,
    });

    const jsonString = JSON.stringify(Object);

    client?.publish(`chat/reviewer/${reviewId}`, jsonString, {
      qos: 2,
      retain: true,
    });
    res.send("Chat sent");
  } catch (error) {
    console.log(error);
  }
}
export async function getAllmsgs(req: Request, res: Response) {
  try {
    const { reviewId } = req.params;
    const { page, pageSize } = req.query;
    console.log(`here the reviewId ${reviewId}`);

    const pageNumber: number = parseInt(page as string, 10) || 1;
    const itemsPerPage: number = parseInt(pageSize as string, 10) || 10;
    const skip: number = (pageNumber - 1) * itemsPerPage;

    await ChatModel.updateMany(
      { topic: `chat/reviewer/${reviewId}`, status: ChatStatus.DELIVERED },
      { $set: { status: ChatStatus.SEEN } }
    );
    const sortedData = await ChatModel.aggregate([
      { $match: { topic: `chat/reviewer/${reviewId}` } },
      { $sort: { createdAt: 1 } },
      { $project: { name: 1, message: 1, _id: 0, status: 1, reaction: 1 } },
      { $skip: skip },
      { $limit: itemsPerPage },
    ]);

    const finalRes = responseUitls.successResponse(
      sortedData,
      SuccessMessage.ALL_CHAT_DATA_FOUND,
      HttpStatusMessage.ACCEPTED
    );
    res.status(HttpStatusCode.ACCEPTED).send(finalRes);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

export async function sendChatToUser(req: Request, res: Response) {
  try {
    const userId = req.body.id;
    const { message, reviewId, productId, reciverId, replyToMessageId } =
      req.body;
    const response = await userEntity.findUser(userId);
    if (!response) {
      throw new CustomException(
        ExceptionMessage.USER_NOT_FOUND,
        HttpStatusMessage.NOT_FOUND
      ).getError();
    }
    const reviewData = await productE.findReview(reviewId, productId);
    if (!reviewData) {
      throw new CustomException(
        ExceptionMessage.REVIEW_NOT_FOUND,
        HttpStatusMessage.NOT_FOUND
      ).getError();
    }
    const Object: any = {
      reciverId: reciverId,
      replyToMessageId: replyToMessageId,
      name: response.name,
      message: message,
    };
    ChatModel.create({
      replyToMessageId: replyToMessageId,
      topic: `chat/reviewer/${reviewId}`,
      reciverId: reciverId,
      userId: userId,
      reviewId: reviewId,
      name: response.name,
      message: message,
      status: ChatStatus.DELIVERED,
    });

    client?.publish(`chat/reviewer/${reviewId}`, Object, {
      qos: 2,
      retain: true,
    });
    res.status(HttpStatusCode.CREATED).send("Chat sent By reviewer Side");
  } catch (error) {
    console.log(error);
    const errorResponse = responseUitls.errorResponse(
      error,
      ExceptionMessage.SOMETHING_WENT_WRONG,
      HttpStatusMessage.INTERNAL_SERVER_ERROR
    );
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(errorResponse);
  }
}

export async function addReactionToMessage(req: Request, res: Response) {
  try {
    const userId = req.body.id;
    const { messageId, reaction } = req.body;
    const response = await userEntity.findUser(userId);
    if (!response) {
      throw new CustomException(
        ExceptionMessage.USER_NOT_FOUND,
        HttpStatusMessage.NOT_FOUND
      ).getError();
    }
    const message = await ChatModel.findById({ _id: messageId });
    if (!message) {
      throw new CustomException(
        ExceptionMessage.MESSAGE_NOT_FOUND,
        HttpStatusMessage.NOT_FOUND
      ).getError();
    }
    switch (reaction) {
      case "like":
        message.reaction = ChatReaction.LIKE;
        break;
      case "love":
        message.reaction = ChatReaction.LOVE;
        break;
      case "laugh":
        message.reaction = ChatReaction.LAUGH;
        break;
      case "angry":
        message.reaction = ChatReaction.ANGRY;
        break;
      case "sad":
        message.reaction = ChatReaction.SAD;
        break;
      default:
        throw new CustomException(
          ExceptionMessage.INVALID_REACTION,
          HttpStatusMessage.BAD_REQUEST
        ).getError();
    }
    message.reaction = reaction;
    message.reactionAddById = userId;
    await message.save();
    const obejct = {
      replyToMessageId: message.replyToMessageId,
      reciverId: message.reciverId,
      name: message.name,
      message: message.message,
      reaction: message.reaction,
      reactedBy: response.name,
      reactionAddById: message.reactionAddById,
    };
    const jsonString = JSON.stringify(obejct);

    client?.publish(`chat/reviewer/${message.reviewId}`, jsonString, {
      qos: 2,
      retain: true,
    });
    res.send("Reaction added to message");
  } catch (error) {
    console.log(error);
    const errorResponse = responseUitls.errorResponse(
      error,
      ExceptionMessage.SOMETHING_WENT_WRONG,
      HttpStatusMessage.INTERNAL_SERVER_ERROR
    );
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(errorResponse);
  }
}
export async function editChatMessage(req: Request, res: Response) {
  try {
    const userId = req.body.id;
    const { messageId, updatedMessage } = req.body;

    const existingMessage = await ChatModel.findById({
      _id: messageId,
      userId: userId,
    });

    if (!existingMessage) {
      throw new CustomException(
        ExceptionMessage.MESSAGE_NOT_FOUND,
        HttpStatusMessage.NOT_FOUND
      ).getError();
    }

    if (existingMessage.userId != userId) {
      throw new CustomException(
        ExceptionMessage.UNAUTHORIZED,
        HttpStatusMessage.UNAUTHORIZED
      ).getError();
    }

    existingMessage.message = updatedMessage;
    existingMessage.status = ChatStatus.EDITED;

    await existingMessage.save();

    const jsonString = JSON.stringify(existingMessage);
    client?.publish(`chat/reviewer/${existingMessage.reviewId}`, jsonString, {
      qos: 2,
      retain: true,
    });

    res.send("Chat message edited");
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error);
  }
}
export async function DeleteChat(req: Request, res: Response) {
  try {
    const userId = req.body.id;
    const { messageId } = req.body;
    const response = await userEntity.findUser(userId);
    if (!response) {
      throw new CustomException(
        ExceptionMessage.USER_NOT_FOUND,
        HttpStatusMessage.NOT_FOUND
      ).getError();
    }
    const message = await ChatModel.findById({
      _id: messageId,
      userId: userId,
    });
    if (!message) {
      throw new CustomException(
        ExceptionMessage.MESSAGE_NOT_FOUND,
        HttpStatusMessage.NOT_FOUND
      ).getError();
    }

    message.message = "This message is deleted";
    message.reaction = ChatReaction.DELETED;
    message.status = ChatStatus.DELETED;
    await message.save();

    const deletionNotification = {
      messageId: messageId,
      action: "This msg is deleted",
    };

    const jsonString = JSON.stringify(deletionNotification);
    client?.publish(`chat/reviewer/${message.reviewId}`, jsonString, {
      qos: 2,
      retain: true,
    });
    res.send("Chat message Deleted ");
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error);
  }
}

export async function unsubscribeFromTopic(req: Request, res: Response) {
  try {
    const userId = req.body.id;
    const { reviewId } = req.params;
    const Data = await userEntity.findUser(userId);
    if (!Data) {
      throw new CustomException(
        ExceptionMessage.USER_NOT_FOUND,
        HttpStatusMessage.NOT_FOUND
      ).getError();
    }
    // Unsubscribe from the specified topic
    client.unsubscribe(`chat/reviewer/${reviewId}`, (error) => {
      if (error) {
        console.error(`Error unsubscribing from topic: ${error}`);
        const errorResponse = responseUitls.errorResponse(
          error,
          ExceptionMessage.ISSUE_IN_UNSUBSCRIBING,
          HttpStatusMessage.INTERNAL_SERVER_ERROR
        );
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(errorResponse);
      } else {
        console.log(`Unsubscribed from topic: chat/reviewer/${reviewId}`);
        res.status(HttpStatusCode.OK).send("Unsubscribed");
      }
    });
  } catch (error) {
    console.log(error);
    const errorResponse = responseUitls.errorResponse(
      error,
      ExceptionMessage.SOMETHING_WENT_WRONG,
      HttpStatusMessage.INTERNAL_SERVER_ERROR
    );
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(errorResponse);
  }
}

export async function findAddGroupMembers(req: Request, res: Response) {
  try {
    const { reviewId } = req.params;
    // console.log(reviewId);
    const Data = await ChatModel.aggregate([
      { $match: { topic: `chat/reviewer/${reviewId}` } },
      {
        $group: {
          _id: "$name",
          uniqueNames: { $addToSet: "$name" },
        },
      },
      { $sort: { name: 1 } },
      {
        $project: {
          _id: 0,
          name: "$uniqueNames",
        },
      },
    ]);
    const finalResponce = responseUitls.successResponse(
      Data,
      SuccessMessage.GROUP_MEMBERS_FOUND,
      HttpStatusMessage.OK
    );
    res.status(HttpStatusCode.OK).send(finalResponce);
  } catch (error) {
    console.log(error);
    const errorResponse = responseUitls.errorResponse(
      error,
      ExceptionMessage.SOMETHING_WENT_WRONG,
      HttpStatusMessage.INTERNAL_SERVER_ERROR
    );
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(errorResponse);
  }
}
