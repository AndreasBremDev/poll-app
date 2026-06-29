import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Supabase } from '../../../../shared/services/supabase';
import { Poll } from '../../../../shared/interfaces/interface';
import { IndexToLetterPipe } from '../../../../shared/pipes/index-to-letter.pipe';

@Component({
  selector: 'app-view-section',
  imports: [
    IndexToLetterPipe
  ],
  templateUrl: './view-section.html',
  styleUrl: './view-section.scss',
})
export class ViewSection {

  supabase = inject(Supabase);
  route = inject(ActivatedRoute);

  currentPoll = signal<Poll | undefined>(undefined);

  async ngOnInit(): Promise<void> {
    if (this.supabase.polls().length === 0) {
      await this.supabase.getData();
    }
    let currentId = Number(this.route.snapshot.paramMap.get('id'));
    let foundPoll = this.supabase.polls().find(poll => poll.id === currentId);
    this.currentPoll.set(foundPoll);
  }


}
