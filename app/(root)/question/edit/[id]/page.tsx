import Question from '@/components/forms/Question'
import { getQuestionById } from '@/lib/actions/question.action';
import { getUserById } from '@/lib/actions/user.action';
import { ParamsProps } from '@/types/index';
import React from 'react'
import { auth } from "@clerk/nextjs";


const page = async ({ params }: ParamsProps) => {
  const { userId } = auth();
  // const userId = "123456789";

  if (!userId) return null

  const mongoUser = await getUserById({ userId })
  const result = await getQuestionById({ questionId: params.id })

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Question</h1>
      <div className="mt-9">
        <Question
          type="Edit"
          mongoUserId={mongoUser._id}
          questionDetails={JSON.stringify(result)}
        />
      </div>
    </>
  )
}

export default page