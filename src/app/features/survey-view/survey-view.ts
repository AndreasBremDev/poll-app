import { Component, inject, signal } from '@angular/core';
import { Supabase } from '../../shared/services/supabase';
import { ActivatedRoute } from '@angular/router';
import { Poll } from '../../shared/interfaces/interface';
import { ViewSection } from './components/view-section/view-section';
import { ResultSection } from './components/result-section/result-section';

@Component({
  selector: 'app-survey-view',
  imports: [ViewSection,ResultSection],
  templateUrl: './survey-view.html',
  styleUrl: './survey-view.scss',
})
export class SurveyView {



}
