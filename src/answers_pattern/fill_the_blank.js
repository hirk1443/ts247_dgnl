import { renderSolutionCagetory } from "./sub_quiz.js";
export function renderFillInTheBlankAnswers(answer, index) {
    let data = `<p><strong>${index}.</strong> Đáp án:</p>`;
    var prefixInputs = answer.question.prefix_input;
    prefixInputs.forEach((prefix) => {
        switch (prefix.type) {
            case "html":
                data += `<p>${prefix.content.replaceAll(/<[^<>]*>/g, "")}`;
                break;
            default:
                break;
        }
    });
    let correctAnswers = answer.question.correct_answer;
    correctAnswers.forEach((answers) => {
        data += answers;
    });
    var postfixInput = answer.question.suffix_input;
    postfixInput.forEach((postfix) => {
        switch (postfix.type) {
            case "html":
                data += ` ${postfix.content.replaceAll(/<[^<>]*>/g, "")}</p>`;
                break;
            default:
                break;
        }
    });
    data += "</p>";
    return data;
}
export function renderFillInTheBlankSolution(answer) {
    return renderSolutionCagetory(answer.solution_detail);
}
