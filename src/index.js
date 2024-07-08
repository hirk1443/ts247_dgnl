import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import * as cheerio from "cheerio";
import prompts from "prompts";
import { execa } from "execa";
import ky from "ky";
import { renderMultipleChoiceOptions, renderMultipleChoiceQuestions, } from "./questions_pattern/multiple_choice.js";
import { renderFillInTheBlankMultipleOptions, renderFillInTheBlankMultipleQuestion, } from "./questions_pattern/fill_in_the_blank_mult.js";
import { renderFillInTheBlankOptions, renderFillInTheBlankQuestions, } from "./questions_pattern/fill_in_the_blank.js";
import { renderMultipleAnswersQuestions, renderMultipleAnswersOptions, } from "./questions_pattern/multiple_answers.js";
import { renderTrueFalseOptions, renderTrueFalseQuestions, } from "./questions_pattern/true_false.js";
import { renderDragAndDropOptions } from "./questions_pattern/drag_and_drop.js";
import { renderMultipleChoiceAnswers, renderMultipleChoiceSolution, } from "./answers_pattern/multiple_choice.js";
import { renderSubQuizAnswers } from "./answers_pattern/sub_quiz.js";
import { Question } from "./question_type/question_type.js";
var $ = cheerio.load(`<h2 class="title">Tài liệu đgnl được render bởi TLKHMPKV</h2><div class="content"></div>`);
(async () => {
    await initialSetup();
    const { username, password } = await prompts([
        {
            type: "text",
            name: "username",
            message: "Username: ",
        },
        {
            type: "password",
            name: "password",
            message: "Password: ",
        },
    ]);
    const token = await getToken(username, password);
    if (token == undefined) {
        console.log("Wrong credentials");
    }
    else {
        console.log("Login Success");
        while (1) {
            const session = await prompts({
                type: "text",
                name: "url",
                message: "Session: ",
            });
            const sessionData = await getSessionData(session.url, token);
            // console.log(sessionData);
            console.log("Getting Exercises...");
            const exerciseHTML = await getExercises(sessionData.data);
            console.log("Getting Answers...");
            const answersHTML = await getAnswers(sessionData.data);
            console.log("Rendering...");
            await renderHTMLtoLatex(exerciseHTML, sessionData.data.exercise_sheet.name);
            await renderHTMLtoLatex(answersHTML, `Đáp án ${sessionData.data.exercise_sheet.name}`);
        }
    }
})();
async function getToken(username, password) {
    const data = await ky
        .post("https://api-on.tuyensinh247.com/admin/v1/login", {
        json: {
            username: username.toLowerCase().replace(/[^ -~]+/g, ""),
            password: password,
        },
    })
        .json();
    return data.token;
}
async function getSessionData(session, token) {
    const data = await ky
        .get(`https://api-on.tuyensinh247.com/admin/v1/exercise-sheet/session/${session.replace(/[^ -~]+/g, "")}`, { headers: { "x-access-token": token } })
        .json();
    return data;
}
// will refact later
// when? idk
async function getExercises(sessionData) {
    $ = cheerio.load(`<h2 class="title">Tài liệu đgnl được render bởi TLKHMPKV</h2><div class="content"></div>`);
    const $selected = $(".content");
    var index = 1;
    const QnAs = sessionData.questions;
    QnAs.forEach((question) => {
        switch (question.question_type) {
            case Question.Type.MULTIPLE_CHOICE:
                $selected.append(renderMultipleChoiceQuestions(question, index++));
                $selected.append(`<p class='answers${index}'></p>`);
                var $answerParagraph = $(`.answers${index}`);
                $answerParagraph.append(renderMultipleChoiceOptions(question));
                break;
            case Question.Type.SUBQUIZ:
                question.question.sub_quizzes.forEach((subquiz) => {
                    switch (subquiz.question_type) {
                        case Question.Type.FILL_IN_THE_BLANK_MULT:
                            let fillInTheBlankMultipleQuestionContent = subquiz.question_child.content;
                            subquiz.question_child.content = question.question.content;
                            subquiz.question_child.content.push(...fillInTheBlankMultipleQuestionContent);
                            $selected.append(renderFillInTheBlankMultipleQuestion(subquiz, index++));
                            $selected.append(`<p class='answers${index}'></p>`);
                            var $answerParagraph = $(`.answers${index}`);
                            $answerParagraph.append(renderFillInTheBlankMultipleOptions(subquiz));
                            break;
                        case Question.Type.FILL_IN_THE_BLANK:
                            let fillInTheBlankQuestionContent = subquiz.question_child.content;
                            subquiz.question_child.content = question.question.content;
                            subquiz.question_child.content.push(...fillInTheBlankQuestionContent);
                            $selected.append(renderFillInTheBlankQuestions(subquiz, index++));
                            $selected.append(`<p class='answers${index}'></p>`);
                            var $answerParagraph = $(`.answers${index}`);
                            $answerParagraph.append(renderFillInTheBlankOptions(subquiz));
                            break;
                        case Question.Type.MULTIPLE_ANSWERS:
                            let multipleAnsQuestionContent = subquiz.question_child.content_question;
                            subquiz.question_child.content_question =
                                question.question.content;
                            subquiz.question_child.content_question.push(...multipleAnsQuestionContent);
                            $selected.append(renderMultipleAnswersQuestions(subquiz, index++));
                            $selected.append(`<p class='answers${index}'></p>`);
                            var $answerParagraph = $(`.answers${index}`);
                            $answerParagraph.append(renderMultipleAnswersOptions(subquiz));
                            break;
                        case Question.Type.TRUE_FALSE:
                            let trueFalseQuestionContent = subquiz.question_child.content_question;
                            subquiz.question_child.content_question =
                                question.question.content;
                            subquiz.question_child.content_question.push(...trueFalseQuestionContent);
                            $selected.append(renderTrueFalseQuestions(subquiz, index++));
                            $selected.append(`<p class='answers${index}'></p>`);
                            var $answerParagraph = $(`.answers${index}`);
                            $answerParagraph.append(renderTrueFalseOptions(subquiz));
                            break;
                        case Question.Type.DRAG_AND_DROP:
                            let temp = 0;
                            question.question.content.forEach((questionPart) => {
                                if (questionPart.type === "html") {
                                    if (temp++ === 0) {
                                        $selected.append(`<strong>${index}. </strong>${questionPart.content.replaceAll(/<[^<>]*>/g, "")}`);
                                    }
                                    else {
                                        $selected.append(questionPart.content);
                                    }
                                }
                            });
                            index++;
                            $selected.append(`<p class='answers${index}'></p>`);
                            var $answerParagraph = $(`.answers${index}`);
                            $answerParagraph.append(renderDragAndDropOptions(subquiz));
                            break;
                        default:
                            break;
                    }
                });
                break;
            default:
                console.log(`missing question types in question ${index++}`);
                break;
        }
    });
    return $.html();
}
async function getAnswers(sessionData) {
    $ = cheerio.load(`<h2 class="title">Tài liệu đgnl được render bởi TLKHMPKV</h2><div class="content"></div>`);
    const $selected = $(".content");
    let index = 1;
    const QnAs = sessionData.questions;
    QnAs.forEach((question) => {
        switch (question.question_type) {
            case Question.Type.MULTIPLE_CHOICE:
                $selected
                    .append(renderMultipleChoiceAnswers(question, index++))
                    .append(renderMultipleChoiceSolution(question));
                break;
            case Question.Type.SUBQUIZ:
                $selected.append(renderSubQuizAnswers(question, index++));
                break;
        }
    });
    return $.html();
}
async function renderHTMLtoLatex(HTMLdata, outputName) {
    var outputFolder = new URL("../output", import.meta.url);
    await mkdir(outputFolder, { recursive: true }).catch(() => { });
    var tempFile = fileURLToPath(new URL("../output/temp.txt", import.meta.url));
    var metadataFile = fileURLToPath(new URL("../output/metadata.yaml", import.meta.url));
    var outputFile = fileURLToPath(new URL(`../output/${outputName}.pdf`, import.meta.url));
    // do stuff
    await writeFile(tempFile, HTMLdata);
    await writeFile(metadataFile, `---
geometry:
- left = 30mm
- right = 15mm
- top = 20mm
- bottom = 20mm
mainfont: Times New Roman
fontsize: 14pt
documentclass: extarticle

---`);
    await execa `pandoc -r html+tex_math_dollars+tex_math_single_backslash -o ${outputFile} --pdf-engine=xelatex --metadata-file=${metadataFile} ${tempFile}`;
    console.log(`Exported Successfully: ${outputName}.pdf`);
}
async function initialSetup() {
    // check install pandoc
    try {
        await execa `pandoc --version`;
        console.log("Pandoc has been installed!");
    }
    catch (error) {
        console.log("Not install Pandoc, installing...");
        await execa `winget install --source winget --exact --id JohnMacFarlane.Pandoc`;
        console.log("Installed Pandoc!");
    }
    //check install miktex
    try {
        await execa `miktex --version`;
        console.log("Miktex has been installed!");
    }
    catch (error) {
        throw new Error("Not install Miktex, do it urself");
    }
}
