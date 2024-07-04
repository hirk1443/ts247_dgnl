export default function renderDragTheAnswers(questionsAndAnswer, index) {
    var data = "<p>";
    try {
        questionsAndAnswer.question.sub_quizzes.forEach((quiz) => {
            //   console.log(quiz.question.answers_empty);
            quiz.question.answers_empty.forEach((answer) => {
                answer.title.secondParagraph.items.forEach((item) => {
                    if (item.obj_type === "richText") {
                        data += item;
                    }
                    else if (item.obj_type === "boxText") {
                        data += ":______";
                    }
                });
            });
        });
        data += "</p>";
    }
    catch (error) {
        data += `</p>drag_the_answer: ${error} at ${index}</p>`;
    }
    return data;
}
