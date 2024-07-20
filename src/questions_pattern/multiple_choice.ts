import { Content, Question } from "../question_type/question_type.js";

export function renderMultipleChoiceOptions(options: Question.MultipleChoice) {
  var data: string = "";

  for (let i = 0; i <= 3; i++) {
    var answerContents = options.question.answers[i].text;
    answerContents.forEach((answerContent) => {
      try {
        switch (answerContent.type) {
          case "html":
            data += `<strong>${String.fromCharCode(
              65 + i
            )}. </strong> ${answerContent.content.replaceAll(
              /<[^<>]*>/g,
              ""
            )}<br>`;
            break;

          case "image":
            data += `<strong>A. </strong> <img src="${answerContent.url}"><br>`;
            break;
          default:
            break;
        }
      } catch (error) {
      }
    });
  }

  return data;
}

export function renderMultipleChoiceQuestions(
  questions: Question.MultipleChoice,
  index: number
) {
  var data: string = "";
  var questionsContent = questions.question.content;
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
