import QuestionCard from '@/components/card/QuestionCard'
import { UserId } from '@/lib/actions/shared.types'
import { getUserQuestions } from '@/lib/actions/user.action'
import { SearchParamsProps } from '@/types/index'
import React from 'react'

interface Props extends SearchParamsProps, UserId {
  clerkId?: string | null;
}

const QuestionTab = async ({ searchParams, userId, clerkId }: Props) => {
  const result = await getUserQuestions({ userId, page: 1 })
  return (
    <>
      {result?.questions.map((question: any) => (
        <QuestionCard
          key={question._id}
          _id={question._id}
          clerkId={clerkId}
          title={question.title}
          tags={question.tags}
          author={question.author}
          upvotes={question.upvotes}
          views={question.views}
          answers={question.answers}
          createdAt={question.createdAt}
        />
      ))}
    </>
  )
}

export default QuestionTab