export function renderMultipleAnswersQuestions(questions, index) {
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
    data += "<p>Chẳng có ô trống nào ở đây cả, hãy khoanh vào nhiều đáp án</p>";
    return data;
}
export function renderMultipleAnswersOptions(options) {
    let data = "";
    let index = 0;
    let answers = options.question_child.options;
    answers.forEach((option) => {
        data += `<strong>${String.fromCharCode(65 + index++)}. </strong> ${option.content.replaceAll(/<[^<>]*>/g, "")}<br>`;
    });
    return data;
}
