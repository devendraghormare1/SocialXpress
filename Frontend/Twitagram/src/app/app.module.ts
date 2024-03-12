import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { AuthModule } from './auth/auth.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { HomeComponent } from './home/home.component';
import { AppComponent } from './app.component';
import { FollowerFeedComponent } from './follower-feed/follower-feed.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FriendsComponent } from './friends/friends.component';
import { FriendRequestsComponent } from './friends/friend-requests/friend-requests.component';
import { FriendlistComponent } from './friends/friendlist/friendlist.component';
import { FriendsService } from './friends/friends.service';
import { AuthGuard } from './authguard.guard';
import { ReportModelComponent } from './report-model/report-model.component';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FollowerFeedComponent,
    NavbarComponent,
    FriendsComponent,
    FriendRequestsComponent,
    FriendlistComponent,
    ReportModelComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    AuthModule,
    RouterModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    BrowserAnimationsModule,
    FormsModule
  ],
  providers: [FriendsService, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
