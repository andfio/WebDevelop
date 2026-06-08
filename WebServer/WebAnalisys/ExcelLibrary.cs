using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Drawing;
using OfficeOpenXml;
using OfficeOpenXml.Drawing.Chart;
using OfficeOpenXml.Style;
using System.Runtime.InteropServices;
using WebAnalisys.Models;


namespace WebAnalisys.ExcelTools
{
    [ComVisible(true)]
    [ClassInterface(ClassInterfaceType.AutoDual)]
    public class ExcelLibrary //: iExcelLibrary 
    {
        private string _fontName;
        private Int16 _fontSize;

        private const decimal _oneinches = 0.393701M; // = 1 cm 
        private const double _onepixel = 37.795276d;  // = 1 cm 

        private ExcelPackage _ep;
        private string _filename;
        private string _sheetName;
        private ExcelWorksheet ws;
        private ExcelChart chart;
        private ExcelChartSerie chartSerie;
        private int chartRow;
        private int chartCol;
        private int numSeries;


        [ComVisible(true)]
        public bool NewPackage(string filename)
        {
            try
            {
                _sheetName = "";
                numSeries = 0;

                _fontName = "Arial";
                _fontSize = 9;

                _filename = filename;

                FileInfo f = new FileInfo(filename);
                if (f.Exists == true) f.Delete();

                _ep = new ExcelPackage();
                return true;
            }
            catch(Exception ex)
            {
                return false;
            }
        }

        [ComVisible(true)]
        public bool SavePackage()
        {
            try
            {
                _ep.SaveAs(new FileInfo(_filename));
                return true;
            }
            catch(Exception ex)
            {
                return false;
            }
        }

        [ComVisible(true)]
        public bool CreateSheetXls(string sheetname)
        {
            if (IsSheetExist(sheetname) == true)
            {
                _sheetName = sheetname;
                ws = _ep.Workbook.Worksheets[sheetname];
                return true;
            }
            else
            {
                if (CreateSheet(sheetname) != null)
                {
                    _sheetName = sheetname;
                    return true;
                }
            }
            return false;
        }

        private bool IsSheetExist(string sheetname)
        {
            try
            {
                ExcelWorksheet _tempWs = _ep.Workbook.Worksheets.Add(sheetname);
                return true;
            }
            catch
            {
                return false;
            }
        }

        private ExcelWorksheet CreateSheet(string sheetName)
        {
            try
            {
                ws = _ep.Workbook.Worksheets.Add(sheetName);

                ws.Cells.Style.Font.Size = _fontSize;
                ws.Cells.Style.Font.Name = _fontName;

                //Margini e proprieta di stampa da assegnare al foglio creato.
                ws.PrinterSettings.PaperSize = ePaperSize.A4;
                ws.PrinterSettings.Orientation = eOrientation.Landscape;
                ws.PrinterSettings.LeftMargin = (0.6M * _oneinches); //1 cm = 0.0393701 inches
                ws.PrinterSettings.RightMargin = (0.6M * _oneinches);
                ws.PrinterSettings.TopMargin = (1 * _oneinches);
                ws.PrinterSettings.BottomMargin = (1 * _oneinches);
                //ws.PrinterSettings.FitToPage = true;

                return ws;
            }
            catch(Exception ex)
            {
                return null;
            }
        }

        [ComVisible(true)]
        public void CellText(short Row, short Column, string text, [Optional, DefaultParameterValue(false)] bool fontbold, [Optional, DefaultParameterValue(2)] int textAlign, [Optional, DefaultParameterValue(0)] int CellBorder)
        {
            try
            {
                ws.Cells[Row, Column].Value = text;
                ws.Cells[Row, Column].Style.Font.Name = _fontName;
                ws.Cells[Row, Column].Style.Font.Size = _fontSize;
                ws.Cells[Row, Column].Style.Font.Bold = fontbold;
                ws.Cells[Row, Column].Style.HorizontalAlignment = (ExcelHorizontalAlignment)textAlign;    
                

                if (CellBorder != 0)
                    ws.Cells[Row, Column].Style.Border.BorderAround((ExcelBorderStyle)CellBorder, Color.Black); //ExcelBorderStyle.Thin -> linea singola
            }
            catch (Exception ex)
            {
            }
        }

        [ComVisible(true)]
        public void CellNumber(short Row, short Column, double number, [Optional, DefaultParameterValue(false)] bool fontbold, [Optional, DefaultParameterValue(2)] int textAlign, [Optional, DefaultParameterValue(0)] int CellBorder)
        {
            try
            {
                ws.Cells[Row, Column].Value = number;
                ws.Cells[Row, Column].Style.Font.Name = _fontName;
                ws.Cells[Row, Column].Style.Font.Size = _fontSize;
                ws.Cells[Row, Column].Style.Font.Bold = fontbold;
                ws.Cells[Row, Column].Style.HorizontalAlignment = (ExcelHorizontalAlignment)textAlign;


                if (CellBorder != 0)
                    ws.Cells[Row, Column].Style.Border.BorderAround((ExcelBorderStyle)CellBorder, Color.Black); //ExcelBorderStyle.Thin -> linea singola
            }
            catch (Exception ex)
            {
            }
        }

