import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, MenuController, Events } from 'ionic-angular';
import { Validators, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { RegisterPage } from '../register/register';
import { ApiProvider } from '../../providers/api/api';
import { DataProvider } from '../../providers/data/data';
import { UserInterfaceProvider } from '../user-interface/user-interface';
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  tag = "Example - LoginPage : ";

  isLoginFormSubmitButtonDisabled = false;
  lastUser: any;
  isRemeberMeSelected = false;

  loginForm = this.formBuilder.group({
    email: new FormControl('', Validators.compose([
      Validators.required,
    ])),
    password: new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern('^.{8,60}$'),
    ]))
  })

  constructor(public navCtrl: NavController, public navParams: NavParams, public dataProvider: DataProvider,
    public apiProvider: ApiProvider, public modalCtrl: ModalController, public menu: MenuController,
    public events: Events, public formBuilder: FormBuilder, public userInterfaceProvider: UserInterfaceProvider) {
    this.menu.enable(true);
    this.dataProvider.loadUser();
    this.events.subscribe('data_provider:last_user:loaded', () => {
      var lastUser = this.dataProvider.user;
      if (lastUser != null)
        this.lastUser = lastUser;
      this.loginForm.patchValue({ email: lastUser.email });
      this.isRemeberMeSelected = true;
    });

  }

  ionViewWillEnter() {
    this.events.subscribe('data_provider:auth:token', () => {
      this.events.unsubscribe('data_provider:auth:token');
      //TODO: Get user data from API while veryfing token then:
      // if (this.isRemeberMeSelected) {
      //   this.dataProvider.storeUser(data)
      // }
      // else {
      //   this.dataProvider.forgetUser();
      // }
      this.dataProvider.isUserLoggedIn = true;
      this.userInterfaceProvider.finishedLoading();
      this.goToMainMenu();
    });
  }

  ionViewWillLeave() {
    this.events.unsubscribe('data_provider:last_user:loaded');
  }

  goToMainMenu() {
    this.isLoginFormSubmitButtonDisabled = false;
    this.events.publish("data_provider:auth:login");
    this.navCtrl.pop();
  }

  remeberMeClicked() {
    console.log(this.tag + "isRemeberMeChanged from " + this.isRemeberMeSelected + "to " + !this.isRemeberMeSelected);
    if (this.isRemeberMeSelected)
      this.isRemeberMeSelected = false;
    else
      this.isRemeberMeSelected = true
  }

  openRegisterForm() {
    let registerForm = this.modalCtrl.create(RegisterPage, { isModal: true }, { cssClass: "modal-fullscreen" });
    registerForm.present();
  }

  onFormSubmit() {
    this.isLoginFormSubmitButtonDisabled = true;
    this.validateAllFormFields(this.loginForm);
    if (this.loginForm.invalid) {
      this.isLoginFormSubmitButtonDisabled = false;
      return;
    }
    this.attemptLogin(this.loginForm.value);
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
        control.updateValueAndValidity({ onlySelf: true });
        if (control.invalid) {
          this.loginForm.setErrors({ invalid: true })
        }
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  attemptLogin(data) {
    this.userInterfaceProvider.presentLoading(true);
    this.apiProvider.postResources("login", data, false).then(
      (result) => {
        this.userInterfaceProvider.finishedLoading();
        var token: any = result;
        token = token.token as string;
        this.dataProvider.setToken(token);
        this.loginForm.reset();
        this.isLoginFormSubmitButtonDisabled = false;
      },
      (err) => {
        this.userInterfaceProvider.finishedLoading();
        this.userInterfaceProvider.processAPIErrors(err);
        this.isLoginFormSubmitButtonDisabled = false;
      });
  }
}
