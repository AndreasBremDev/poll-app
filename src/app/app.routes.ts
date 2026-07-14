import { Routes } from '@angular/router';
import { StartPage } from './features/start-page/start-page';
import { SurveyView } from './features/survey-view/survey-view';

export const routes: Routes = [
    {
        path:'',
        component: StartPage
    },
    {
        path:'view/:id',
        component: SurveyView
    },
    {
        path:'**',
        redirectTo: ''
    }
];
