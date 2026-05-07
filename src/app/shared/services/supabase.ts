import { Injectable, signal } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js'
import { environment } from '../../../environments/environments';
import { Poll } from '../interfaces/interface'

@Injectable({
  providedIn: 'root',
})
export class Supabase {

  supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY)

  polls = signal<Poll[]>([]);

  async getData(/* pollId: number */) {
    const { data, error } = await this.supabase
      .from('polls')
      .select(`*,
            poll_question!inner (
                question:questions (
                    *,
                    options (*)
                )
            )
        `);
    if (error) {
      console.error("Supabase Error:", error.message);
    } else {
      console.log("Ergebnis mit Verschachtelung:", data);
      this.polls.set(data as Poll[]);
    }
  }

}
