import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import * as cheerio from "cheerio";
import prompts from "prompts";
import { execa } from "execa";
import ky from "ky";
import ora from "ora";

import {
  renderMultipleChoiceOptions,
  renderMultipleChoiceQuestions,
} from "./questions_pattern/multiple_choice.js";
import {
  renderFillInTheBlankMultipleOptions,
  renderFillInTheBlankMultipleQuestion,
} from "./questions_pattern/fill_in_the_blank_mult.js";
import {
  renderFillInTheBlankOptions,
  renderFillInTheBlankOptionsAndNotQuiz,
  renderFillInTheBlankQuestions,
  renderFillInTheBlankQuestionsAndNotQuiz,
} from "./questions_pattern/fill_in_the_blank.js";
import {
  renderMultipleAnswersQuestions,
  renderMultipleAnswersOptions,
} from "./questions_pattern/multiple_answers.js";
import {
  renderTrueFalseOptions,
  renderTrueFalseQuestions,
} from "./questions_pattern/true_false.js";
import { renderDragAndDropOptions } from "./questions_pattern/drag_and_drop.js";

import {
  renderMultipleChoiceAnswers,
  renderMultipleChoiceSolution,
} from "./answers_pattern/multiple_choice.js";

import {
  renderFillInTheBlankSolution,
  renderFillInTheBlankAnswers,
} from "./answers_pattern/fill_the_blank.js";

import { renderSubQuizAnswers } from "./answers_pattern/sub_quiz.js";

import { Question, Session, Content } from "./question_type/question_type.js";

var $ = cheerio.load(
  `<h2 class="title">Tài liệu đgnl được render bởi TLKHMPKV</h2><div class="content"></div>`
);

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
  let spinner = ora("Logging in...").start();
  const token = await getToken(username, password);

  if (token == undefined) {
    spinner.fail("Wrong credentials");
  } else {
    spinner.succeed("Login Success");
    while (1) {
      const session = await prompts({
        type: "text",
        name: "url",
        message: "Session: ",
      });
      const isExam = await prompts({
        type: "toggle",
        name: "isExam",
        message: "Is this an exam?",
        initial: true,
        active: "yes",
        inactive: "no",
      });
      let sessionData, exerciseHTML, answersHTML, documentName;
      if (isExam.isExam) {
        sessionData = await getExamSessionData(session.url, token);
        // console.log(sessionData.question_exam);
        exerciseHTML = await getExercises(sessionData.session_exam.dgtd_bk_dh);
        answersHTML = await getAnswers(sessionData.session_exam.dgtd_bk_dh);
        documentName = sessionData.session_exam.exam.title;
      } else {
        sessionData = await getSessionData(session.url, token);
        // console.log(sessionData);
        exerciseHTML = await getExercises(sessionData.data);
        answersHTML = await getAnswers(sessionData.data);
        documentName = sessionData.data.exercise_sheet.name;
      }

      //tex issues
      await renderHTMLtoLatex(
        exerciseHTML.replaceAll("\\limits_", ""),
        documentName
      );
      await renderHTMLtoLatex(
        answersHTML.replaceAll("\\limits_", ""),
        `Đáp án ${documentName}`
      );
    }
  }
})();

async function getToken(username: string, password: string) {
  try {
    const data: any = await ky
      .post("https://api-on.tuyensinh247.com/admin/v1/login", {
        json: {
          username: username.toLowerCase().replace(/[^ -~]+/g, ""),
          password: password,
        },
      })
      .json();
    return data.token;
  } catch (error) {
    return undefined;
  }
}

async function getSessionData(session: string, token: string) {
  const data: any = await ky
    .get(
      `https://api-on.tuyensinh247.com/admin/v1/exercise-sheet/session/${session.replace(
        /[^ -~]+/g,
        ""
      )}`,
      { headers: { "x-access-token": token } }
    )
    .json();
  return data;
}

