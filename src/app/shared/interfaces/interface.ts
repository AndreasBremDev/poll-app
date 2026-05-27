export interface Option {
    id: number,
    option: string,
    vote: number
}

export interface Question {
    id: number,
    question: string,
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
    "category-id": number,
    categories: Categories,
    poll_question: { question: Question }[],
    daysLeft: number;
}

export type SurveyStatus = 'active' | 'past';