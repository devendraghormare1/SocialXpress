import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/api.service';
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
        this.userProfile = data;
        if (this.userProfile.profile_picture == null) {
          this.userProfile.profile_picture = "assets/default-1.png";
        }
        this.userProfileForm.patchValue(this.userProfile);
      },
      (error: any) => {
        console.error('Error fetching user profile:', error);
      }
    );

    this.apiService.getCurrentUser().subscribe(
      (data: any) => {
        this.currentUser = data;
      },
      (error: any) => {
        console.error('Error fetching current user:', error);
      }
    );
  }

  getCompleteImageUrl(relativePath: string): string {
    return `http://localhost:8000${relativePath}`;
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.userProfileForm.enable();
    } else {
      this.userProfileForm.disable();
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
      const formData = new FormData();
      formData.append('bio', this.userProfileForm.get('bio')?.value);
      formData.append('username', this.userProfileForm.get('username')?.value);
      formData.append('email', this.userProfileForm.get('email')?.value);
      formData.append('birthdate', this.userProfileForm.get('birthdate')?.value);
      if (this.selectedProfilePicture) {
        formData.append('profile_picture', this.selectedProfilePicture, this.selectedProfilePicture.name);
      }

      
      this.apiService.updateUserProfile(this.userProfileForm.get('username')?.value, formData).subscribe(
        (response: any) => {
          console.log('User profile updated successfully:', response);
          this.userProfile = response;
          this.isEditing = false;
          window.location.reload()
        },
        (error: any) => {
          console.error('Error updating user profile:', error);
        }
      );
    }
  }
}
