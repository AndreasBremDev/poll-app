import { Component, inject, signal } from '@angular/core';
import { Supabase } from '../../shared/services/supabase';
import { ActivatedRoute } from '@angular/router';
import { Poll } from '../../shared/interfaces/interface';
import { ViewSection } from './components/view-section/view-section';
import { ResultSection } from './components/result-section/result-section';
import { ModalDialog } from '../../shared/services/modal-dialog';

@Component({
  selector: 'app-survey-view',
  imports: [ViewSection,ResultSection],
  templateUrl: './survey-view.html',
  styleUrl: './survey-view.scss',
})
export class SurveyView {

  supabase = inject(Supabase);
  route = inject(ActivatedRoute);
  modalDialog = inject(ModalDialog)

  currentPoll = signal<Poll | undefined>(undefined); // note: model = signal, data out to child, in from child

  currentId = 0;

  async ngOnInit(): Promise<void> {
    if (this.supabase.polls().length === 0) {
      await this.supabase.getData();
    }
    this.currentId = Number(this.route.snapshot.paramMap.get('id'));
    let foundPoll = this.supabase.polls().find(poll => poll.id === this.currentId);
    this.currentPoll.set(foundPoll);    
  }
      

}
