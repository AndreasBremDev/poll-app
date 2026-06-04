import { Injectable, signal, computed } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js'
import { Categories, Poll } from '../interfaces/interface'
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Supabase {

  supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY);

  polls = signal<Poll[]>([]);
  categories = signal<Categories[]>([]);

  constructor() {
    // Wir casten window zu 'any', damit TypeScript nicht meckert,
    // dass es die Eigenschaft 'supa' nicht kennt.
    (window as any).supa = this;
  }

  async getData(/* pollId: number */) {
    const { data, error } = await this.supabase
      .from('polls')
      .select(`*, categories (*), poll_question!inner ( question: questions ( *,
                    options (*) ) ) `);
    if (error) {
      console.error("Supabase Error:", error.message);
      return;
    } else {
      const processedPolls = this.addAndSortDaysLeft(data as Poll[]);
      this.polls.set(processedPolls);
      return processedPolls;
    }
  }
  
    addAndSortDaysLeft(rawPolls: Poll[]): Poll[] {
      const now = Date.now();
      return rawPolls.map(poll => {
        let dateEndOfDay = new Date(poll.enddate)
        dateEndOfDay.setHours(23, 59, 59, 999);
        let diff = dateEndOfDay.getTime() - now;
        return {
          ...poll,
          daysLeft: Math.floor(diff / (1000 * 60 * 60 * 24)),
        };
      }).sort((a, b) => a.daysLeft - b.daysLeft);
    }

  async getCategories() {
    const { data, error } = await this.supabase.from('categories').select('*');
    if (error) {
      console.error("Supabase Error:", error.message);
      return;
    } else {
      this.categories.set(data as Categories[]);
      return data as Categories[];
    }
  }

}