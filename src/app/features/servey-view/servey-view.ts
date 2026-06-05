import { Component, inject, signal } from '@angular/core';
import { Supabase } from '../../shared/services/supabase';
import { ActivatedRoute } from '@angular/router';
import { Poll } from '../../shared/interfaces/interface';
import { ViewSection } from './components/view-section/view-section';
import { ResultSection } from './components/result-section/result-section';

@Component({
  selector: 'app-servey-view',
  imports: [ViewSection,ResultSection],
  templateUrl: './servey-view.html',
  styleUrl: './servey-view.scss',
})
export class ServeyView {



}
