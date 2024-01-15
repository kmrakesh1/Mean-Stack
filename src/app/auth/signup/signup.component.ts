import { Component, OnDestroy, OnInit } from "@angular/core";
import { Form, NgForm } from "@angular/forms";
import { AuthService } from "../auth.service";
import { Subscription } from "rxjs";

@Component({
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})

export class SignupComponent implements OnInit, OnDestroy{
    isLoading: boolean;
    private authStatusSub : Subscription;
    constructor(public authService: AuthService){}
    onSingup(form: NgForm){
       if(form.invalid){
        return;
       }else{
        this.isLoading = true;
        this.authService.createUser(form.value.email, form.value.password);
       }
    }

    ngOnInit() {
        this.authStatusSub =  this.authService.getAuthStatusListener().subscribe(authStatus=> {
            this.isLoading = false;
        });
    }
    ngOnDestroy() {
        this.authStatusSub.unsubscribe();
    }
}