async function getExamSessionData(session: string, token: string) {
  const data: any = await ky
    .get(
      `https://api-on.tuyensinh247.com/admin/v1/exam-dgnl/${session.replace(
        /[^ -~]+/g,
        ""
      )}`,
      { headers: { "x-access-token": token } }
    )
    .json();
  return data;
}

// will refact later
// when? idk
async function getExercises(sessionData: Session) {
  const spinner = ora();
  $ = cheerio.load(
    `<h2 class="title">Tài liệu đgnl được render bởi TLKHMPKV</h2><div class="content"></div>`
  );
  const $selected = $(".content");
  var index: number = 1;
  const QnAs: Question[] = sessionData.questions;

  //still wrong, will fix later
  let prevQuestion: Content[] = [];

  QnAs.forEach((question: Question) => {
    switch (question.question_type) {
      case Question.Type.MULTIPLE_CHOICE:
        if (prevQuestion !== question.question.content) {
          $selected.append(renderMultipleChoiceQuestions(question, index++));
          prevQuestion = question.question.content;
        }

        $selected.append(`<p class='answers${index}'></p>`);
        var $answerParagraph = $(`.answers${index}`);
        $answerParagraph.append(renderMultipleChoiceOptions(question));

        break;
      case Question.Type.FILL_IN_THE_BLANK:
        if (prevQuestion !== question.question.content) {
          $selected.append(
            renderFillInTheBlankQuestionsAndNotQuiz(question, index++)
          );
          prevQuestion = question.question.content;
        }

        $selected.append(`<p class='answers${index}'></p>`);
        var $answerParagraph = $(`.answers${index}`);
        $answerParagraph.append(
          renderFillInTheBlankOptionsAndNotQuiz(question)
        );
        break;
      case Question.Type.SUBQUIZ:
        question.question.sub_quizzes.forEach((subquiz) => {
          switch (subquiz.question_type) {
            case Question.Type.FILL_IN_THE_BLANK_MULT:
              let fillInTheBlankMultipleQuestionContent =
                subquiz.question_child.content;
              subquiz.question_child.content = question.question.content;
              subquiz.question_child.content.push(
                ...fillInTheBlankMultipleQuestionContent
              );
              if ((prevQuestion = question.question.content)) {
                $selected.append(
                  renderFillInTheBlankMultipleQuestion(subquiz, index++)
                );
                prevQuestion = question.question.content;
              }

              $selected.append(`<p class='answers${index}'></p>`);
              var $answerParagraph = $(`.answers${index}`);
              $answerParagraph.append(
                renderFillInTheBlankMultipleOptions(subquiz)
              );

              break;
            case Question.Type.FILL_IN_THE_BLANK:
              let fillInTheBlankQuestionContent =
                subquiz.question_child.content;
              subquiz.question_child.content = question.question.content;
              subquiz.question_child.content.push(
                ...fillInTheBlankQuestionContent
              );
              if ((prevQuestion = question.question.content)) {
                $selected.append(
                  renderFillInTheBlankQuestions(subquiz, index++)
                );

                prevQuestion = question.question.content;
              }
              $selected.append(`<p class='answers${index}'></p>`);
              var $answerParagraph = $(`.answers${index}`);
              $answerParagraph.append(renderFillInTheBlankOptions(subquiz));
              break;
            case Question.Type.MULTIPLE_ANSWERS:
              let multipleAnsQuestionContent =
                subquiz.question_child.content_question;
              subquiz.question_child.content_question =
                question.question.content;
              subquiz.question_child.content_question.push(
                ...multipleAnsQuestionContent
              );

              if ((prevQuestion = question.question.content)) {
                $selected.append(
                  renderMultipleAnswersQuestions(subquiz, index++)
                );
                prevQuestion = question.question.content;
              }
              $selected.append(`<p class='answers${index}'></p>`);
              var $answerParagraph = $(`.answers${index}`);
              $answerParagraph.append(renderMultipleAnswersOptions(subquiz));
              break;
            case Question.Type.TRUE_FALSE:
              let trueFalseQuestionContent =
                subquiz.question_child.content_question;
              subquiz.question_child.content_question =
                question.question.content;
              subquiz.question_child.content_question.push(
                ...trueFalseQuestionContent
              );
              if ((prevQuestion = question.question.content)) {
                $selected.append(renderTrueFalseQuestions(subquiz, index++));
                prevQuestion = question.question.content;
              }
              $selected.append(`<p class='answers${index}'></p>`);
              var $answerParagraph = $(`.answers${index}`);
              $answerParagraph.append(renderTrueFalseOptions(subquiz));
              break;
            case Question.Type.DRAG_AND_DROP:
              let temp: number = 0;
              if ((prevQuestion = question.question.content)) {
                question.question.content.forEach((questionPart: Content) => {
                  if (questionPart.type === "html") {
                    if (temp++ === 0) {
                      $selected.append(
                        `<strong>${index}. </strong>${questionPart.content}`
                      );
                    } else {
                      $selected.append(questionPart.content);
                    }
                  }
                });
                index++;
                prevQuestion = question.question.content;
              }

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
        spinner.warn(`Missing question types in question ${index++}`);
        break;
    }
  });

  return $.html();
}

async function getAnswers(sessionData: Session) {
  $ = cheerio.load(
    `<h2 class="title">Tài liệu đgnl được render bởi TLKHMPKV</h2><div class="content"></div>`
  );
  const $selected = $(".content");
  let index: number = 1;
  const QnAs = sessionData.questions;
  QnAs.forEach((question: Question) => {
    switch (question.question_type) {
      case Question.Type.MULTIPLE_CHOICE:
        $selected
          .append(renderMultipleChoiceAnswers(question, index++))
          .append(renderMultipleChoiceSolution(question));
        break;
      case Question.Type.FILL_IN_THE_BLANK:
        $selected
          .append(renderFillInTheBlankAnswers(question, index++))
          .append(renderFillInTheBlankSolution(question));
        break;

      case Question.Type.SUBQUIZ:
        $selected.append(renderSubQuizAnswers(question, index++));
        break;
    }
  });

  return $.html();
}

async function renderHTMLtoLatex(HTMLdata: any, outputName: string) {
  const spinner = ora(`Rendering ${outputName}.pdf ...`).start();
  var outputFolder = new URL("../output", import.meta.url);
  await mkdir(outputFolder, { recursive: true }).catch(() => {});

  var tempFile = fileURLToPath(new URL("../output/temp.html", import.meta.url));
  var metadataFile = fileURLToPath(
    new URL("../output/metadata.yaml", import.meta.url)
  );
  var outputFile = fileURLToPath(
    new URL(`../output/${outputName}.pdf`, import.meta.url)
  );

  // do stuff
  await writeFile(tempFile, HTMLdata);
  await writeFile(
    metadataFile,
    `---
geometry:
- left = 30mm
- right = 15mm
- top = 20mm
- bottom = 20mm
mainfont: Times New Roman
fontsize: 14pt
documentclass: extarticle

---`
  );

  await execa`pandoc -r html+tex_math_dollars+tex_math_single_backslash+tex_math_double_backslash -o ${outputFile} -s --pdf-engine=xelatex --metadata-file=${metadataFile} ${tempFile}`;

  spinner.succeed(`Exported Successfully: ${outputName}.pdf`);
}

async function initialSetup() {
  const spinner = ora("Initializing").start();
  // check install pandoc
  try {
    await execa`pandoc --version`;
    spinner.succeed("Pandoc has been installed!");
  } catch (error) {
    spinner.text = "Not install Pandoc, installing...";
    await execa`winget install --source winget --exact --id JohnMacFarlane.Pandoc`;
    spinner.succeed("Installed Pandoc!");
  }
  //check install miktex
  try {
    await execa`miktex --version`;
    spinner.succeed("Miktex has been installed!");
  } catch (error) {
    throw new Error("Not install Miktex, do it urself");
  }
}
