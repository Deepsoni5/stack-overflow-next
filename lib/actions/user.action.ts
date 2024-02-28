"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";

export async function getUserById(params: any) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({
      clerkId: userId,
    });

    return user;
  } catch (error) {
    console.log("error while fetching single user user.action.ts", error);
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();

    const newUser = await User.create(userData);
    return newUser;
  } catch (error) {
    console.log("error while creating user user.action.ts", error);
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();
    const { clerkId, updateData, path } = params;

    await User.findOneAndUpdate({ clerkId }, updateData, { new: true });

    revalidatePath(path);
  } catch (error) {
    console.log("error while creating user user.action.ts", error);
  }
}
export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();

    const { clerkId } = params;
    const user = await User.findOneAndDelete({ clerkId });

    if (!user) {
      throw new Error("user not found!!");
    }

    // delete all the things that user have done i.e questions , answers etc....

    // delete user question
    const userQuestionIds = await Question.find({
      author: user._id,
    }).distinct("_id");
    console.log(userQuestionIds);
    await Question.deleteMany({ author: user._id });

    // TODO: Delete answers and all the things ...

    const deletedUser = await User.findByIdAndDelete(user._id);
    return deleteUser;
    console.log(deleteUser);
  } catch (error) {
    console.log("error while creating user user.action.ts", error);
  }
}
