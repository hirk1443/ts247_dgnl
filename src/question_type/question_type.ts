export type Replace<
  TModel,
  TOldKey extends keyof TModel,
  TNewKey extends string
> = TNewKey extends keyof TModel
  ? never
  : TOldKey extends keyof TModel
  ? {
      [K in keyof Record<
        keyof Omit<TModel, TOldKey> | TNewKey,
        unknown
      >]: K extends keyof TModel ? TModel[K] : TModel[TOldKey];
    }
  : TModel;

export type ContentHTML = {
  type: "html";
  content: string;
};

export type ContentImage = {
  type: "image";
  url: string;
};

export type Content = ContentHTML | ContentImage;

export namespace Question {
  export enum Type {
    MULTIPLE_CHOICE = 1,
    SUBQUIZ = 2,
    FILL_IN_THE_BLANK = 5,
    FILL_IN_THE_BLANK_MULT = 25,
    DRAG_AND_DROP = 33,
    TRUE_FALSE = 35,
    MULTIPLE_ANSWERS = 310,
  }

  type Common = {
    _id: string;
    solution_detail: Content[];
  };

  export type MultipleChoice = Common & {
    question_type: Type.MULTIPLE_CHOICE;
    question: {
      content: Content[];
      answers: {
        text: Content[];
        answer_key: string;
        correct: boolean;
      }[];
    };
  };

  export type SubQuiz = Common & {
    question_type: Type.SUBQUIZ;
    question: {
      content: Content[];
      // sub_quizzes: Replace<Question, "question", "question_child">[]; //fuck this;
      sub_quizzes:
        | Replace<Question.MultipleChoice, "question", "question_child">[]
        | Replace<Question.FillInTheBlank, "question", "question_child">[]
        | Replace<
            Question.FillInTheBlankMultiple,
            "question",
            "question_child"
          >[]
        | Replace<Question.DragAndDrop, "question", "question_child">[]
        | Replace<Question.TrueFalse, "question", "question_child">[]
        | Replace<Question.MultipleAnswers, "question", "question_child">[];
    };
  };

  export type FillInTheBlank = Common & {
    question_type: Type.FILL_IN_THE_BLANK;
    question: {
      content: Content[];
      correct_answer: [];
      prefix_input: Content[];
      suffix_input: Content[];
    };
  };

  export type FillInTheBlankMultiple = Common & {
    question_type: Type.FILL_IN_THE_BLANK_MULT;
    question: {
      content: Content[];
      answers_empty: {
        correct_answer: string[];
        prefix_input: Content[];
        suffix_input: [];
      }[];
    };
  };

  export type TrueFalse = Common & {
    question_type: Type.TRUE_FALSE;
    question: {
      content_question: Content[];
      options: {
        content: string;
        answer: boolean;
      }[];
    };
  };

  export type MultipleAnswers = Common & {
    question_type: Type.MULTIPLE_ANSWERS;
    question: {
      content_question: Content[];
      options: {
        content: string;
        answer: boolean;
      }[];
    };
  };

  type DragAndDropItems = {
    id: string;
    content: string;
    obj_type: string;
  };

  export type DragAndDrop = Common & {
    question_type: Type.DRAG_AND_DROP;
    question: {
      editor: {
        items: {
          content: Content[];
        }[];
        firstParagraph: {
          items: DragAndDropItems[];
        };
        secondParagraph: {
          items: DragAndDropItems[];
        };
      };
    };
  };
}

export type Question =
  | Question.MultipleChoice
  | Question.SubQuiz
  | Question.FillInTheBlank
  | Question.FillInTheBlankMultiple
  | Question.DragAndDrop
  | Question.TrueFalse
  | Question.MultipleAnswers;

export type Session = {
  _id: string;
  questions: Question[];
};
