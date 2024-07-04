export var Question;
(function (Question) {
    let Type;
    (function (Type) {
        Type[Type["MULTIPLE_CHOICE"] = 1] = "MULTIPLE_CHOICE";
        Type[Type["SUBQUIZ"] = 2] = "SUBQUIZ";
        Type[Type["FILL_IN_THE_BLANK"] = 5] = "FILL_IN_THE_BLANK";
        Type[Type["FILL_IN_THE_BLANK_MULT"] = 25] = "FILL_IN_THE_BLANK_MULT";
        Type[Type["DRAG_AND_DROP"] = 33] = "DRAG_AND_DROP";
        Type[Type["TRUE_FALSE"] = 35] = "TRUE_FALSE";
        Type[Type["MULTIPLE_ANSWERS"] = 310] = "MULTIPLE_ANSWERS";
    })(Type = Question.Type || (Question.Type = {}));
})(Question || (Question = {}));
