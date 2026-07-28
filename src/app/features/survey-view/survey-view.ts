import { Component, computed, effect, inject, signal } from '@angular/core';
import { Supabase } from './../../shared/services/supabase';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Poll } from './../../shared/interfaces/interface';
import { ViewSection } from './components/view-section/view-section';
import { ResultSection } from './components/result-section/result-section';
import { DialogPopover } from './../../shared/services/dialog-popover';

@Component({
  selector: 'app-survey-view',
  imports: [ViewSection, ResultSection, RouterLink],
  templateUrl: './survey-view.html',
  styleUrl: './survey-view.scss',
})
export class SurveyView {

  supabase = inject(Supabase);
  route = inject(ActivatedRoute);
  DialogPopover = inject(DialogPopover)

  currentId = signal<number>(0);
  currentPoll = signal<Poll | undefined>(undefined); /* note: model = signal, data out to child, in from child */

  constructor() {
    effect(() => {
      const id = this.currentId();
      if (!id) return;
      const foundPoll = this.supabase.polls().find(poll => poll.id === id);
      this.currentPoll.set(foundPoll)
    })
  }

  async ngOnInit(): Promise<void> {
    const routeId = Number(this.route.snapshot.paramMap.get('id'));
    this.currentId.set(routeId)
    if (this.supabase.polls().length === 0) {
      await this.supabase.loadPolls();
    }   
    await this.supabase.getCategories() || [];
  }
      

}
