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

export interface Poll {
    id: number,
    title: string,
    description: string,
    category: string,
    enddate: string,
    poll_question: { question: Question }[]
}