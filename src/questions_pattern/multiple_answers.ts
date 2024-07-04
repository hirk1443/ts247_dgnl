import { Content, Question, Replace } from "../question_type/question_type.js";
export function renderMultipleAnswersQuestions(
  questions: Replace<Question.MultipleAnswers, "question", "question_child">,
  index: number
) {
  let data: string = "";
  let questionsContent = questions.question_child.content_question;
  let temp: number = 0;

  questionsContent.forEach((questionPart: Content) => {
    if (questionPart.type === "html") {
      if (temp++ === 0) {
        data += `<strong>${index}. </strong>${questionPart.content.replaceAll(
          /<[^<>]*>/g,
          ""
        )}`;
      } else {
        data += questionPart.content;
      }
    }
  });
  data += "<p>Chẳng có ô trống nào ở đây cả, hãy khoanh vào nhiều đáp án</p>";
  return data;
}
export function renderMultipleAnswersOptions(
  options: Replace<Question.MultipleAnswers, "question", "question_child">
) {
  let data: string = "";

  let index: number = 0;
  let answers = options.question_child.options;
  answers.forEach((option) => {
    data += `<strong>${String.fromCharCode(
      65 + index++
    )}. </strong> ${option.content.replaceAll(/<[^<>]*>/g, "")}<br>`;
  });

  return data;
}
