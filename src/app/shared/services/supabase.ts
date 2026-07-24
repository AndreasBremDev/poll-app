import { Injectable, signal, computed } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js'
import { Categories, Poll, SurveyFormValue, UploadOptionTable, UploadPollTable, UploadQuestionTable } from '../interfaces/interface'
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Supabase {

  client = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY);

  polls = signal<Poll[]>([]);
  categories = signal<Categories[]>([]);

  async getData(): Promise<Poll[]> {
    const { data, error } = await this.client
      .from('polls')
      .select(`*, categories (*), questions ( *, options (*) ) `);
    if (error) {
      console.error("Supabase getData() Error:", error.message);
      return [];
    } else {
      return data as Poll[]
    }
  }

  async loadPolls(): Promise<Poll[]> {
    const rawData = await this.getData();
    let processedPolls = this.addAndSortDaysLeft(rawData);
    processedPolls = this.sortOptionsById(processedPolls);
    this.polls.set(processedPolls);
    return processedPolls
  }

  async upsertVoteData(optionsToUpload: { id: number; vote: number }[]) {
    const { data, error } = await this.client
      .from('options')
      .upsert(optionsToUpload);
    if (error) {
      console.error('Supabase error: ', error)
      throw error
    }
    return data;
  }

  addAndSortDaysLeft(rawPolls: Poll[]): Poll[] {
    const now = Date.now();
    return rawPolls
      .map(poll => this.calculateDaysLeftForPoll(poll, now))
      .sort((a, b) => this.sortDaysLeft(a, b));
  }

  calculateDaysLeftForPoll(poll: Poll, now: number): Poll {
    if (!poll.enddate) {
      return {
        ...poll,
        daysLeft: null
      }
    }
    const dateEndOfDay = new Date(poll.enddate)
    dateEndOfDay.setHours(23, 59, 59, 999);
    const diff = dateEndOfDay.getTime() - now;
    return {
      ...poll,
      daysLeft: Math.floor(diff / (1000 * 60 * 60 * 24)),
    };
  }

  sortDaysLeft(a: Poll, b: Poll): number {
    if (a.daysLeft === null && b.daysLeft === null) return 0;
    if (a.daysLeft === null) return 1;
    if (b.daysLeft === null) return -1;
    return a.daysLeft - b.daysLeft
  }

  sortOptionsById(rawPolls: Poll[]): Poll[] {
    return rawPolls.map(poll => ({
      ...poll,
      questions: poll.questions.map(q => ({
        ...q,
        options: q.options
          ? [...q.options].sort((a, b) => a.id - b.id)
          : []
      }))
    }));
  }

  async getCategories() {
    const { data, error } = await this.client
      .from('categories').select('*');
    if (error) {
      console.error("Supabase Error:", error.message);
      return;
    } else {
      this.categories.set(data as Categories[]);
      return data as Categories[];
    }
  }

  async saveSurvey(formValues: SurveyFormValue): Promise<void> {
    const pollPayload: UploadPollTable = this.prepareDataPoll(formValues);
    const { data: pollData, error: pollError } = await this.client.from('polls').insert(pollPayload).select().single();
    if (pollError || !pollData) throw pollError;
    const questionsPayload: UploadQuestionTable[] = this.prepareDataQuestion(formValues, pollData);
    const { data: questionsData, error: questionsError } = await this.client.from('questions').insert(questionsPayload).select();
    if (questionsError || !questionsData) throw questionsError;
    const optionsPayload: UploadOptionTable[] = [];
    this.prepareDataOption(formValues, questionsData, optionsPayload);
    const { error: optionsError } = await this.client.from('options').insert(optionsPayload);
    if (optionsError) throw optionsError;
  }

  private prepareDataPoll(formValues: SurveyFormValue): UploadPollTable {
    return {
      title: formValues.title,
      description: formValues.description,
      enddate: formValues.enddate,
      category_id: Number(formValues.category)
    };
  }

  private prepareDataQuestion(formValues: SurveyFormValue, pollData: any): UploadQuestionTable[] {
    return formValues.questions.map(q => ({
      question: q.questionTitle,
      multiple: q.multiple,
      poll_id: pollData.id
    }));
  }

  private prepareDataOption(formValues: SurveyFormValue, questionsData: any[], optionsPayload: UploadOptionTable[]) {
    formValues.questions.forEach((qForm, index) => {
      const createdQuestionId = questionsData[index].id;
      qForm.options.forEach(optForm => {
        optionsPayload.push({
          option: optForm.optionTitle,
          vote: 0,
          question_id: createdQuestionId
        });
      });
    });
  }

}