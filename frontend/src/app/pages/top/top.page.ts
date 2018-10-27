import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController, AlertController, LoadingController, Platform } from '@ionic/angular';

enum CameraMode {
  Environment = 'environment',
  User = 'user'
}

@Component({
  selector: 'app-top',
  templateUrl: './top.page.html',
  styleUrls: ['./top.page.scss'],
})
export class TopPage implements OnInit {

  @ViewChild('camera') camera: ElementRef;
  @ViewChild('video') video: ElementRef;

  public stream: MediaStream | null = null;
  private cameraMode: CameraMode = CameraMode.Environment;
  private loading: any = null;


  constructor(
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private platform: Platform
  ) { }

  public async getStream() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: (() => {
          if (this.isMobile === false) { return true; }
          return { facingMode: { exact: this.cameraMode }
          };
        })(),
      });

      // Bad practice
      // 要素を中央に配置するために座標計算を行う

      const videoWidth = this.stream.getVideoTracks()[0].getSettings().width;
      const videoHeight = this.stream.getVideoTracks()[0].getSettings().height;

      this.camera.nativeElement.style.width = `${videoWidth}px`;
      this.camera.nativeElement.style.height = `${videoHeight}px`;
      this.camera.nativeElement.style.margin = `-${videoHeight / 2}px 0 0 -${videoWidth / 2}px`;

      this.video.nativeElement.srcObject = this.stream;
    } catch (error) {
      const alert = await this.alertCtrl.create({
        header: 'Failed',
        subHeader: error.message,
        buttons: ['OK']
      });

      await alert.present();
    } finally {
      if (this.loading) {
        this.loading.dismiss();
        this.loading = null;
      }
    }
  }

  public async ngOnInit() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();

    this.getStream();
  }

  public get isMobile() {
    return this.platform.is('ios') || this.platform.is('android');
  }

  /** カメラの向きを変更する */
  public async cameraToggle() {
    this.loading = this.loadingCtrl.create();
    await this.loading.present();

    switch (this.cameraMode) {
      case CameraMode.Environment:
        this.cameraMode = CameraMode.User;
        break;
      case CameraMode.User:
      default:
        this.cameraMode = CameraMode.Environment;
        break;
    }

    this.resetStream();
    this.getStream();
  }

  public capture() {
    const videoWidth = this.stream.getVideoTracks()[0].getSettings().width;
    const videoHeight = this.stream.getVideoTracks()[0].getSettings().height;

    const canvas = document.createElement('canvas');
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const context = canvas.getContext('2d');

    context.drawImage(this.video.nativeElement, 0, 0, videoWidth, videoHeight);
    this.save(canvas.toDataURL('image/png'));
  }

  /** Stream を削除する **/
  private resetStream() {
    this.video.nativeElement.srcObject = null;
    this.stream = null;
  }

  private save(blob: string) {
    console.log(blob);
  }

}