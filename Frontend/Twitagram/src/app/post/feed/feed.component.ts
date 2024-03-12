import { Component, OnInit } from '@angular/core';
import { PostService } from '../post.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { FriendsService } from 'src/app/friends/friends.service';


@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  posts: any[] = [];
  currentUser: any;
  following: any[] = [];


  constructor(private postService: PostService,
              private router: Router        ,
              public authService: AuthService,
              private _report: FriendsService 
    ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();


    this.postService.getPosts().subscribe(
      (data) => {
        this.posts = data.results.map((post: any) => {
          post.comments = post.comments || [];
          return post;
        });
      },
      (error) => {
        if (error.status === 401) {
          alert('You must be logged in to view this page.');
          this.authService.logOut();
          // this.router.navigate(['/login']);
        } else { 
          console.error('Error fetching posts:', error);
        };
        }
    );

    
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


postId:string = '1';
  reportedPosts: Set<string> = new Set<string>();

  promptReason(postContent: string,postUser: string): void {
    const reason = prompt('Please provide a reason for reporting this post:');
    if (reason) {
      this.reportPost(this.postId,this.currentUser.username, postContent, reason, postUser); // Report the post
    } else {
      console.log('Report canceled or reason not provided.');
      alert('Please provide reason')
    }
  }

  reportPost(postId:string,username: string, content: string, reason: string,postUser: string): void {
    this._report.reportPost(postId,username, content, reason, postUser).subscribe(
      response => {
        console.log('Post reported successfully!', response);
        alert(`You reported on ${response.postUser}'s post. It will be removed from your feed!`)
        this.reportedPosts.add(response.content);
        console.log(response.content) 
      },
      error => {
        console.error('Error reporting post', error);
      }
    );
  }
}



