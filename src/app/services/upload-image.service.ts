import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { environment } from 'src/environments/environment';
// import { v2 as cld, UploadApiResponse } from 'cloudinary';

@Injectable({
  providedIn: 'root',
})
export class UploadImageService {
  private UPLOAD_PRESET = environment.cloudinary.preset;
  private CLOUDINARY_NAME = environment.cloudinary.name;
  private COUDINARY_URL = environment.cloudinary.url;
  constructor() {}

  async takeImage(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Uri,
        source,
      });

      if (!image.webPath) return null;

      const res = await fetch(image.webPath);

      return await res.blob();
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async uploadImage(blob: Blob) {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', this.UPLOAD_PRESET);
    formData.append('cloud_name', this.CLOUDINARY_NAME);

    try {
      const response = await fetch(this.COUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro al subir la imagen');
      }

      const resData = await response.json();

      // return resData as UploadApiResponse;
      return resData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
