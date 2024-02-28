"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";

export async function createQuestion(params: any) {
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
  } catch (error) {}
}
