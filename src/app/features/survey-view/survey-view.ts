import { Component, inject, signal } from '@angular/core';
import { Supabase } from '../../shared/services/supabase';
import { ActivatedRoute } from '@angular/router';
import { Poll } from '../../shared/interfaces/interface';
import { ViewSection } from './components/view-section/view-section';
import { ResultSection } from './components/result-section/result-section';
import { IndexToLetterPipe } from '../../shared/pipes/index-to-letter.pipe';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-survey-view',
  imports: [ViewSection,ResultSection],
  templateUrl: './survey-view.html',
  styleUrl: './survey-view.scss',
})
export class SurveyView {

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
