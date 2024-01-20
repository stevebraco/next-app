"use server";

import { FilterQuery } from "mongoose"
import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import Answer from "@/database/answer.model";

import { assignBadges } from "@/lib/utils";
import { BadgeCriteriaType } from "@/types/index";


export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase();

    const { searchQuery, filter } = params;

    const query: FilterQuery<typeof Question> = {};

    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, "i") } },
        { username: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    let sortOptions = {}

    switch (filter) {
      case 'new_users':
        sortOptions = { joinedAt: -1 }
        break;
      case 'old_users':
        sortOptions = { joinedAt: 1 }
        break;
      case 'top_contributors':
        sortOptions = { reputation: -1 }
        break;

      default:
        break;
    }

    const users = await User.find(query).sort(sortOptions);

    return { users };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// export async function getAllUsers(params: GetAllUsersParams) {
//   try {
//     connectToDatabase();

//     const users = await User.find({});

//     return { users };
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

export async function getUserById(params: any) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();

    const newUser = await User.create(userData);

    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();

    const { clerkId, updateData, path } = params;
    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();

    const { clerkId } = params;
    const user = await User.findOneAndDelete({ clerkId });

    if (!user) {
      throw new Error("User not found");
    }

    // get user question ids
    const userQuestionIds = await Question.find({ author: user._id }).distinct(
      "_id"
    );

    console.log(userQuestionIds)

    // delete user questions
    await Question.deleteMany({ author: user._id });

    const deletedUser = await User.findByIdAndDelete(user._id);

    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    connectToDatabase();
    const { userId, questionId, path } = params

    const user = await User.findById(userId)

    if (!user) {
      throw new Error("User Not Found");
    }

    const isQuestionSaved = user.saved.includes(questionId)

    if (isQuestionSaved) {
      await User.findByIdAndUpdate(userId,
        { $pull: { saved: questionId } },
        { new: true }
      )
    } else {
      await User.findByIdAndUpdate(userId,
        { $addToSet: { saved: questionId } },
        { new: true }
      )
    }
    revalidatePath(path)
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionParams) {

  try {
    connectToDatabase();
    const { clerkId, filter, searchQuery } = params

    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, 'i') } }
      : {}

    let sortOptions = {}

    switch (filter) {
      case 'most_recent':
        sortOptions = { createdAt: -1 }
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 }
        break;
      case 'most_voted':
        sortOptions = { upvotes: -1 }
        break;
      case 'most_viewed':
        sortOptions = { views: -1 }
        break;
      case 'most_answered':
        sortOptions = { answers: -1 }
        break;

      default:
        break;
    }
    const user = await User.findOne({ clerkId }).populate({
      path: 'saved',
      model: Question,
      match: query,
      options: {
        sort: sortOptions
      },
      populate: [
        { path: 'tags', model: Tag, select: "_id name" },
        { path: 'author', model: User, select: "_id clerkId name picture" },
      ]
    })

    if (!user) {
      throw new Error("User Not Found");
    }

    const savedQuestions = user.saved

    return { questions: savedQuestions }

  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error("User not found");
    }

    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });

    const [questionUpvotes] = await Question.aggregate([
      { $match: { author: user._id } },
      {
        $project: {
          _id: 0,
          upvotes: { $size: "$upvotes" },
        },
      },
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: "$upvotes" },
        },
      },
    ]);

    const [answerUpvotes] = await Answer.aggregate([
      { $match: { author: user._id } },
      {
        $project: {
          _id: 0,
          upvotes: { $size: "$upvotes" },
        },
      },
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: "$upvotes" },
        },
      },
    ]);

    const [questionViews] = await Question.aggregate([
      { $match: { author: user._id } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
        },
      },
    ]);

    const criteria = [
      { type: "QUESTION_COUNT" as BadgeCriteriaType, count: totalQuestions },
      { type: "ANSWER_COUNT" as BadgeCriteriaType, count: totalAnswers },
      {
        type: "QUESTION_UPVOTES" as BadgeCriteriaType,
        count: questionUpvotes?.totalUpvotes || 0,
      },
      {
        type: "ANSWER_UPVOTES" as BadgeCriteriaType,
        count: answerUpvotes?.totalUpvotes || 0,
      },
      {
        type: "TOTAL_VIEWS" as BadgeCriteriaType,
        count: questionViews?.totalViews || 0,
      },
    ];

    const badgeCounts = assignBadges({ criteria });

    console.log('badgeCounts', badgeCounts)

    return {
      user,
      totalQuestions,
      totalAnswers,
      badgeCounts,
      reputation: user.reputation,
    };
  } catch (error) {
    console.log(error)
    throw error;

  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    connectToDatabase()
    const { userId } = params

    const totalQuestions = await Question.countDocuments({ author: userId })

    const userQuestion = await Question.find({ author: userId })
      .sort({ views: -1, upvotes: -1 })
      .populate('tags', '_id name')
      .populate('author', '_id clerkId name picture')

    return { totalQuestions, questions: userQuestion }

  } catch (error) {
    console.log(error)
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    connectToDatabase()
    const { userId } = params

    const totalAnswers = await Answer.countDocuments({ author: userId })

    const userAnswer = await Answer.find({ author: userId })
      .sort({ upvotes: -1 })
      .populate('question', '_id title')
      .populate('author', '_id clerkId name picture')

    return { totalAnswers, questions: userAnswer }

  } catch (error) {
    console.log(error)
  }
}

