import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialog,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { measuresinfo, AxesConfig, chartsettings } from './chart-config';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DialogContent } from './dialog-component';

@Component({
  selector: 'chart-settings-content',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule, FormsModule, MatCheckboxModule],
  templateUrl: './chart-settings-component.html',
  styleUrls: ['./chart-settings-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartSettingsComponent {
  constructor(private dialog: MatDialog) {}

  readonly DialogTitle = 'Chart Settings';

  measuresInfo = inject<measuresinfo[]>(MAT_DIALOG_DATA);
  axesConfig: AxesConfig =inject<AxesConfig>(MAT_DIALOG_DATA);

  chartSettings: chartsettings = {
    measure: [],
    plotcolor: [],
    enableplot: []
  };

  UnitTypeIDSelected: string = "Plot" +  this.measuresInfo[0].unitTypeID.toString();
  MeasureIDSelected: string = "";

  colorMap: { [key: string]: string } = {
  "#000000": "black",
  "#ffffff": "white",
  "#ff0000": "red",
  "#00ff00": "lime",
  "#0000ff": "blue",
  "#ffff00": "yellow",
  "#ffa500": "orange",
  "#800080": "purple",
  "#ffc0cb": "pink",
  "#a52a2a": "brown",
  "#808080": "gray",
  "#c0c0c0": "silver",
  "#00ffff": "cyan",
  "#008080": "teal",
  "#000080": "navy",
  "#f5f5dc": "beige",
  "#ffd700": "gold",
  "#4b0082": "indigo",
  "#7fff00": "chartreuse",
  "#dc143c": "crimson"
  };

  getColorName(hex: string): string {
    return this.colorMap[hex.toLowerCase()] || "unknown";
  }

  saveSettings() {
    for (let index = 0; index <= this.chartSettings.measure.length; index++) {
      if (index == this.chartSettings.measure.length) {return;}
      if(Number(this.chartSettings.measure[index]) !== 0) {
        break;
      }
    }

    for (let index = 0; index < this.chartSettings.measure.length; index++) {
      if(Number(this.chartSettings.measure[index]) !== 0) {
        if(this.chartSettings.enableplot[index] == false) {
          this.showDialog("You have to enable the plot, if you want to set a measure", "Message");
          return;
        }
        if(this.chartSettings.plotcolor[index] == "#FFFFFF") {
          this.showDialog("You have to select a color, if you want to set a measure", "Message");
          return;
        }
      }
    }
  
    for (let index = 0; index < this.chartSettings.measure.length; index++) {
       this.axesConfig.plots[this.UnitTypeIDSelected].Plot[index] = Number(this.chartSettings.measure[index])
       this.axesConfig.visibleplots[this.UnitTypeIDSelected].Plot[index] = Number(this.chartSettings.enableplot[index])
       this.axesConfig.plotcolors[this.UnitTypeIDSelected].Color[index] = this.chartSettings.plotcolor[index]
    }
  }

  closeDialog() {
  }

  showDialog(message: string, title?: string ) {
    this.dialog.open(DialogContent, {
      data: { DialogMessage: message, DialogTitle: title ?? ''},
      disableClose: true,
      hasBackdrop: true,
    });

  }
}

