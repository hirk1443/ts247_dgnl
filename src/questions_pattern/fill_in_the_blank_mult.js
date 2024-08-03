export function renderFillInTheBlankMultipleOptions(options) {
    var data = "";
    var answers = options.question_child.answers_empty;
    answers.forEach((answer) => {
        var prefixInputs = answer.prefix_input;
        prefixInputs.forEach((prefix) => {
            switch (prefix.type) {
                case "html":
                    data += `<p>${prefix.content}:______</p>`;
                    break;
                default:
                    break;
            }
        });
    });
    return data;
}
export function renderFillInTheBlankMultipleQuestion(questions, index) {
    var data = "";
    var questionsContent = questions.question_child.content;
    var temp = 0;
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
