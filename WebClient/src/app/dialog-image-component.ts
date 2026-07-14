import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { _ATTR_TO_PROP } from '@angular/compiler';

interface ImageConfig {
  imageUrl: string;
  httpConfig: string;
}

@Component({
  selector: 'dialog-content',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './dialog-image-component.html',
  styleUrls: ['./dialog-image-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DialogImage {
  constructor(private http: HttpClient) {
    const IniectObject  = inject<ImageConfig>(MAT_DIALOG_DATA);
    this.imageConfig.imageUrl = IniectObject.imageUrl;
  }

  zoomValue: number = 1;
  max_zoom: number = 3;
  min_zoom: number = 1;
  imageConfig: any = {} 

  subSaveImage(): void {
    const imageUrl = this.imageConfig.imageUrl;

    this.http.get(imageUrl, { responseType: 'blob' }).subscribe({
      next: (imageBlob: Blob) => {
        const url = URL.createObjectURL(imageBlob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `Image-${new Date().toISOString().slice(0, 10)}.jpg`;
        a.click();

        URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error saving image:', error);
      }
    });
  }

  subZoom(zoom: string): number {
    switch(zoom) {
      case 'in':
        if ((this.zoomValue + 0.1) <= this.max_zoom)
        {
          this.zoomValue += 0.1;
        }
        break;
      case 'out': 
        if ((this.zoomValue - 0.1) <= this.min_zoom)
        {
          this.zoomValue = 1;
        }
        else
        {
          this.zoomValue -= 0.1;
        }
        break;
      case 'reset':
        this.zoomValue = 1;
        break;
    }
    
    return this.zoomValue;
  }

}

