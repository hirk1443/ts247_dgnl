export function renderMultipleChoiceOptions(options) {
    var data = "";
    for (let i = 0; i <= 3; i++) {
        var answerContents = options.question.answers[i].text;
        answerContents.forEach((answerContent) => {
            try {
                switch (answerContent.type) {
                    case "html":
                        data += `<strong>${String.fromCharCode(65 + i)}. </strong> ${answerContent.content.replaceAll(/<[^<>]*>/g, "")}<br>`;
                        break;
                    case "image":
                        data += `<strong>A. </strong> <img src="${answerContent.url}"><br>`;
                        break;
                    default:
                        break;
                }
            }
            catch (error) {
            }
        });
    }
    return data;
}
export function renderMultipleChoiceQuestions(questions, index) {
    var data = "";
    var questionsContent = questions.question.content;
    var temp = 0;
    questionsContent.forEach((questionPart) => {
        if (questionPart.type === "html") {
            if (temp++ === 0) {
                data += `<strong>${index}. </strong>${questionPart.content}`;
            }
            else {
                data += questionPart.content;
            }
        }
    });
    return data;
}
