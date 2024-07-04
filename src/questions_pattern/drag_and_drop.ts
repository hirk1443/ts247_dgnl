import { Content, Question, Replace } from "../question_type/question_type.js";

export function renderDragAndDropOptions(
  options: Replace<Question.DragAndDrop, "question", "question_child">
) {
  let data: string =
    "<p>Hãy chọn các phương án phía dưới để điền vào chỗ trống</p><p>";
  let answersOptions = options.question_child.editor.firstParagraph.items;
  answersOptions.forEach((option) => {
    data += `${option.content}\t`;
  });
  data += "</p><p>";
  let answers = options.question_child.editor.secondParagraph.items;
  answers.forEach((option) => {
    switch (option.obj_type) {
      case "richText":
        data += option.content;
        break;
      case "boxText":
        data += "______";
        break;
      default:
        break;
    }
  });
  return data;
}
