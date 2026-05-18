import { Component, inject, computed } from '@angular/core';
import { Supabase } from '../../services/supabase';
// import { JsonPipe } from '@angular/common';


@Component({
  selector: 'app-soon-section',
  imports: [/* JsonPipe */],
  templateUrl: './soon-section.html',
  styleUrl: './soon-section.scss',
})
export class SoonSection {
  supabase = inject(Supabase)

  // public pollsWithDaysLeft = computed(() => {
  //   const now = Date.now();
  //   return this.supabase.polls().map(poll => {
  //     let dateEndOfDay = new Date(poll.enddate)
  //     dateEndOfDay.setHours(23, 59, 59, 999);
  //     let diff = dateEndOfDay.getTime() - now;
  //     return {
  //       ...poll,
  //       daysLeft: Math.floor(diff / (1000 * 60 * 60 * 24)),
  //     };
  //   }).sort((a, b) => a.daysLeft - b.daysLeft);    
  // });

  ngOnInit() {
    this.supabase.getData()
  }
}
