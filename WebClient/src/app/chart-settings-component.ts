import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { measuresinfo, AxesConfig, chartsettings } from './chart-config';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DialogContent } from './dialog-component';

interface ChartSettingsDialogData {
  axesConfig: AxesConfig;
  measuresinfo: measuresinfo[];
}


@Component({
  selector: 'chart-settings-content',
  standalone: true,
  imports: [ MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule, FormsModule, MatCheckboxModule],
  templateUrl: './chart-settings-component.html',
  styleUrls: ['./chart-settings-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartSettingsComponent {
  UnitTypeIDSelected: string = "";
  measuresInfo: any[] = [];
  axesConfig: any = { };
  colorItems: any[] = [];
  
  constructor(private dialog: MatDialog, private dialogRef: MatDialogRef<ChartSettingsComponent, AxesConfig | undefined>) {
    const iniectObject = inject<ChartSettingsDialogData>(MAT_DIALOG_DATA);
    this.measuresInfo = iniectObject.measuresinfo; 
    this.axesConfig = structuredClone(iniectObject.axesConfig);
    this.UnitTypeIDSelected = "Plot" +  this.measuresInfo[0].UnitTypeID.toString();
    this.colorItems = Object.keys(this.colorMap);
    this.chartSettings = {
      measure: this.axesConfig.Plots[this.UnitTypeIDSelected].Plot,
      plotcolor: this.axesConfig.PlotColors[this.UnitTypeIDSelected].Color,
      enableplot: this.axesConfig.VisiblePlots[this.UnitTypeIDSelected].Plot
    }
  }

  readonly DialogTitle = 'Chart Settings';

  chartSettings: chartsettings = {
    measure: [],
    plotcolor: [],
    enableplot: []
  };

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

  getColorName(hex: any): string {
    return this.colorMap[hex.toLowerCase()] || "unknown";
  }

  saveSettings() {
    for (let index = 0; index <= this.chartSettings.measure.length; index++) {
      if (index == this.chartSettings.measure.length) {return;}
      if(Number(this.chartSettings.measure[index]) !== -2) {
        break;
      }
    }

    for (let index = 0; index < this.chartSettings.measure.length; index++) {
      if(Number(this.chartSettings.measure[index]) !== -2) {

        if(this.chartSettings.plotcolor[index] == "#FFFFFF") {
          this.showDialog("You have to select a color, if you want to set a measure", "Message");
          return;
        }
      }
    }
  
    for (let index = 0; index < this.chartSettings.measure.length; index++) {
       this.axesConfig.Plots[this.UnitTypeIDSelected].Plot[index] = Number(this.chartSettings.measure[index])
       this.axesConfig.VisiblePlots[this.UnitTypeIDSelected].Plot[index] = Boolean(this.chartSettings.enableplot[index])
       this.axesConfig.PlotColors[this.UnitTypeIDSelected].Color[index] = this.chartSettings.plotcolor[index]
    }

    this.dialogRef.close(this.axesConfig);
  }

  closeDialog() {
    this.dialogRef.close(undefined);
  }

  showDialog(message: string, title?: string ) {
    this.dialog.open(DialogContent, {
      data: { DialogMessage: message, DialogTitle: title ?? ''},
      disableClose: true,
      hasBackdrop: true,
    });

  }

}

