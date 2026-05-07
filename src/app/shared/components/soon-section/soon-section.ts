import { Component, inject } from '@angular/core';
import { Supabase } from '../../services/supabase';
import { JsonPipe } from '@angular/common';


@Component({
  selector: 'app-soon-section',
  imports: [JsonPipe],
  templateUrl: './soon-section.html',
  styleUrl: './soon-section.scss',
})
export class SoonSection {
  supabase = inject(Supabase)

  ngOnInit() {
    this.supabase.getData()
  }
}
