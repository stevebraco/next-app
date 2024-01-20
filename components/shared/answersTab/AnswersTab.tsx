import QuestionCard from '@/components/card/QuestionCard'
import { getUserAnswers } from '@/lib/actions/user.action'
import { SearchParamsProps } from '@/types/index'
import React from 'react'
import AnswerCard from '../../card/AnswerCard'

interface Props extends SearchParamsProps {
  userId: string,
  clerkId?: string | null;
}
const AnswersTab = async ({ searchParams, userId, clerkId }: Props) => {
  const result = await getUserAnswers({ userId, page: 1 })
  return (

    <>
      {result?.questions.map((answer: any) => (
        <AnswerCard
          key={answer._id}
          clerkId={clerkId}
          _id={answer._id}
          question={answer.question}
          author={answer.author}
          upvotes={answer.upvotes}
          createdAt={answer.createdAt}
        />
      ))}
    </>
  )
}

export default AnswersTab