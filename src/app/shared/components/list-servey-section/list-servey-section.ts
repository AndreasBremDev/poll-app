import { Component, inject } from '@angular/core';
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

  ngOnInit() {
    this.supabase.getCategories()
  }
}

