"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";
import {
  CreateQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from "./shared.types";
import User from "@/database/user.model";

import { revalidatePath } from "next/cache";

export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    connectToDatabase();
    const { questionId } = params;
    const question = await Question.findById(questionId)
      .populate({
        path: "tags",
        model: Tag,
        select: "_id name",
      })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      });

    return question;
  } catch (error) {
    console.log("error in getQuestionsById", error);
  }
}

export async function getQuestion(params: GetQuestionsParams) {
  try {
    connectToDatabase();
    const questions = await Question.find({})
      .populate({
        path: "tags",
        model: Tag,
      })
      .populate({
        path: "author",
        model: User,
      })
      .sort({ createdAt: -1 });

    return { questions };
  } catch (error) {
    console.log("error in getQuestions", error);
  }
}

export async function createQuestion(params: CreateQuestionParams) {
  try {
    // connect to a DB
    connectToDatabase();

    // destruture the sending props from the frontend

    const { title, content, tags, author, path } = params;

    // create a question

    const question = await Question.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];

    // create a tag or get theme if they already exists

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        {
          name: { $regex: new RegExp(`^${tag}$`, "i") },
        },
        {
          $setOnInsert: {
            name: tag,
          },
          $push: {
            questions: question._id,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      tagDocuments.push(existingTag);
    }

    // update the question

    await Question.findByIdAndUpdate(question._id, {
      $push: {
        tags: {
          $each: tagDocuments,
        },
      },
    });

    // create an interaction record for the user's ask question action

    // Increment author's reputation by +5 for creating an action

    revalidatePath(path);
  } catch (error) {}
}

export async function upvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();
    const { questionId, userId, hasdownVoted, hasupVoted, path } = params;

    let updateQuery = {};
    if (hasupVoted) {
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasdownVoted) {
      updateQuery = {
        $pull: {
          downvotes: userId,
        },
        $push: {
          upvotes: userId,
        },
      };
    } else {
      updateQuery = {
        $addToSet: {
          upvotes: userId,
        },
      };
    }

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error("Couldn't find a question");
    }

    // TODO: Add reputation logic

    revalidatePath(path);
  } catch (error) {
    console.log("error in upvoteQuestion action", error);
  }
}

export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();
    const { questionId, userId, hasdownVoted, hasupVoted, path } = params;

    let updateQuery = {};
    if (hasdownVoted) {
      updateQuery = { $pull: { downvotes: userId } };
    } else if (hasupVoted) {
      updateQuery = {
        $pull: {
          upvotes: userId,
        },
        $push: {
          downvotes: userId,
        },
      };
    } else {
      updateQuery = {
        $addToSet: {
          downvotes: userId,
        },
      };
    }

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error("Couldn't find a question");
    }

    // TODO: Add reputation logic

    revalidatePath(path);
  } catch (error) {
    console.log("error in upvoteQuestion action", error);
  }
}
