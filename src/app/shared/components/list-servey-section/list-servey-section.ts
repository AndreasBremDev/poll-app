import { Component, inject, signal, computed } from '@angular/core';
import { Supabase } from '../../services/supabase';
import { JsonPipe } from '@angular/common';
import { Categories } from '../../interfaces/interface';
import { Poll } from '../../interfaces/interface';


@Component({
  selector: 'app-list-servey-section',
  imports: [JsonPipe],
  templateUrl: './list-servey-section.html',
  styleUrl: './list-servey-section.scss',
})
export class ListServeySection {
  supabase = inject(Supabase)
  polls = signal<Poll[]>([]);
  pollCategories: Categories[] = [];
  // categories: WritableSignal<Categories[]> = signal<Categories[]>([]);
  selectedCategory = signal<string>('all')

  filteredPolls = computed(() => {
    const category: string = this.selectedCategory();
    if (category === 'all') {
      console.log('all polls: ',this.polls());
      return this.polls();
    } else {
      console.log('filtered polls: ', this.polls().filter(poll => poll.categories.category === category))
      return this.polls().filter(poll => poll.categories.category === category);
    }
  });

  async ngOnInit(): Promise<void> {
    this.polls.set(await this.supabase.getData() || []);
    this.pollCategories = await this.supabase.getCategories() || [];
    console.log('polls: ', this.polls());
    console.log('categories: ', this.pollCategories);    
  }


  onChangeCategory(value:string): void {
    this.selectedCategory.set(value)
    console.log('selected category after change: ',this.selectedCategory());
    
  }



}

