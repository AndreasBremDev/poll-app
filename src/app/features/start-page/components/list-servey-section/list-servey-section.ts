import { Component, inject, signal, computed } from '@angular/core';
import { Supabase } from '../../../../shared/services/supabase';
import { Poll, Categories, SurveyStatus } from '../../../../shared/interfaces/interface';
import { RouterLink } from "@angular/router";


@Component({
  selector: 'app-list-servey-section',
  imports: [RouterLink],
  templateUrl: './list-servey-section.html',
  styleUrl: './list-servey-section.scss',
})
export class ListServeySection {
  
  supabase = inject(Supabase)
  selectedCategory = signal<string>('all');
  selectedStatus = signal<SurveyStatus>('active');


  filteredPolls = computed(() => {
    const allPolls = this.supabase.polls();
    const status: SurveyStatus = this.selectedStatus();
    const category: string = this.selectedCategory();
    const filteredStatus = this.filterStatus_filteredPolls(allPolls, status);
    const filteredCategory = this.filterCategory_filteredPolls(filteredStatus, category)
    return filteredCategory;
  });

  private filterStatus_filteredPolls(allPolls: Poll[], status: string) {
    return allPolls.filter(poll => {
      if (status === 'active') {
        return poll.daysLeft === null || poll.daysLeft >= 0;
      } else if (status === 'past') {
        return poll.daysLeft !== null && poll.daysLeft < 0;
      } else {
        return true;
      }
    });
  }

  private filterCategory_filteredPolls(filteredStatus: Poll[], category: string) {
    if (category === 'all') {
      return filteredStatus
    } else {
      return filteredStatus.filter(poll => poll.categories.category === category);
    }
  };

  onChangeCategory(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    this.selectedCategory.set(value);
    selectElement.blur();
  }

  onChangeStatus(value: 'active' | 'past'): void {
    this.selectedStatus.set(value)
  }

  isPollActive(poll: Poll): boolean {
    return poll.daysLeft === null || poll.daysLeft >= 0
  }

}

