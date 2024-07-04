export function renderTrueFalseQuestions(questions, index) {
    let data = "";
    let questionsContent = questions.question_child.content_question;
    let temp = 0;
    questionsContent.forEach((questionPart) => {
        if (questionPart.type === "html") {
            if (temp++ === 0) {
                data += `<strong>${index}. </strong>${questionPart.content.replaceAll(/<[^<>]*>/g, "")}`;
            }
            else {
                data += questionPart.content;
            }
        }
    });
    return data;
}
export function renderTrueFalseOptions(options) {
    let data = "<table><tr><th></th><th><strong>ĐÚNG</strong></th><th><strong>SAI</strong></th></tr>";
    let index = 0;
    let answers = options.question_child.options;
    answers.forEach((option) => {
        data += "<tr>";
        data += `<td>${option.content.replaceAll(/<[^<>]*>/g, "")}</td>`;
        data += "</tr>";
    });
    data += "</table>";
    return data;
}
