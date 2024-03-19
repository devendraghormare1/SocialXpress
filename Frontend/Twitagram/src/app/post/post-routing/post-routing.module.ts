import { NgModule, createComponent } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FeedComponent } from '../feed/feed.component';

import { CreateComponent } from '../create/create.component';
import { FollowerFeedComponent } from 'src/app/follower-feed/follower-feed.component';
import { AuthGuard } from 'src/app/authguard.guard';


const routes: Routes = [
  { path: 'feed', component: FollowerFeedComponent, canActivate: [AuthGuard] },
  { path: 'create', component: CreateComponent, canActivate: [AuthGuard] },
  { path: 'feed/edit/:id', component: CreateComponent, canActivate: [AuthGuard] }
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class PostRoutingModule { }
