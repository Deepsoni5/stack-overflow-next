"use server";

import { CreateAnswerParams } from "./shared.types";
import { connectToDatabase } from "../mongoose";
import Answer from "@/database/answer.model";
import Question from "@/database/question.model";
import { revalidatePath } from "next/cache";

export async function createAnswer(params: CreateAnswerParams) {
  try {
    connectToDatabase();

    const { content, author, question, path } = params;
    const newAnswer = new Answer({
      content,
      author,
      question,
    });

    // add the answer to question's answer array

    await Question.findByIdAndUpdate(question, {
      $push: {
        answers: newAnswer._id,
      },
    });

    //   TODO: Add interaction

    revalidatePath(path);
  } catch (error) {
    console.log("error in createAnswer", error);
  }
}
