import { Injectable } from '@angular/core';
import { Events, ToastController, LoadingController, AlertController } from 'ionic-angular';
import { DataProvider } from '../data/data';

@Injectable()
export class UserInterfaceProvider {

  tag = "Example - UserInterfaceProvider : ";
  loader: any;

  constructor(public events: Events, public toastCtrl: ToastController,
    public loadingCtrl: LoadingController, public alertCtrl: AlertController, public dataProvider: DataProvider
  ) {
  }

  //ERROR PROCESSING///
  processAPIErrors(error) {
    var message = error.error['error'];
    if (error.status == 401) {
      var title = "Upłynął czas ważności sesji. Zaloguj się ponownie";
      var buttons = [
        {
          text: 'Przejdź do logowania',
          cssClass: 'alertRejectConfirmButton',
          handler: () => {
            console.log('Przejście do logowania');
            //TODO: Wywołanie metody albo event ex:
            // this.events.publish("auth:expired");
          }
        }
      ]
      this.presentAlert(title, null, null, buttons, "alertReject", null);
      this.finishedLoading();
      this.dataProvider.logout();
      return;
    }
    if (error.status == 404) {
      message = "Brak zasobu";
    }
    if (error.status == 500) {
      message = "Brak łączności z serwerem Examples.";
    }
    if (error.status == null) {
      message = "Wystąpił krytyczny błąd";
    }
    if (error.status != 500 && error.status != 401 && error.status != 404 && error.status != null)
      if (message == "" || message == null)
        message = "Brak łączności z serwerem Examples. Błąd: " + error.status;
    let toast = this.toastCtrl.create({
      message: message,
      position: 'bottom',
      showCloseButton: true,
      dismissOnPageChange: true,
      closeButtonText: 'Potwierdzam',
      cssClass: 'example-toast',

    });
    toast.onDidDismiss(() => {
      console.log(this.tag + 'Dismissed toast');
    });
    toast.present();
    this.finishedLoading();
  }

  //LOADING//
  presentLoading(isSendingData) {
    if (isSendingData) {
      this.loader = this.loadingCtrl.create({
        content: "Przesyłanie..."
      });
    }
    else {
      this.loader = this.loadingCtrl.create({
        content: "Ładowanie..."
      });
    }
    this.loader.present();
  }

  finishedLoading() {
    try { //INFO: Takie słabe zabezpieczenie na wypadek gdyby próbowano wyłączyć nieaktywny loader
      this.loader.dismiss();
    } catch (e) { }
  }

  //ALERTS///
  presentAlert(title: string, subTitle: string, msg: string, buttons: any, cssClass: string, inputs: any) {
    if (buttons == undefined) {
      buttons = ['Potwierdzam']
    }
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subTitle,
      message: msg,
      cssClass: cssClass,
      inputs: inputs,
      buttons: buttons
    });
    alert.onDidDismiss(() => {
      if (title == "Upłynął czas ważności sesji. Zaloguj się ponownie") {
        this.events.publish("auth:expired");
      }

    })
    alert.present();
  }

  presentError(title, msg) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: msg,
      cssClass: 'example-alert',
      buttons: ['Ok']
    });
    alert.present();

  }

  presentToast(msg) {
    var toast;
    try {
      toast.dismiss();
    } catch (e) { } //INFO: Słabe zabezpieczenie na blokujące sie multi-tosty
    toast = this.toastCtrl.create({
      message: msg,
      position: 'bottom',
      dismissOnPageChange: true,
      duration: 900,
    });
    toast.onDidDismiss(() => {
      console.log(this.tag + 'Dismissed toast');
    });
    toast.present();
  }

  showSecurityErrorToast() {
    this.toastCtrl.create({
      message: "Aplikacja wymaga utworzenia screen locka",
      position: 'middle',
      showCloseButton: true,
      dismissOnPageChange: false,
      closeButtonText: 'Potwierdzam'
    });
  }
}
