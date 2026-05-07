import { Injectable, signal } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js'
import { Poll } from '../interfaces/interface'
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Supabase {
  
  supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY);
  // supabase = createClient('https://bydsnptuhhbiettqouva.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZHNucHR1aGhiaWV0dHFvdXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzUwMTQsImV4cCI6MjA5MTkxMTAxNH0.GbWtevpaatYOnNZf8UXnTrFM5fOWFL8y_ZWI8y4OlM4');
  // supabase = createClient('https://mkqpmldjilzczfksjtlu.supabase.co', 'sb_publishable_0rSNInmzSZAX6eGK5O5B4A_bzD292gM');

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
