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
    
    public class ExcelLibrary //: iExcelLibrary 
    {
        private const decimal _oneinches = 0.393701M; // = 1 cm 
        private const double _onepixel = 37.795276d;  // = 1 cm 

        private ExcelPackage _ep;
        private ExcelWorksheet ws;
        private ExcelChart chart;
        private ExcelChartSerie chartSerie;
        private int chartRow;
        private int chartCol;
        private int numSeries;

        private int _currentRow;
        private PrintDataPayload _paramsData;

        public bool NewPackage(string filename)
        {
            try
            {
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
                numSeries = 0;
            }
            catch(Exception ex)
            {
            }
        }

        public bool CreateReport(PrintDataPayload paramsData, string fileGraphName )
        {
            try
            {
                _paramsData = paramsData;

                if (_ep == null)
                {
                    return false;
                }

                if (ws == null)
                {
                    ws = CreateSheet("Graph");
                    if(CreateReportHeader() == true)
                    {
                        AddPicture(fileGraphName);
                    }

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

        private bool CreateReportHeader()
        {
            try
            {
                _currentRow = 2;

                int firstRow = PrinterHeaderTitle(new string[2] { "Description", "Information" }, new int[2] { 30, 70 }, Color.Blue); 
                int maxRows = _paramsData.headerData.Count;

                for (int rowIndex = 0; rowIndex < maxRows; rowIndex++)
                {
                    int row = (firstRow + rowIndex) + 1;
                    ws.Row(row).Height = 20;

                    ws.Cells[row, 1].Value = _paramsData.headerData[rowIndex].name;
                    if (_paramsData.headerData[rowIndex].descrition != null) { 
                        ws.Cells[row, 2].Value = _paramsData.headerData[rowIndex].value + " - " + _paramsData.headerData[rowIndex].descrition;
                    }
                    else
                    {
                        ws.Cells[row, 2].Value = _paramsData.headerData[rowIndex].value;
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

        private int PrinterHeaderTitle(string[] columnsName, int[] columnsSize, Color color)
        {

            int row = _currentRow;
            int cols = columnsName.Length;

            int col = 1;
            foreach(string name in columnsName)
            { 
                ws.Cells[row, col++].Value = name;
            }

            ws.Cells[row, 1, row, cols].Style.Font.Size = 14;
            ws.Cells[row, 1, row, cols].Style.Font.Name = "Tahoma";
            ws.Cells[row, 1, row, cols].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
            ws.Cells[row, 1, row, cols].Style.Font.Color.SetColor(color);
            ws.Cells[row, 1, row, cols].Style.Border.Top.Style = ExcelBorderStyle.Thin;
            ws.Cells[row, 1, row, cols].Style.Border.Top.Color.SetColor(Color.Black);
            ws.Cells[row, 1, row, cols].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
            ws.Cells[row, 1, row, cols].Style.Border.Bottom.Color.SetColor(Color.Black);
            ws.Cells[row, 1, row, cols].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
            ws.Cells[row, 1, row, cols].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
            ws.Cells[row, 1, row, cols].Style.Border.Left.Style = ExcelBorderStyle.None;
            ws.Cells[row, 1, row, cols].Style.Border.Right.Style = ExcelBorderStyle.None;
            ws.Row(row).Height = 20;

            col = 1;
            foreach(int size in columnsSize) { 
                ws.Column(col++).Width = size;
            }

            return row++;
        }

        private void PrinterHeaderLeggend(int columnStart, int columnEnd, string columnName, Color color)
        {

            int row = _currentRow;

            ws.Cells[row,  columnStart, row, columnEnd].Merge = true;

            ws.Cells[row,  columnStart, row, columnEnd].Value = columnName;

            ws.Cells[row,  columnStart, row, columnEnd].Style.Font.Size = 11;
            ws.Cells[row,  columnStart, row, columnEnd].Style.Font.Name = "Tahoma";
            ws.Cells[row,  columnStart, row, columnEnd].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
            ws.Cells[row, columnStart, row, columnEnd].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            ws.Cells[row,  columnStart, row, columnEnd].Style.Font.Color.SetColor(color);
            ws.Cells[row,  columnStart, row, columnEnd].Style.Border.Top.Style = ExcelBorderStyle.Thin;
            ws.Cells[row,  columnStart, row, columnEnd].Style.Border.Top.Color.SetColor(Color.Black);
            ws.Cells[row,  columnStart, row, columnEnd].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
            ws.Cells[row,  columnStart, row, columnEnd].Style.Border.Bottom.Color.SetColor(Color.Black);
            ws.Cells[row,  columnStart, row, columnEnd].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
            ws.Cells[row,  columnStart, row, columnEnd].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
            ws.Cells[row,  columnStart, row, columnEnd].Style.Border.Left.Style = ExcelBorderStyle.None;
            ws.Cells[row,  columnStart, row, columnEnd].Style.Border.Right.Style = ExcelBorderStyle.None;
            ws.Row(row).Height = 20;

            ws.Column(columnStart).Width = 15;
            ws.Column(columnStart + 1).Width = 40;

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

            try
            {
                int firstRow = 0;

                Bitmap bmp = new Bitmap(filename);
                int imgWidthPx = bmp.Width;   
                int imgHeightPx = bmp.Height;  

                const double colWidthPx = 98.0;   
                const double rowHeightPx = 20.0;  

                int colsGraph = (int)Math.Ceiling(imgWidthPx / colWidthPx) ;
                int rowsGraph = (int)Math.Ceiling(imgHeightPx / rowHeightPx);

                _currentRow = _currentRow + 2;
                ExcelPicture img = ws.Drawings.AddPicture("Chart", new FileInfo(filename));
                img.SetPosition(_currentRow, -25, 0, 0);
                img.SetSize(100);

                PrinterHeaderLeggend(colsGraph, colsGraph + 1, "Legend", Color.Red);

                measuresinfo measure; firstRow = _currentRow;
                foreach (var itm in _paramsData.seriesItems) {


                    if (_paramsData.measuresinfo.Exists(m => m.measureID == itm)) { 
                        measure = _paramsData.measuresinfo.Find(m => m.measureID == itm);
                    }
                    else
                    {
                        measure = null;
                    }

                    if (measure != null)
                    {
                        int _plotIndex = Array.FindIndex<int>(_paramsData.axesConfig.Plots["Plot" + measure.UnitTypeID.ToString()].Plot, (m) => m == measure.measureID);
                        if (_plotIndex != -1) { 
                            string _color = _paramsData.axesConfig.PlotColors["Plot" + measure.UnitTypeID.ToString()].Color[_plotIndex];

                            _currentRow++; 
                            ws.Cells[_currentRow, colsGraph].Style.Fill.PatternType = ExcelFillStyle.Solid;
                            ws.Cells[_currentRow, colsGraph].Style.Fill.BackgroundColor.SetColor(ColorTranslator.FromHtml(_color));
                            ws.Cells[_currentRow, colsGraph].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                            ws.Cells[_currentRow, colsGraph + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left ;
                            ws.Cells[_currentRow, colsGraph].Value = measure.shortname + " (" + measure.UM + ")";
                            ws.Cells[_currentRow, colsGraph + 1].Value = measure.description;

                        }
                    }

                }

                firstRow++;
                ws.Cells[firstRow, colsGraph, (_currentRow - firstRow) + 2, colsGraph + 1].Style.Font.Size = 12;
                ws.Cells[firstRow, colsGraph, (_currentRow - firstRow) + 2, colsGraph + 1].Style.Font.Name = "Tahoma";

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

        }

    }
}
