export default function renderDragTheAnswers(
  questionsAndAnswer: any,
  index: number
) {
  var data: string = "<p>";
  try {
    questionsAndAnswer.question.sub_quizzes.forEach((quiz: any) => {
      //   console.log(quiz.question.answers_empty);
      quiz.question.answers_empty.forEach((answer: any) => {
        answer.title.secondParagraph.items.forEach((item: any) => {
          if (item.obj_type === "richText") {
            data += item;
          } else if (item.obj_type === "boxText") {
            data += ":______";
          }
        });
      });
    });
    data += "</p>";
  } catch (error) {
    data += `</p>drag_the_answer: ${error} at ${index}</p>`;
  }
  return data;
}
