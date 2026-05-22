import { Component, inject, signal, computed } from '@angular/core';
import { Supabase } from '../../services/supabase';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-list-servey-section',
  imports: [JsonPipe],
  templateUrl: './list-servey-section.html',
  styleUrl: './list-servey-section.scss',
})
export class ListServeySection {
  supabase = inject(Supabase)

  selectedCategory = signal<string|number>('all')

  async ngOnInit(): Promise<void> {
    await this.supabase.getCategories()
  }

  filterdPolls = computed(() => {
    const category: string | number = this.selectedCategory();
    if (category === 'all') return this.supabase.polls();
    console.log('all polls: ',this.supabase.polls());
    
    return this.supabase.polls().filter(poll => poll.categories.id === category);

  });

  onChangeCategory(category: any): void {
    this.selectedCategory.set(category)
    console.log('selected category: ',this.selectedCategory());
    
  }



}

