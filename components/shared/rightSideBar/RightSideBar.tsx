import Image from "next/image";
import Link from "next/link";
import React from "react";
import RenderTag from "../renderTag/RenderTag";

const RightSideBar = () => {
  const topQuestions = [
    {
      id: 1,
      title: "test",
    },
    {
      id: 2,
      title: "test",
    },
    {
      id: 3,
      title: "test",
    },
    {
      id: 4,
      title: "test",
    },
  ];
  const popularTags = [
    {
      id: 1,
      name: "Javascript",
      totalQuestions: 5,
    },
    {
      id: 2,
      name: "Javascript",
      totalQuestions: 5,
    },
    {
      id: 3,
      name: "Javascript",
      totalQuestions: 5,
    },
    {
      id: 4,
      name: "Javascript",
      totalQuestions: 5,
    },
  ];
  return (
    <section className="background-light900_dark200 light-border  sticky right-0 top-0 h-screen  w-[350px] flex-col overflow-y-auto border-l p-6 pt-36 shadow-light-300 dark:shadow-none max-xl:hidden">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {topQuestions.map((question) => (
            <Link
              key={question.id}
              href={`/questions/${question.id}`}
              className="flex cursor-pointer items-center justify-between gap-7"
            >
              <p className="body-medium text-dark500_light700">
                {question.title}
              </p>
              <Image
                src="/assets/icons/chevron-right.svg"
                alt="chevron right"
                width={20}
                height={20}
                className="invert-colors"
              />
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {popularTags.map((tag) => (
            <RenderTag
              key={tag.id}
              id={tag.id}
              name={tag.name}
              totalQuestions={tag.totalQuestions}
              showCount
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSideBar;
