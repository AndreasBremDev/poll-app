import { Component, inject, computed } from '@angular/core';
import { Supabase } from '../../../../shared/services/supabase';
import { RouterLink } from '@angular/router';
import { Poll } from '../../../../shared/interfaces/interface';


@Component({
  selector: 'app-soon-section',
  imports: [RouterLink],
  templateUrl: './soon-section.html',
  styleUrl: './soon-section.scss',
})
export class SoonSection {
  supabase = inject(Supabase);

  daysFilteredPolls = computed(() => {
    const allPolls = this.supabase.polls();
    return allPolls.filter(
      (poll): poll is Poll & { daysLeft: number } => 
      poll.daysLeft !== null && poll.daysLeft >= 0 && poll.daysLeft <=7
    );
  });

}
