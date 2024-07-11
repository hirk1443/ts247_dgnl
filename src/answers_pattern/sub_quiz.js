import { Question } from "../question_type/question_type.js";
import ora from "ora";
export function renderSubQuizAnswers(answers, index) {
    let data = `<p><strong>${index}.</strong> Đáp án:</p>`;
    const spinner = ora();
    answers.question.sub_quizzes.forEach((subquiz) => {
        switch (subquiz.question_type) {
            case Question.Type.FILL_IN_THE_BLANK_MULT:
                data += renderFillInTheBlankMultipleAnswers(subquiz);
                break;
            case Question.Type.FILL_IN_THE_BLANK:
                data += renderFillInTheBlankAnswers(subquiz);
                break;
            case Question.Type.MULTIPLE_ANSWERS:
                data = `<p><strong>${index}.</strong> Đáp án: `;
                data += renderMultipleAnswersAnswers(subquiz);
                data += "</p>";
                break;
            case Question.Type.TRUE_FALSE:
                data = `<p><strong>${index}.</strong> Đáp án: `;
                data += renderTrueFalseAnswers(subquiz);
                data += "</p>";
                break;
            case Question.Type.DRAG_AND_DROP:
                data += renderDragAndDropOptions(subquiz);
                break;
            default:
                spinner.warn(`Missing answers types in question ${index++}`);
                // data += `<p>${index} là loại khác</p>`;
                break;
        }
    });
    data += renderSubQuizSolution(answers);
    return data;
}
function renderFillInTheBlankMultipleAnswers(answer) {
    let data = ``;
    let correctParagraph = answer.question_child.answers_empty;
    correctParagraph.forEach((paragraph) => {
        let prefix_input = paragraph.prefix_input;
        prefix_input.forEach((prefix) => {
            switch (prefix.type) {
                case "html":
                    data += `<p>${prefix.content.replaceAll(/<[^<>]*>/g, "")} `;
                    break;
                default:
                    break;
            }
        });
        let correctAnswers = paragraph.correct_answer;
        correctAnswers.forEach((answers) => {
            data += answers;
        });
        let suffix_input = paragraph.suffix_input;
        suffix_input.forEach((suffix) => {
            switch (suffix.type) {
                case "html":
                    data += ` ${suffix.content.replaceAll(/<[^<>]*>/g, "")}</p>`;
                    break;
                default:
                    break;
            }
        });
    });
    data += "</p>";
    return data;
}
function renderFillInTheBlankAnswers(answer) {
    let data = "<p>";
    var prefixInputs = answer.question_child.prefix_input;
    prefixInputs.forEach((prefix) => {
        switch (prefix.type) {
            case "html":
                data += `<p>${prefix.content.replaceAll(/<[^<>]*>/g, "")}`;
                break;
            default:
                break;
        }
    });
    let correctAnswers = answer.question_child.correct_answer;
    correctAnswers.forEach((answers) => {
        data += answers;
    });
    var postfixInput = answer.question_child.suffix_input;
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
function renderMultipleAnswersAnswers(answer) {
    let data = "";
    for (let i = 0; i <= 3; i++) {
        var isCorrect = answer.question_child.options[i].answer;
        if (isCorrect === true) {
            data += `<strong>${String.fromCharCode(65 + i)}</strong> `;
        }
    }
    data += "</p>";
    return data;
}
function renderTrueFalseAnswers(answer) {
    let data = "";
    answer.question_child.options.forEach((option) => {
        if (option.answer === true) {
            data += "<strong>ĐÚNG</strong> ";
        }
        else {
            data += "<strong>SAI</strong> ";
        }
    });
    data += "</p>";
    return data;
}
function renderDragAndDropOptions(answer) {
    let data = "";
    let answers = answer.question_child.editor.secondParagraph.items;
    answers.forEach((option) => {
        data += option.content;
        data += " ";
    });
    data += "</p>";
    return data;
}
function renderSubQuizSolution(solution) {
    let data = "";
    solution.question.sub_quizzes.forEach((subquiz) => {
        switch (subquiz.question_type) {
            case Question.Type.FILL_IN_THE_BLANK_MULT:
                data += renderSolutionCagetory(subquiz.solution_detail);
                break;
            case Question.Type.FILL_IN_THE_BLANK:
                data += renderSolutionCagetory(subquiz.solution_detail);
                break;
            case Question.Type.MULTIPLE_ANSWERS:
                data += renderSolutionCagetory(subquiz.solution_detail);
                break;
            case Question.Type.TRUE_FALSE:
                data += renderSolutionCagetory(subquiz.solution_detail);
                break;
            case Question.Type.DRAG_AND_DROP:
                data += renderSolutionCagetory(subquiz.solution_detail);
                break;
            default:
                break;
        }
    });
    return data;
}
export function renderSolutionCagetory(solution) {
    let data = "";
    solution.forEach((detail) => {
        switch (detail.type) {
            case "html":
                data += detail.content;
                break;
            case "image":
                data += `<img src="${detail.url}"><br>`;
                break;
        }
    });
    return data;
}
