import { Routes } from '@angular/router';
import { StartPage } from './features/start-page/start-page';
import { SurveyView } from './features/survey-view/survey-view';
import { SurveyCreate } from './features/survey-create/survey-create';

export const routes: Routes = [
    {
        path:'',
        component: StartPage
    },
    {
        path:'view',
        component: SurveyView
    },
    {
        path:'view/:id',
        component: SurveyView
    },
    {
        path:'create',
        component: SurveyCreate
    },
    {
        path:'**',
        redirectTo: ''
    }
];
