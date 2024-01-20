// import { UserButton } from "@clerk/nextjs";
import QuestionCard from "@/components/card/QuestionCard";
import Filter from "@/components/shared/filter/Filter";
import NoResult from "@/components/shared/noResult/NoResult";
import LocalSearchBar from "@/components/shared/search/LocalSearchBar";
import { QuestionFilters } from "@/constants/filters";
import { getSavedQuestions } from "@/lib/actions/user.action";
import { SearchParamsProps } from "@/types/index";
import { auth } from "@clerk/nextjs";


const Page = async ({ searchParams }: SearchParamsProps) => {
  const { userId: clerkId } = auth()

  // const clerkId = '123456789'

  if (!clerkId) return

  const result = await getSavedQuestions({
    clerkId,
    searchQuery: searchParams.q,
    filter: searchParams.filter
  });
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchBar
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />
        <Filter
          filters={QuestionFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        // containerClasses="max-md:flex"
        />
      </div>
      <div className="mt-10 flex w-full flex-col gap-6">
        {result!.questions.length > 0 ? (
          result?.questions.map((question: any) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              answers={question.answers}
              upvotes={question.upvotes}
              views={question.views}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="There's no question to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. our query could be the next big thing others learn from. Get involved! 💡"
            link="/ask-question"
            linkTitle="Ask a question"
          />
        )}
      </div>
    </>
  );
}

export default Page
