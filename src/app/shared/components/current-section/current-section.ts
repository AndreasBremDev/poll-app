import { Component,inject } from '@angular/core';
import { Supabase } from '../../services/supabase';
import { JsonPipe } from '@angular/common';


@Component({
  selector: 'app-current-section',
  imports: [JsonPipe],
  templateUrl: './current-section.html',
  styleUrl: './current-section.scss',
})
export class CurrentSection {
supabase = inject(Supabase)


}
