import { Routes } from '@angular/router';
import { StartPage } from './features/start-page/start-page';
import { ServeyView } from './features/servey-view/servey-view';
import { ServeyCreate } from './features/servey-create/servey-create';

export const routes: Routes = [
    {
        path:'',
        component: StartPage
    },
    {
        path:'view',
        component: ServeyView
    },
    {
        path:'view/:id',
        component: ServeyView
    },
    {
        path:'create',
        component: ServeyCreate
    },
    {
        path:'**',
        redirectTo: ''
    }
];
