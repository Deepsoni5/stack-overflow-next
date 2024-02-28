"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";
import { CreateQuestionParams, GetQuestionsParams } from "./shared.types";
import User from "@/database/user.model";
import error from "next/error";
import { revalidatePath } from "next/cache";

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
    console.log(path);
    revalidatePath(path);
  } catch (error) {}
}
