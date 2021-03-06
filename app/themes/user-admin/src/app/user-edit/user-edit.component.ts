import { Component, OnInit }                    from '@angular/core';
import { Router, ActivatedRoute }               from '@angular/router';
import { FormBuilder, FormGroup, Validators }   from '@angular/forms';

import { UsersService }   from '../shared/users.service';
import { User }           from "../shared/models/user.model";

import {AlertComponent } from 'ng2-bootstrap';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {

    private wait: any;

    private passWait: any;

    private title: string;

    private userForm: FormGroup;
    private passwordForm: FormGroup;

    private error: string;
    private msg: string;

    private passError: string;
    private passMsg: string;

    private user: User;

    constructor(
           private usersService: UsersService,
           private route: ActivatedRoute,
           private router: Router,
           private fb: FormBuilder
        ) { 

        // init the wait state (and indication animation) to 'off'
        this.wait       = false;
        this.passWait   = false;

        this.user = new User();
    }

    ngOnInit() {

        this._initForms();
        this.route.data.forEach((data: { user: any }) => {
            this.user = data.user;
            if(this.user) {
                this.userForm.controls['name'].setValue(this.user.name);
                this.userForm.controls['email'].setValue(this.user.email);
                this.userForm.controls['role'].setValue(this.user.role.id);
            }
        });

    }

    private _initForms() {
        this.userForm = this.fb.group({
            name:  ['', [Validators.required, Validators.minLength(3)]],
            email: ['', Validators.required],
            role:  ['', Validators.required]
        });

        this.passwordForm = this.fb.group({
            password:  ['', [Validators.required, Validators.minLength(3)]],
            confirm: ['', Validators.required],
        });

    }

    onSubmit({ value, valid }: { value: User, valid: boolean }) {

        this.wait = true;

        this.msg = this.error = '';

        if(valid) {
            if(this.user) {
                value.id = this.user.id;
                this.usersService.updateUser(value)
                    .then(res => this._handleResponse(res))
                    .catch(error => this.error = error);
            } else {
                this.usersService.createUser(value)
                    .then(res => this._handleResponse(res))
                    .catch(error => this.error = error);
            }
        }
    }
    
    private _handleResponse(res) {
        this.wait = false;
        if(true == res.success) {

            this.msg = "User record was successfully updated."

            if("create" === res.method) {
                // navigate to Edit User for the new user
                this.router.navigate(['/user/' + res.user.id]);
            }

        } else {
            this._handleError(res.error_message);
        }
    }

    onSubmitChangepass({ value, valid }: { value: any, valid: boolean }) {
        this.passWait = true;
        this.passMsg = this.passError = '';

        if(valid) {
            this.usersService.changePassword(this.user.id, value.password)
                .then(res => this._handlePasswordResponse(res))
                .catch(error => this.passError = error);
        }
    }

    private _handlePasswordResponse(res) {
        this.passWait = false;

        this.passwordForm.reset();

        if(true == res.success) {
            this.passMsg = "User password successfully updated."
        } else {
            this.passError = res.error_message;
        }
    }

    private _handleError(error) {
        this.error = error;
    }

}
