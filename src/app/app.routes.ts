import { Routes } from '@angular/router';
import { HeroSection } from './shared/components/hero-section/hero-section';
import { CurrentSection } from './shared/components/current-section/current-section';
import { MainPage } from './shared/components/main-page/main-page';

export const routes: Routes = [
    {
        path:'',
        component: MainPage
    }
];
