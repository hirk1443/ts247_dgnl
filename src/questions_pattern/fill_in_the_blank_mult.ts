import { Content, Question, Replace } from "../question_type/question_type.js";

export function renderFillInTheBlankMultipleOptions(
  options: Replace<
    Question.FillInTheBlankMultiple,
    "question",
    "question_child"
  >
) {
  var data: string = "";
  var answers = options.question_child.answers_empty;
  answers.forEach((answer) => {
    var prefixInputs = answer.prefix_input;
    prefixInputs.forEach((prefix) => {
      switch (prefix.type) {
        case "html":
          data += `<p>${prefix.content.replaceAll(/<[^<>]*>/g, "")}:______</p>`;
          break;
        default:
          break;
      }
    });
  });
  return data;
}

export function renderFillInTheBlankMultipleQuestion(
  questions: Replace<
    Question.FillInTheBlankMultiple,
    "question",
    "question_child"
  >,
  index: number
) {
  var data: string = "";
  var questionsContent = questions.question_child.content;
  var temp: number = 0;

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
