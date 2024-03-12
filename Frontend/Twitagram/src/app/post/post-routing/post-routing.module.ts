import { NgModule, createComponent } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FeedComponent } from '../feed/feed.component';

import { CreateComponent } from '../create/create.component';
import { FollowerFeedComponent } from 'src/app/follower-feed/follower-feed.component';


const routes: Routes = [
  { path: 'feed', component: FollowerFeedComponent },
  { path: 'create', component: CreateComponent },
  { path: 'feed/edit/:id', component: CreateComponent }
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
