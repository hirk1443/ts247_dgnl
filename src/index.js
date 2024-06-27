import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import * as cheerio from "cheerio";
import prompts from "prompts";
import { $ } from "execa";
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
        // console.log(token);
        console.log("Login Success");
        while (1) {
            const session = await prompts({
                type: "text",
                name: "url",
                message: "Session: ",
            });
            //get exercises in plain text
            const sessionData = await getSessionData(session.url, token);
            console.log("Getting Exercises...");
            const exerciseHTML = await getExercises(sessionData);
            console.log("Getting Answers...");
            const answersHTML = await getAnswers(sessionData);
            console.log("Rendering...");
            // if (isInstalled === 1) {
            //   console.log(
            //     "Note: first rendering after installing required tools will be slow (and will show some pop-ups), please follow the instructions"
            //   );
            // }
            await renderHTMLtoLatex(exerciseHTML, sessionData.data.exercise_sheet.name);
            await renderHTMLtoLatex(answersHTML, `Đáp án ${sessionData.data.exercise_sheet.name}`);
        }
    }
})();
async function getToken(username, password) {
    const data = await fetch("https://api-on.tuyensinh247.com/admin/v1/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username.toLowerCase(),
            password: password,
        }),
    }).then((res) => res.json());
    // console.log(data);
    return data.token;
}
async function getSessionData(session, token) {
    // console.log(session);
    const data = await fetch(`https://api-on.tuyensinh247.com/admin/v1/exercise-sheet/session/${session}`, {
        headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
        },
    }).then((res) => res.json());
    return data;
}
async function getExercises(sessionData) {
    const $ = cheerio.load(`<h2 class="title">Tài liệu đgnl được render bởi TLKHMPKV</h2><div class="content"></div>`);
    const $selected = $(".content");
    var index = 1;
    const QnAs = sessionData.data.questions;
    QnAs.forEach((questionsAndAnswer) => {
        var answerA = questionsAndAnswer.question.answers[0].text[0].content;
        var answerB = questionsAndAnswer.question.answers[1].text[0].content;
        var answerC = questionsAndAnswer.question.answers[2].text[0].content;
        var answerD = questionsAndAnswer.question.answers[3].text[0].content;
        // console.log(answerA);
        if (answerA != undefined)
            answerA = answerA.toString().replaceAll(/<[^<>]*>/g, "");
        if (answerB != undefined)
            answerB = answerB.toString().replaceAll(/<[^<>]*>/g, "");
        if (answerC != undefined)
            answerC = answerC.toString().replaceAll(/<[^<>]*>/g, "");
        if (answerD != undefined)
            answerD = answerD.toString().replaceAll(/<[^<>]*>/g, "");
        $selected.append(`<strong>${index++}. </strong>${questionsAndAnswer.question.content[0].content.replaceAll(/<[^<>]*>/g, "")}`);
        $selected.append(`<p class='answers${index}'></p>`);
        var $answerParagraph = $(`.answers${index}`);
        if (answerA != undefined)
            $answerParagraph.append(`<strong>A. </strong> ${answerA}<br>`);
        else
            $answerParagraph.append(`<strong>A. </strong> <img src="${questionsAndAnswer.question.answers[0].text[0].url}"><br>`);
        if (answerB != undefined)
            $answerParagraph.append(`<strong>B. </strong> ${answerB}<br>`);
        else
            $answerParagraph.append(`<strong>B. </strong> <img src="${questionsAndAnswer.question.answers[1].text[0].url}"><br>`);
        if (answerC != undefined)
            $answerParagraph.append(`<strong>C. </strong> ${answerC}<br>`);
        else
            $answerParagraph.append(`<strong>C. </strong> <img src="${questionsAndAnswer.question.answers[2].text[0].url}"><br>`);
        if (answerD != undefined)
            $answerParagraph.append(`<strong>D. </strong> ${answerD}<br>`);
        else
            $answerParagraph.append(`<strong>D. </strong> <img src="${questionsAndAnswer.question.answers[3].text[0].url}"><br>`);
    });
    return $.html();
}
async function getAnswers(sessionData) {
    const $ = cheerio.load(`<h2 class="title">Tài liệu đgnl được render bởi TLKHMPKV</h2><div class="content"></div>`);
    const $selected = $(".content");
    $selected.append(`<table></table>`);
    const $table = $("table");
    var $row;
    const QnAs = sessionData.data.questions;
    var index = 1;
    QnAs.forEach((questionsAndAnswer) => {
        if (index % 10 === 1) {
            $table.append(`<tr class="row${Math.floor(index / 10) + 1}"></tr>`);
            $row = $(`.row${Math.floor(index / 10) + 1}`);
        }
        questionsAndAnswer.question.answers.forEach((answer) => {
            if (answer.correct === true) {
                $row.append(`<td>${index++}. <strong>${answer.answer_key
                    .toString()
                    .toUpperCase()}</strong></td>`);
            }
        });
    });
    index = 1;
    QnAs.forEach((questionAndAnswer) => {
        $selected.append(`<p><p><strong>Câu ${index++}: </strong></p>${questionAndAnswer.solution_detail[0].content}</p><br>`);
    });
    // console.log($.html());
    return $.html();
}
async function renderHTMLtoLatex(HTMLdata, outputName) {
    let outputFolder = new URL("../output", import.meta.url);
    await mkdir(outputFolder, { recursive: true }).catch(() => { });
    let tempFile = fileURLToPath(new URL("../output/temp.txt", import.meta.url));
    let metadataFile = fileURLToPath(new URL("../output/metadata.yaml", import.meta.url));
    let outputFile = fileURLToPath(new URL(`../output/${outputName}.pdf`, import.meta.url));
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
    await $ `pandoc -r html+tex_math_dollars+tex_math_single_backslash -o ${outputFile} --pdf-engine=xelatex --metadata-file=${metadataFile} ${tempFile}`;
    console.log(`Exported Successfully: ${outputName}.pdf`);
}
async function initialSetup() {
    // check install pandoc
    try {
        await $ `pandoc --version`;
        console.log("Pandoc has been installed!");
    }
    catch (error) {
        console.log("Not install Pandoc, installing...");
        await $ `winget install --source winget --exact --id JohnMacFarlane.Pandoc`;
        console.log("Installed Pandoc!");
    }
    //check install miktex
    try {
        await $ `miktex --version`;
        console.log("Miktex has been installed!");
    }
    catch (error) {
        throw new Error("Not install Miktex, do it urself");
    }
}