        [ComVisible(true)]
        public void CellWith(short Column, float ColumnWidth = 14.4F)
        {
            try
            {
                ws.Column(Column).Width = ColumnWidth;
            }
            catch(Exception ex)
            {
            }
        }

        [ComVisible(true)]
        public void CellHeight(short Row, float RowHeight = 8.11F)
        {
            ws.Row(Row).Height = RowHeight;
        }

        [ComVisible(true)]
        public void CellSetColors(int row, int col, short colorType)
        {
            try
            {
                Color _colortype = new Color(); 

                switch (colorType)
                {
                    case 1:
                        _colortype = Color.Red;   
                        break;
                    case 2:
                        _colortype = Color.Cyan;
                        break;
                    case 3:
                        _colortype = Color.Green;
                        break;
                    case 4:
                        _colortype = Color.Yellow;
                        break;
                    case 5:
                        _colortype = Color.Maroon;
                        break;
                    case 6:
                        _colortype = Color.ForestGreen;
                        break;
                    case 7:
                        _colortype = Color.Orange;
                        break;
                    case 8:
                        _colortype = Color.Gray;
                        break;
                    case 9:
                        _colortype = Color.Magenta;
                        break;
                    case 10:
                        _colortype = Color.Blue;
                        break;
                    case 0:
                        _colortype = Color.White;
                        break;
                }

                ws.Cells[row, col].Style.Fill.PatternType = ExcelFillStyle.Solid;
                ws.Cells[row, col].Style.Fill.BackgroundColor.SetColor(_colortype);                   
            }
            catch(Exception ex)
            {
            }
        }

        [ComVisible(true)]
        public bool AddChart(int row, int column)
        {
            chartRow = row;
            chartCol = column;

            chart = AddChart(ws);
            if (chart != null)
            {
                return true;
            }
            return false;
        }

        private ExcelChart AddChart(ExcelWorksheet ws)
        {
            try
            {
                ExcelLineChart wsChart = ws.Drawings.AddChart("Chart " + ws.Name, eChartType.Line) as ExcelLineChart;
                wsChart.SetPosition(chartRow, 10, chartCol, 0);
                wsChart.SetSize((int)(14.5 * _onepixel), (int)(1.45 * _onepixel)); //dimensione di partenza del grafico senza valori.
                wsChart.DataLabel.ShowValue = false; //visualizza il valore in testa alla barra.
                //wsChart.Legend.Remove();            //Rimuove l'etichetta del nome della serie nella legenda.
                //wsChart.Border.Fill.Style = 0;     // nessun bordo esterno al grafico   

                wsChart.SetSize(1500, 750);
                //wsChart.XAxis.RemoveGridlines()
                //wsChart.YAxis.RemoveGridlines();

                numSeries = 0;

                return wsChart;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        [ComVisible(true)]
        public bool AddSeries(string seriesAddress, string seriesLabel)
        {
            try
            {
                chartSerie = AddSeries(chart, ws.Name, seriesAddress, seriesLabel);

                if (chartSerie != null)
                {
                    return true;
                }
            }
            catch (Exception ex)
            {
            }

            return false;
        }
            
        private ExcelChartSerie AddSeries(ExcelChart wsChart, string sheetName, string seriesAddress, string seriesLabel)
        {
            try
            {

                ExcelRangeBase rangeLabel = ws.Cells[seriesLabel];
                ExcelRangeBase rangeSerie = ws.Cells[seriesAddress];

                ExcelLineChartSerie wsSeries = (ExcelLineChartSerie)wsChart.Series.Add(rangeSerie, rangeLabel);
                
                string serieName = seriesAddress.Substring(0, 1) + "1";

                wsChart.Series[numSeries].Header = ws.Cells[serieName].Value.ToString();

                wsChart.Series[numSeries].XSeries = seriesLabel;                             

                numSeries++;

                return wsSeries;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        [ComVisible(true)]
        public void ResetPackage()
        {
            try
            {
                _ep = null;
                ws = null;
                chart = null;
                chartSerie = null;
                _sheetName = "";
                numSeries = 0;
            }
            catch(Exception ex)
            {
            }
        }

        public string filename
        {
            get
            {
                return _filename;
            }
        }

        public bool CreateReport(PrintDataPayload paramsData, string fileGraphName )
        {
            return true;
        }

    }
}
