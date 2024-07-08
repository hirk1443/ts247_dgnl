import { Content, Question, Replace } from "../question_type/question_type.js";

export function renderMultipleChoiceAnswers(
  answers: Question.MultipleChoice,
  index: number
) {
  let data: string = `<p><strong>${index}</strong>. Đáp án: `;

  for (let i = 0; i <= 3; i++) {
    var isCorrect = answers.question.answers[i].correct;

    if (isCorrect === true) {
      data += `<strong>${String.fromCharCode(65 + i)}</strong>`;
      break;
    }
  }
  data += "</p>";
  return data;
}

export function renderMultipleChoiceSolution(answers: Question.MultipleChoice) {
  let data: string = "";
  let solutionDetailList: Content[] = answers.solution_detail;
  solutionDetailList;
  solutionDetailList.forEach((solution) => {
    switch (solution.type) {
      case "html":
        data += solution.content;
        break;

      case "image":
        data += `<img src="${solution.url}"><br>`;
        break;
    }
  });

  return data;
}
