using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Drawing;
using OfficeOpenXml;
using OfficeOpenXml.Drawing.Chart;
using OfficeOpenXml.Drawing;
using OfficeOpenXml.Style;
using System.Runtime.InteropServices;
using WebAnalisys.Models;


namespace WebAnalisys.ExcelTools
{
    
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

        private int _currentRow; 

        
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

        
        public bool SavePackage()
        {
            try
            {
                string _file = Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath("~/Files/" + ("Report-" + DateTime.Now.ToString("hhmmss")  + ".xls")  ));
                _ep.SaveAs(new FileInfo(_file));
                return true;
            }
            catch(Exception ex)
            {
                return false;
            }
        }

        
        private bool IsSheetExist(string sheetname)
        {
            try
            {
                ExcelWorksheet _tempWs = _ep.Workbook.Worksheets[sheetname];
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

                //Margini e proprieta di stampa da assegnare al foglio creato.
                ws.PrinterSettings.PaperSize = ePaperSize.A4;
                ws.PrinterSettings.Orientation = eOrientation.Landscape;
                ws.PrinterSettings.FitToPage = true;

                ws.PrinterSettings.TopMargin = 0.25M;
                ws.PrinterSettings.BottomMargin = 0.25M;
                ws.PrinterSettings.LeftMargin = 0.25M;
                ws.PrinterSettings.RightMargin = 0.25M;

                ws.PrinterSettings.HeaderMargin = 0.1M;
                ws.PrinterSettings.FooterMargin = 0.1M;

                return ws;
            }
            catch(Exception ex)
            {
                return null;
            }
        }

        
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

        
        public void CellHeight(short Row, float RowHeight = 8.11F)
        {
            ws.Row(Row).Height = RowHeight;
        }

        
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
            try
            {
                if (_ep == null)
                {
                    return false;
                }

                if (ws == null)
                {
                    ws = CreateSheet("Graph");
                    if(CreateReportHeader(paramsData) == true)
                    {
                        AddPicture(fileGraphName);
                    }


                    //CreateSheetXls("Tests");
                    //CreateSheetXls("Table");
                    //CreateSheetXls("Graph");
                }

                SavePackage();
                ws = null;
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        private void CreateReportLogo()
        {
            _currentRow = 0;
           // ws.Cells[_currentRow, 1].Value = 

        }

        private bool CreateReportHeader(PrintDataPayload paramsData)
        {
            try
            { 

            int firstRow = PrinterHeaderTitle(); 
            int maxRows = paramsData.headerData.Count;

            for (int rowIndex = 0; rowIndex < maxRows; rowIndex++)
            {
                int row = (firstRow + rowIndex) + 1;
                ws.Row(row).Height = 20;

                ws.Cells[row, 1].Value = paramsData.headerData[rowIndex].name;
                if (paramsData.headerData[rowIndex].descrition != null) { 
                    ws.Cells[row, 2].Value = paramsData.headerData[rowIndex].value + " - " + paramsData.headerData[rowIndex].descrition;
                }
                else
                {
                    ws.Cells[row, 2].Value = paramsData.headerData[rowIndex].value;
                }
            }

            firstRow++;
            ws.Cells[firstRow, 1, (maxRows + firstRow), 2].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
            ws.Cells[firstRow, 1, (maxRows + firstRow), 2].Style.Font.Size = 12;
            ws.Cells[firstRow, 1, (maxRows + firstRow), 2].Style.Font.Name = "Tahoma";
            ws.Cells[firstRow, 1, (maxRows + firstRow), 2].Style.Font.Color.SetColor(Color.Black);

            _currentRow = (firstRow + maxRows);

            return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return false;

        }

        private int PrinterHeaderTitle()
        {
            int firstRow = 2;

            int row = firstRow;
            ws.Cells[row, 1].Value = "Description";
            ws.Cells[row, 2].Value = "Information";
            ws.Cells[row, 1, row, 2].Style.Font.Size = 14;
            ws.Cells[row, 1, row, 2].Style.Font.Name = "Tahoma";
            ws.Cells[row, 1, row, 2].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
            ws.Cells[row, 1, row, 2].Style.Font.Color.SetColor(Color.Blue);
            ws.Cells[row, 1, row, 2].Style.Border.Top.Style = ExcelBorderStyle.Thin;
            ws.Cells[row, 1, row, 2].Style.Border.Top.Color.SetColor(Color.Black);
            ws.Cells[row, 1, row, 2].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
            ws.Cells[row, 1, row, 2].Style.Border.Bottom.Color.SetColor(Color.Black);
            ws.Cells[row, 1, row, 2].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
            ws.Cells[row, 1, row, 2].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
            ws.Cells[row, 1, row, 2].Style.Border.Left.Style = ExcelBorderStyle.None;
            ws.Cells[row, 1, row, 2].Style.Border.Right.Style = ExcelBorderStyle.None;
            ws.Row(1).Height = 20;
            ws.Column(1).Width = 30;
            ws.Column(2).Width = 70;


            return row++;

        }

        private int WriteSequenceDataTable(PrintDataPayload paramsData, int startRow)
        {
            if (paramsData == null || paramsData.sequenceData == null || paramsData.sequenceData.Count == 0)
            {
                return startRow - 1;
            }

            WriteSequenceTableHeader(startRow);

            for (int i = 0; i < paramsData.sequenceData.Count; i++)
            {
                int row = startRow + 1 + i;
                sequenceData item = paramsData.sequenceData[i];

                ws.Cells[row, 1].Value = item != null ? item.nr : "";
                ws.Cells[row, 2].Value = item != null ? item.description : "";
                ws.Cells[row, 5].Value = item != null ? item.result : "";
                ws.Cells[row, 6].Value = item != null ? item.startSequence : "";
                ws.Cells[row, 8].Value = item != null ? item.endSequence : "";

                ws.Cells[row, 2, row, 4].Merge = true;
                ws.Cells[row, 6, row, 7].Merge = true;
                ws.Cells[row, 8, row, 9].Merge = true;

                using (ExcelRange rowRange = ws.Cells[row, 1, row, 9])
                {
                    rowRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    rowRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    rowRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    rowRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    rowRange.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                }

                ws.Cells[row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                ws.Cells[row, 2].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                ws.Cells[row, 2].Style.WrapText = false;
                ws.Cells[row, 5, row, 9].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                ws.Row(row).Height = 16;
            }

            return startRow + paramsData.sequenceData.Count;
        }

        private void WriteSequenceTableHeader(int row)
        {
            ws.Cells[row, 1].Value = "Nr.";
            ws.Cells[row, 2].Value = "Description";
            ws.Cells[row, 5].Value = "Result";
            ws.Cells[row, 6].Value = "Start Sequence";
            ws.Cells[row, 8].Value = "End Sequence";

            ws.Cells[row, 2, row, 4].Merge = true;
            ws.Cells[row, 6, row, 7].Merge = true;
            ws.Cells[row, 8, row, 9].Merge = true;

            using (ExcelRange headerRange = ws.Cells[row, 1, row, 9])
            {
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Font.Color.SetColor(Color.Black);
                headerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
                headerRange.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(191, 191, 191));
                headerRange.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                headerRange.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                headerRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                headerRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                headerRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                headerRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;
            }

            ws.Cells[row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            ws.Cells[row, 5, row, 9].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            ws.Row(row).Height = 18;
        }

        private void ApplyReportPrintSettings(int lastReportRow)
        {
            if (lastReportRow < 1)
            {
                lastReportRow = 1;
            }

            ws.PrinterSettings.PrintArea = ws.Cells[1, 1, lastReportRow, 9];
            ws.PrinterSettings.HorizontalCentered = true;
        }

        private void AddPicture(string filename)
        {
            ExcelPicture img = ws.Drawings.AddPicture("Chart", new FileInfo(filename));
            img.SetPosition(_currentRow + 1, 0, 0, 0);
            img.SetSize(100);
        }

    }
}
