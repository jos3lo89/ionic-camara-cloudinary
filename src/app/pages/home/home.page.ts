import { Component, inject, OnInit } from '@angular/core';
import { CameraSource } from '@capacitor/camera';
import { UploadImageService } from 'src/app/services/upload-image.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private _uploadImageService = inject(UploadImageService);
  cameraSource = CameraSource;

  imageUrl: string | null = null;
  imagePublicId: string | null = null;
  uploadLoadin = false;

  constructor() {}
  ngOnInit() {}

  async handleClick(source: CameraSource) {
    try {
      this.uploadLoadin = true;

      const blob = await this._uploadImageService.takeImage(source);

      if (!blob) {
        throw new Error('No se pudo capturar la imagen');
      }

      const res = await this._uploadImageService.uploadImage(blob);


      this.imageUrl = res.url;
      this.imagePublicId = res.public_id;
      this.uploadLoadin = false;
    } catch (error) {
      console.log(error);
      this.uploadLoadin = false;
      throw error;
    }
  }
}
