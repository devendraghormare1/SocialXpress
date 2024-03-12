import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FriendsService } from '../friends/friends.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-report-model',
  templateUrl: './report-model.component.html',
  styleUrls: ['./report-model.component.css']
})
export class ReportModelComponent {
  postId: string='';
  postUser: string='';
  postContent: string='';
  postMedia:any;
  reasons: string[] = ['Inappropriate Content', 'Spam', 'Harassment', 'Other'];
  selectedReason: string='';
  otherReason: string='';
  currentUser:any
  constructor(private route: ActivatedRoute, private router: Router, private _report: FriendsService, private toaster: ToastrService, private authService :AuthService) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.route.queryParams.subscribe(params => {
      this.postId = params['id'];
      this.postUser = params['user'];
      this.postContent = params['content'];
      this.postMedia = params['media'];
     
    });
    
  }

  submitReport() {
    if (!this.selectedReason) {
      this.toaster.error('Please select a reason for reporting.');
      return;
    }

    this.reportPost(this.postId,this.currentUser.username, this.postContent, this.selectedReason , this.postUser);

    this.router.navigate(['/feed']);
  }


  reportPost(postId:string,username: string, content: string, reason: string, postUser: string): void {
    this._report.reportPost(postId,username, content, reason, postUser).subscribe(
      response => {
        console.log('Post reported successfully!', response);
        this.toaster.success(`You reported on ${response.postUser}'s post. It will be removed from your feed!`);

        
      },
      error => {
        console.error('Error reporting post', error);
        this.toaster.error('Error reporting post. Please try again later.');
      }
    );
  }

  getCompleteImageUrl(relativePath: string): string {
    return `http://localhost:8000${relativePath}`;
  }

  isImage(mediaUrl: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(mediaUrl);
  }

  isAudio(mediaUrl: string): boolean {
    return /\.(mp3|ogg|wav)$/i.test(mediaUrl);
  }

  isVideo(mediaUrl: string): boolean {
    return /\.(mp4|webm|mkv)$/i.test(mediaUrl);
  }
  

}
