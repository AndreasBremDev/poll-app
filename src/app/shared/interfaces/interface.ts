export interface Option {
    id: number,
    option: string,
    vote: number
}

export interface Question {
    id: number,
    question: string,
    multiple: boolean,
    poll_id: number,
    options: Option[]
}

export interface Categories {
    id: number,
    category: string
}


export interface Poll {
    id: number,
    title: string,
    description: string,
    enddate: string,
    category_id: number,
    categories: Categories,
    questions: Question[],
    daysLeft: number | null
}

export type SurveyStatus = 'active' | 'past';

export interface UploadPollTable {
    title: string,
    description: string | null,
    enddate: string | null,
    category_id: number
}

export interface UploadQuestionTable {
    question: string,
    multiple: boolean,
    poll_id: number
}

export interface UploadOptionTable {
    question_id: number,
    option: string,
    vote: number
}

export interface SurveyFormValue {
    title: string;
    description: string | null;
    enddate: string | null;
    category: string | number;
    questions: {
        questionTitle: string;
        multiple: boolean;
        options: {
            optionTitle: string;
        }[];
    }[];
}