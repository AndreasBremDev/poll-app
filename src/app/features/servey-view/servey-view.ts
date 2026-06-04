import { Component, inject, signal } from '@angular/core';
import { Supabase } from '../../shared/services/supabase';
import { ActivatedRoute } from '@angular/router';
import { Poll } from '../../shared/interfaces/interface';

@Component({
  selector: 'app-servey-view',
  imports: [],
  templateUrl: './servey-view.html',
  styleUrl: './servey-view.scss',
})
export class ServeyView {
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
    console.log('this.currentPoll()',this.currentPoll())
    
    // this.supabase.polls().filter(poll => poll.id === currentId);
  }


}
