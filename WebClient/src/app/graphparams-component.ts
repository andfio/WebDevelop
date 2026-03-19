import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  DialogTitle: string;
  DialogMessage: string;
}

@Component({
  selector: 'graph-params-content',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule],
  templateUrl: './graphparams-component.html',
  styleUrls: ['./graphparams-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphParamsComponent {
data = inject<DialogData>(MAT_DIALOG_DATA);
}
