import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/api.service';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  public userProfile: any = {};
  public currentUser: any = null;
  public userProfileForm: FormGroup;
  isEditing: boolean = false;
  selectedProfilePicture: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.userProfileForm = this.fb.group({
      // profile_picture: [''],
      bio: [{value:''}],
      username: [{value:'', disabled: true}],
      email: [{value:'', disabled: true}],
      birthdate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const username = this.route.snapshot.paramMap.get('username') || '';

    this.apiService.getUserProfile(username).subscribe(
      (data: any) => {
        console.log('User profile:', data);
        this.userProfile = data;
        if (this.userProfile.profile_picture == null) {
          this.userProfile.profile_picture = "assets/default-1.png";
      }
    },
      (error: any) => {
        console.error('Error fetching user profile:', error);
      }
    );
    // Fetch the currently logged in user
    this.apiService.getCurrentUser().subscribe(
      (data: any) => {
        console.log('Current user:', data);
        this.currentUser = data;
      },
      (error: any) => {
        console.error('Error fetching current user:', error);
      }
    );
    this.userProfileForm.patchValue(this.userProfile);
  }

  getCompleteImageUrl(relativePath: string): string {
    // Assuming relativePath is the path obtained from post.media
    return `http://localhost:8000${relativePath}`;
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.userProfileForm.patchValue(this.userProfile); 
    }
  }

  onProfilePictureSelected(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      this.selectedProfilePicture = files[0];
    }
  }

  onSubmit(): void {
    if (this.userProfileForm.valid) {
      const formData = this.userProfileForm.getRawValue();
      console.log(formData)
      if (this.selectedProfilePicture) {
        formData.profile_picture = this.selectedProfilePicture;
      }
      this.apiService.updateUserProfile(formData.username, formData).subscribe(
        (response: any) => {
          console.log('User profile updated successfully:', response);
          if (response.profile_picture == null) {
            response.profile_picture = "assets/default-1.png";
          }
          this.userProfile = response;
          this.isEditing = false;
        },
        (error: any) => {
          console.error('Error updating user profile:', error);
        }
      );
    }
  }
}
