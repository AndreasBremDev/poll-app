import { Injectable, signal, computed } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js'
import { Poll } from '../interfaces/interface'
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Supabase {
  
  supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY);

  polls = signal<Poll[]>([]);

  async getData(/* pollId: number */) {  
    const { data, error } = await this.supabase
      .from('polls')
      .select(`*, poll_question!inner ( question: questions ( *,
                    options (*) ) ) `);
    if (error) {
      console.error("Supabase Error:", error.message);
    } else {
      this.polls.set(data as Poll[]);
    }
  }

  public pollsWithDaysLeft = computed(() => {
    const now = Date.now();
    return this.polls().map(poll => {
      let dateEndOfDay = new Date(poll.enddate)
      dateEndOfDay.setHours(23, 59, 59, 999);
      let diff = dateEndOfDay.getTime() - now;
      return {
        ...poll,
        daysLeft: Math.floor(diff / (1000 * 60 * 60 * 24)),
      };
    }).sort((a, b) => a.daysLeft - b.daysLeft);    
  });

}
