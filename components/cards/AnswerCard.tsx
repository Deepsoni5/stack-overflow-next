import { formatAndDivideNumber, getTimestamp } from "@/lib/utils";
import Link from "next/link";

import React from "react";
import Metric from "../shared/Metric";
import ParseHTML from "../shared/ParseHTML";
import { SignedIn } from "@clerk/nextjs";
import EditDeleteAction from "../shared/EditDeleteAction";

interface Props {
  clerkId?: string | null;
  _id: string;
  answer: string;
  question: {
    _id: string;
    title: string;
  };
  totalAnswers: number | null;
  author: {
    _id: string;
    clerkId: string;
    name: string;
    picture: string;
  };
  upvotes: number[];
  createdAt: Date;
}

const AnswerCard = ({
  clerkId,
  _id,
  question,
  author,
  upvotes,
  createdAt,
  totalAnswers,
  answer,
}: Props) => {
  const showActionsButtons = clerkId && clerkId === author.clerkId;

  // TODO: Add content of the answer
  return (
    <Link
      href={`/question/${question?._id}/#${_id}`}
      className="card-wrapper rounded-[10px] px-11 py-9"
    >
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
          {getTimestamp(createdAt)}
        </span>
        <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
          {question.title}
        </h3>
      </div>
      <SignedIn>
        {showActionsButtons && (
          <EditDeleteAction type="Answer" itemId={JSON.stringify(_id)} />
        )}
      </SignedIn>
      <div className="line-clamp-1 mt-5">
        <ParseHTML data={answer.slice(0, 15)} />
        <span>...</span>
      </div>
      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <Metric
          imgUrl={author.picture}
          alt="user avatar"
          value={author.name}
          title={` • asked ${getTimestamp(createdAt)}`}
          href={`/profile/${author.clerkId}`}
          textStyles="body-medium text-dark400_light700"
          isAUthor
        />
        <div className="flex-center gap-3">
          <Metric
            imgUrl="/assets/icons/like.svg"
            alt="upvotes"
            value={formatAndDivideNumber(upvotes.length)}
            title=" Votes"
            textStyles="small-medium text-dark400_light800"
          />

          {/* <Metric
            imgUrl="/assets/icons/eye.svg"
            alt="eye"
            value={formatAndDivideNumber(views)}
            title=" Views"
            textStyles="small-medium text-dark400_light800"
          /> */}
        </div>
      </div>
    </Link>
  );
};

export default AnswerCard;
