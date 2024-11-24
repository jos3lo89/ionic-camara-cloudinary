
# Uso de Cámara y Galería con Ionic y Cloudinary

## Instalación de dependencias

- Ir a la página de [Camera Capacitor Plugin API](https://ionicframework.com/docs/native/camera) y buscar el comando para instalarlo.
```bash
npm install @capacitor/camera
```

-Ir a la página de [PWA Elements](https://capacitorjs.com/docs/web/pwa-elements) y buscar el comando para instalarlo.
```bash
npm install @ionic/pwa-elements
```
- Configurar PWA Elements para Angular. Editar el archivo `app.module.ts` e incluir el siguiente código.
```ts
import { defineCustomElements } from '@ionic/pwa-elements/loader';
// ----------------------------------------------
defineCustomElements(window);
```
## Creación del Servicio para Manejo de Imágenes

-   Generar un servicio para manejar las imágenes:
```bash
ionic g service services/uploadImage
```
- Agregar los métodos necesarios al servicio `upload-image.service.ts`.
```ts
import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { environment } from 'src/environments/environment';

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
        throw new Error('Error al subir la imagen');
      }

      const resData = await response.json();
      return resData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
```
## Implementación en el Componente `HomePage`

-   Editar el archivo `home.page.ts` para manejar la lógica de captura y subida de imágenes.
```ts
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
```
## Creación del Archivo HTML

-   Diseñar el archivo `home.page.html` para capturar y mostrar las imágenes.
```html
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>home</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ng-container *ngIf="!uploadLoadin; else loading">
    <ion-button (click)="handleClick(cameraSource.Camera)">Camara</ion-button>
    <ion-button (click)="handleClick(cameraSource.Photos)">Galeria</ion-button>

    <ion-card *ngIf="imageUrl && imagePublicId">
      <ion-card-content>
        <img [src]="imageUrl" alt="Imagen desde cloudinary" />
      </ion-card-content>
      <ion-card-subtitle>
        <ion-title>{{ imagePublicId }}</ion-title>
      </ion-card-subtitle>
    </ion-card>
  </ng-container>

  <ng-template #loading>
    <ion-item>
      <ion-spinner name="crescent"></ion-spinner>
    </ion-item>
  </ng-template>
</ion-content>
```
## Configuración del Entorno

-   Configurar las variables de entorno en el archivo `environments/environment.ts`.
```ts
export const environment = {
  production: false,
  cloudinary: {
    url: '*************',
    name: '************',
    preset: '**********',
  },
};
```
