import { Component, inject, computed, signal } from '@angular/core';
import { Supabase } from '../../services/supabase';
import { Poll } from '../../interfaces/interface';


@Component({
  selector: 'app-soon-section',
  imports: [/* JsonPipe */],
  templateUrl: './soon-section.html',
  styleUrl: './soon-section.scss',
})
export class SoonSection {
  supabase = inject(Supabase);
  polls = signal<Poll[]>([]);

  async ngOnInit(): Promise<void> {
    this.polls.set(await this.supabase.getData() || []);
  }

  daysFilteredPolls = computed(() => {
    const allPolls = this.polls();
    const filteredByDays = allPolls.filter(poll => poll.daysLeft >= 0);
    console.log(filteredByDays);
    return filteredByDays;
  });

}
