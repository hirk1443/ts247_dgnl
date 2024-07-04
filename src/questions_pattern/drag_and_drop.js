export function renderDragAndDropOptions(options) {
    let data = "<p>Hãy chọn các phương án phía dưới để điền vào chỗ trống</p><p>";
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
