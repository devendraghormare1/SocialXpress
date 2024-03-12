import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserModule } from './user/user.module';
import { AppComponent } from './app.component';
import { ProfileComponent } from './user/profile/profile.component';
import { FollowerFeedComponent } from './follower-feed/follower-feed.component';
import { FeedComponent } from './post/feed/feed.component';
import { LoginComponent } from './login/login.component';
import { FriendsComponent } from './friends/friends.component';
import { FriendlistComponent } from './friends/friendlist/friendlist.component';
import { AuthGuard } from './authguard.guard';
import { ReportModelComponent } from './report-model/report-model.component';
import { CreateComponent } from './post/create/create.component';

const routes: Routes = [
  { path: '',component: LoginComponent ,pathMatch: 'full' },
  { path: 'home',component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'posts', loadChildren: () => import('./post/post.module').then(m => m.PostModule), canActivate: [AuthGuard] },
  { path: 'users/:username/profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'feed', component: FollowerFeedComponent, canActivate: [AuthGuard] },
  {path: 'friends', component: FriendsComponent, canActivate: [AuthGuard]},
  {path: 'friend-list', component: FriendlistComponent, canActivate: [AuthGuard]},
  {path: 'report-model', component: ReportModelComponent, canActivate: [AuthGuard]},
  {path: 'feed/edit/:id', component:CreateComponent},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
