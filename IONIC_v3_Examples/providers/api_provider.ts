import { HttpClient, HttpHeaders, HttpClientModule, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { DataProvider } from '../data/data';
import { UserInterfaceProvider } from '../user-interface/user-interface';

@Injectable()
export class ApiProvider {

  tag = "Example - ApiProvider : ";
  apiUrl = "http://example/" //[DEBUG]
  //apiUrl = 'https://examples/'; //[PROD]
  token: any;

  constructor(public http: HttpClient, public events: Events, public dataProvider: DataProvider,
    public userInterfaceProvider: UserInterfaceProvider) {
    console.log(this.tag + ' service is up');
    this.events.subscribe('data_provider:auth:token', () => {
      this.token = this.dataProvider.getToken();
    });
    this.events.subscribe('data_provider:security:error', () => {
      this.userInterfaceProvider.showSecurityErrorToast();
    });
  }

  getResources(resource, data, needAuth) {
    let httpParams = new HttpParams();
    if (data != null) {
      Object.keys(data).forEach(function (key) {
        httpParams = httpParams.append(key, data[key]);
      });
    }
    else {
      httpParams = null
    }
    if (needAuth) {
      var token = this.dataProvider.getToken();
      //console.log(this.tag + "getResources() token: " + token);
      return new Promise((resolve, reject) => {
        this.http.get(
          this.apiUrl + resource, {
            headers: new HttpHeaders()
              .set('Authorization', 'Bearer ' + token)
            , params: httpParams
          }
        )
          .subscribe(
            response => {
              resolve(response);
            },
            error => {
              reject(error);
            });
      });
    }
    else {
      return new Promise((resolve, reject) => {
        this.http.get(
          this.apiUrl + resource, {
            headers: new HttpHeaders()
            , params: httpParams
          }
        )
          .subscribe(
            response => {
              resolve(response);
            },
            error => {
              reject(error);
            });
      });
    }
  }

  postResources(resource, data, needAuth) {
    if (needAuth) {
      var token = this.dataProvider.getToken();
      //  console.log(this.tag + "postResources() token: " + token);
      return new Promise((resolve, reject) => {
        this.http.post(
          this.apiUrl + resource,
          JSON.stringify(data), {
            headers: new HttpHeaders()
              .set('Content-Type', 'application/json')
              .set('Authorization', 'Bearer ' + token)
          }
        )
          .subscribe(
            response => {
              resolve(response);
            },
            (error) => {
              reject(error);
            });
      });
    }
    else {
      return new Promise((resolve, reject) => {
        this.http.post(
          this.apiUrl + resource,
          JSON.stringify(data), {
            headers: new HttpHeaders()
              .set('Content-Type', 'application/json')
          }
        )
          .subscribe(
            response => {
              resolve(response);
            },
            (error) => {
              reject(error);
            });
      });
    }
  }
}
