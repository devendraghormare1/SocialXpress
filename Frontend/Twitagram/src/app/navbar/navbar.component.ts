import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userData:any={}
  username:string | null = localStorage.getItem('username')

  constructor(public authService: AuthService, private userService: ApiService){}

  ngOnInit(): void {
    if(this.username){
    this.userService.getUserProfile(this.username).subscribe((data:any) =>{
      this.userData = data
    })
  }
    
  }

  getCompleteImageUrl(relativePath: string): string {
    return `http://localhost:8000${relativePath}`;
  }



}
