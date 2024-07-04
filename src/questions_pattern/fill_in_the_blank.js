export function renderFillInTheBlankQuestions(questions, index) {
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
export function renderFillInTheBlankOptions(options) {
    var data = "";
    var prefixInputs = options.question_child.prefix_input;
    prefixInputs.forEach((prefix) => {
        switch (prefix.type) {
            case "html":
                data += `<p>${prefix.content.replaceAll(/<[^<>]*>/g, "")}______`;
                break;
            default:
                break;
        }
    });
    var postfixInput = options.question_child.suffix_input;
    postfixInput.forEach((postfix) => {
        switch (postfix.type) {
            case "html":
                data += `${postfix.content.replaceAll(/<[^<>]*>/g, "")}</p>`;
                break;
            default:
                break;
        }
    });
    return data;
}
