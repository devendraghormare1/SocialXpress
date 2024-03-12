import { Component, OnInit } from '@angular/core';
import { PostService } from '../post/post.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { FriendsService } from '../friends/friends.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-follower-feed',
  templateUrl: './follower-feed.component.html',
  styleUrls: ['./follower-feed.component.css']
})

export class FollowerFeedComponent implements OnInit {
  posts: any[] = [];
  currentUser: any;
 


  constructor(private postService: PostService,
              private router: Router        ,
              public authService: AuthService ,
              private _report: FriendsService,
              private toaster:ToastrService 
    ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    console.log(this.currentUser.username);

    this.postService.getUserFeed(this.currentUser.username).subscribe(
      (data) => {
        console.log('Posts fetched successfully:', data);
        this.posts = data.map((post: any) => {
          post.comments = post.comments || [];
          return post;
        });
      },
      (error) => {
        if (error.status === 401) {
          alert('You must be logged in to view this page.');
          this.authService.logOut();
          this.router.navigate(['/login']);
        } else { 
          console.error('Error fetching posts:', error);
        };
        }
    );
  }

  getCompleteImageUrl(relativePath: string): string {
    // Assuming relativePath is the path obtained from post.media
    return `http://localhost:8000${relativePath}`;
  }
    // Add these helper methods in your component class
    isImage(mediaUrl: string): boolean {
      // Check if the URL ends with a common image extension
      return /\.(jpg|jpeg|png|gif)$/i.test(mediaUrl);
    }
  
    isAudio(mediaUrl: string): boolean {
      // Check if the URL ends with a common audio extension
      return /\.(mp3|ogg|wav)$/i.test(mediaUrl);
    }
    isVideo(mediaUrl: string): boolean {
      // Check if the URL ends with a common video extension
      return /\.(mp4|webm|mkv)$/i.test(mediaUrl);
    }

  deletePost(post: any): void {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }
    if (!post || !post.id) {
      console.error('Post ID not provided');
      return;
    }

    this.postService.deletePost(post.id).subscribe(
      (data) => {
        console.log('Post deleted successfully:', data);
        this.toaster.success('Post deleted successfully')
        this.ngOnInit();
      },
      (error) => {
        console.error('Error deleting post:', error);
      }
    );
  }


  likeOrUnlikePost(post: any): void {
    this.postService.likePost(post.id).subscribe(
      (data) => {
        console.log('(Like/Unlike) Post operation successful:', data);
        this.ngOnInit();
    },
      (error) => {
        console.error('There was an error liking the post:', error);
      }
    );
  }

  addComment(post: any): void {
    this.postService.createComment(post.id, {content: post.newComment}).subscribe(
      (data) => {
        console.log('Comment added successfully:', data);
        post.comments.push(data); // Push the new comment to the list of comments
        post.newComment = ''; // Clear the comment box
        this.ngOnInit(); // Refresh the page
      },
      (error) => {
        console.error('Error adding comment:', error);
      }
    );
  }

  promptReason( postId: string, postContent: string, postUser: string, postMedia:any): void {
    this.router.navigate(['/report-model'], { queryParams: { id: postId, user: postUser, content: postContent, media:postMedia}});

  }


}
