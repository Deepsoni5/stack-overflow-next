import { getUserAnswers } from "@/lib/actions/user.action";
import { SearchParamsProps } from "@/types";
import React from "react";
import AnswerCard from "../cards/AnswerCard";
import console from "console";
interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}
const AnswersTab = async ({ searchParams, userId, clerkId }: Props) => {
  const result = await getUserAnswers({
    userId,
    page: 1,
  });

  return (
    <>
      {result?.answers?.map((item) => (
        <AnswerCard
          key={item._id}
          answer={item.content}
          totalAnswers={result.totalAnswers}
          clerkId={clerkId}
          _id={item._id}
          question={item.question}
          author={item.author}
          upvotes={item.upvotes}
          createdAt={item.createdAt}
        />
      ))}
    </>
  );
};

export default AnswersTab;
