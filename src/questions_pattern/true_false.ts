import { Content, Question, Replace } from "../question_type/question_type.js";

export function renderTrueFalseQuestions(
  questions: Replace<Question.TrueFalse, "question", "question_child">,
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

  return data;
}
export function renderTrueFalseOptions(
  options: Replace<Question.TrueFalse, "question", "question_child">
) {
  let data: string =
    "<table><tr><th></th><th><strong>ĐÚNG</strong></th><th><strong>SAI</strong></th></tr>";
  let index: number = 0;
  let answers = options.question_child.options;
  answers.forEach((option) => {
    data += "<tr>";
    data += `<td>${option.content.replaceAll(/<[^<>]*>/g, "")}</td>`;
    data += "</tr>";
  });
  data += "</table>";
  return data;
}
