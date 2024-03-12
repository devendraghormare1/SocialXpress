import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../post.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { HttpResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {


  postForm: FormGroup;
  isEditMode: boolean = false;
  postId: number | null = null;
  displayedImageUrl: string | null = null; 
  selectedMedia: File | null = null;


  constructor(private fb: FormBuilder,
              private postService: PostService,
              private router: Router,
              private route: ActivatedRoute,
              public authService: AuthService,
              private toaster:ToastrService

              ) {

    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', [Validators.required, Validators.maxLength(120)]]
    });
  }

  ngOnInit(): void {
    this.postId = this.route.snapshot.params['id'];
      

    if (this.postId) {
      this.isEditMode = true;
      this.postService.getPostDetail(this.postId).subscribe(post => {
        this.postForm.patchValue(post);
      });

      this.postForm = this.fb.group({
        title: ['', Validators.required],
        content: ['', [Validators.required, Validators.maxLength(120)]]
      });
      } 
         // Ensure that the postForm is updated only if not in edit mode
    if (!this.isEditMode) {
      this.postForm = this.fb.group({
        title: ['', Validators.required],
        content: ['', [Validators.required, Validators.maxLength(120)]],
      });
     } 
    }  

  onSubmit(): void {
    // Append the selected media file to the form data
    const formData = new FormData();
    formData.append('title', this.postForm.get('title')?.value);
    formData.append('content', this.postForm.get('content')?.value);
    if (this.selectedMedia) {
      formData.append('media', this.selectedMedia, this.selectedMedia.name);
    }

    if (this.isEditMode) {
      this.updateExistingPost();
    } else {
      this.createNewPost(formData);
    }
  }

   // Method to handle file input change
   handleFileInput(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      this.selectedMedia = files[0];
    }
  }
  

  createNewPost(formData: FormData): void {
    if (this.postForm.valid) {
      this.postService.createPost(formData).subscribe(
        (response: HttpResponse<any>) => {
          console.log('Post Created!');
          this.toaster.success('Post created successfully')
  
          // Log a message if the image is successfully loaded
          if (response.body && response.body.media) {
            console.log('Image successfully loaded:', response.body.media);
          }
  
          // Log steps to check the navigation flow
          console.log('Redirecting to feed.');
          try {
            this.router.navigate(['feed/']); // Redirect to posts/feed
          } catch (navigationError) {
            console.error('Navigation error:', navigationError);
          }
        },
        (error: any) => {  // Explicitly define the type for the 'error' parameter
          if (error.status === 401) {
            alert('You must be logged in to create a post! Redirecting to login');
            this.authService.logOut();
            try {
              this.router.navigate(['/login']);
            } catch (navigationError) {
              console.error('Navigation error:', navigationError);
            }
          } else {
            console.error('There was an error while creating the post', error);
          }
        }
      );
    }
  }
  


  updateExistingPost(): void {
    if (this.postForm.valid) {
      if (!this.postId) {
        console.error('Post ID not provided');
        return;
      }
  
      // Append the selected media file to the form data
      const formData = new FormData();
      formData.append('title', this.postForm.get('title')?.value);
      formData.append('content', this.postForm.get('content')?.value);
      if (this.selectedMedia) {
        formData.append('media', this.selectedMedia, this.selectedMedia.name);
      }
  
      this.postService.updatePost(this.postId, formData).subscribe(
        (response: HttpResponse<any>) => {
          if (response.status >= 200 && response.status < 300) {
            console.log('Post Updated!');
  
            if (response.body && response.body.media) {
              console.log('Image successfully loaded:', response.body.media);
  
              const imageUrl = response.body.media;
              this.displayedImageUrl = imageUrl;
            }
            this.toaster.success('Post updated successfully.')

              this.router.navigate(['feed/'])
          } else {
            this.router.navigate(['feed/']);
          }
        },
        (error) => {
          if (error.status === 401) {
            alert('You must be logged in to update a post! Redirecting to login');
            this.router.navigate(['/login']);
          } else {
            console.error('There was an error while updating the post', error);
            this.toaster.error("Error while editing the post")
          }
        }
      );
    }
  }

}
