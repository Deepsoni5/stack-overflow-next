"use server";

import User from "@/database/user.model";
import { FilterQuery } from "mongoose";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import Answer from "@/database/answer.model";

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase();
    // const { page = 1, pageSize = 20, filter, searchQuery } = params;

    const users = await User.find({}).sort({ createdAt: -1 });

    return { users };
  } catch (error) {
    console.log("error while getAllUsers", error);
  }
}
// export async function getAllUsers(params: GetAllUsersParams) {
//   try {
//     connectToDatabase();
//   } catch (error) {
//     console.log("error while getAllUsers", error);
//   }
// }
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
    console.log(deleteUser);
    return deleteUser;
  } catch (error) {
    console.log("error while creating user user.action.ts", error);
  }
}
export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    connectToDatabase();
    const { userId, questionId, path } = params;
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }
    const isQuestionSaved = user.saved.includes(questionId);
    if (isQuestionSaved) {
      // remove
      await User.findByIdAndUpdate(
        userId,
        {
          $pull: {
            saved: questionId,
          },
        },
        {
          new: true,
        }
      );
    } else {
      // add question
      await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: {
            saved: questionId,
          },
        },
        {
          new: true,
        }
      );
    }

    revalidatePath(path);
  } catch (error) {
    console.log("error while getAllUsers", error);
  }
}
export async function getSavedQuestion(params: GetSavedQuestionsParams) {
  try {
    connectToDatabase();
    const { clerkId, page = 1, pageSize = 10, filter, searchQuery } = params;
    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};
    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        sort: { createdAt: -1 },
      },
      populate: [
        {
          path: "tags",
          model: Tag,
          select: "_id name",
        },
        {
          path: "author",
          model: User,
          select: "_id clerkId name picture",
        },
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    const savedQuestion = user.saved;
    return {
      questions: savedQuestion,
    };
  } catch (error) {
    console.log("error while getAllUsers", error);
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    connectToDatabase();
    const { userId } = params;
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new Error("User not found");
    }

    const totalQuestions = await Question.countDocuments({ author: user._id });

    const totalAnswers = await Answer.countDocuments({ author: user._id });

    return {
      user,
      totalQuestions,
      totalAnswers,
    };
  } catch (error) {
    console.log("error while getAllUsers", error);
  }
}
