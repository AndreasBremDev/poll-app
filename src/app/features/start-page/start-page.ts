import { Component, inject } from '@angular/core';
import { HeroSection } from './components/hero-section/hero-section';
import { SoonSection } from './components/soon-section/soon-section';
import { ListServeySection } from './components/list-servey-section/list-servey-section';
import { Supabase } from '../../shared/services/supabase';


@Component({
  selector: 'app-start-page',
  imports: [HeroSection, SoonSection, ListServeySection],
  templateUrl: './start-page.html',
  styleUrl: './start-page.scss',
})
export class StartPage {
  supabase = inject(Supabase);

  async ngOnInit(): Promise<void> {
    await this.supabase.getData();
    await this.supabase.getCategories() || [];
  }
  
}

