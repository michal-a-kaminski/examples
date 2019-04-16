import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage';
import { Storage } from '@ionic/storage';
import { User } from '../../models/user';

@Injectable()
export class DataProvider {

  tag = "Example - DataProvider : ";
  user: User;
  private token: string;

  constructor(public events: Events, private secureStorage: SecureStorage, public storage: Storage
  ) {
  }

  loadToken(isAuthAttemp) {
    this.secureStorage.create('secureStorage')
      .then((storage: SecureStorageObject) => {
        storage.get('token')
          .then(
            data => {
              this.token = data;
              if (!isAuthAttemp) {
                this.events.publish('data_provider:auth:token');
              }
              else {
                //
              }
            },
            error =>
              this.tokenError(error)
          );
      });
  }

  removeToken() {
    this.secureStorage.create('secureStorage').then((storage: SecureStorageObject) => {
      storage.remove('token').then(
        result => {
          console.log(this.tag + 'token removed');
        },
        error => {
          console.log(this.tag + 'Error removing token:' + error);
        }
      )
    }).catch((err) => console.log(this.tag + 'Error removing token:' + err));
  }

  getToken() {
    return this.token;
  }

  setToken(token) {
    this.secureStorage.create('secureStorage')
      .then((storage: SecureStorageObject) => {
        storage.set('token', token)
          .then(
            data => {
              this.loadToken(false);
            },
            error =>
              this.tokenError(error)
          );
      });
  }

  tokenError(error) {
    this.events.publish('data_provider:security:error');
  }

  storeUser(user) {
    this.user = new User(user)
    this.storage.set('lastUser', this.user);
  }

  forgetUser() {
    this.storage.remove('lastUser').then((value) => {
      console.log(this.tag + 'removed last user');
    }).catch(() => {
      console.log(this.tag + 'failed removing last user');
    });
  }

  loadUser() {
    this.storage.get('lastUser').then((value) => {
      this.user = value;
      this.events.publish('data_provider:last_user:loaded');
    })
      .catch(() => console.log(this.tag + 'error getting last user'));
  }
}
