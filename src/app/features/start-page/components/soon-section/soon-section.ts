import { Component, inject, computed } from '@angular/core';
import { Supabase } from '../../../../shared/services/supabase';


@Component({
  selector: 'app-soon-section',
  imports: [/* JsonPipe */],
  templateUrl: './soon-section.html',
  styleUrl: './soon-section.scss',
})
export class SoonSection {
  supabase = inject(Supabase);

  daysFilteredPolls = computed(() => {
    const allPolls = this.supabase.polls();
    return allPolls.filter(poll => poll.daysLeft >= 0);
  });

}
