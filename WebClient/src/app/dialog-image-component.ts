import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';

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
  imageConfig: any = {} 

  // ngOnInit() {
 
  // }

  subSaveImage() {

  }
}

