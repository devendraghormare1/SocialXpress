import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NotAuthGuard } from '../authguard.guard';

import { LoginComponent } from "../login/login.component";
import { RegisterComponent } from "../register/register.component";
import { ForgotPasswordComponent } from "../forgot-password/forgot-password.component";

const authRoutes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [NotAuthGuard] }, // Using NotAuthGuard for login route
    { path: 'register', component: RegisterComponent, canActivate: [NotAuthGuard] }, // Using NotAuthGuard for register route
    { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [NotAuthGuard] }, // Using NotAuthGuard for forgot-password route
];

@NgModule({
    imports: [RouterModule.forChild(authRoutes)],
    exports: [RouterModule]
})
export class AuthRoutingModule { }
