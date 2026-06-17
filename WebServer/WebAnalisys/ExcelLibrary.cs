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
using System.Collections.Generic;
using System.Linq;

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
        private int _defaultCol;
        private PrintDataPayload _paramsData;
        private byte[] _excelBytes;
        private ExcelPicture _imgGraph;
        private Image _graphImage;
        private MemoryStream _graphImageStream;


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
                string _file = Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath("~/Files/" + ("Report-" + DateTime.Now.ToString("hhmmss")  + ".xlsx")  ));
                _ep.SaveAs(new FileInfo(_file));
                return true;
            }
            catch(Exception ex)
            {
                return false;
            }
        }

        public byte[] GetPackageBytes()
        {
            using (var ms = new MemoryStream())
            {
                _ep.SaveAs(ms);
                return ms.ToArray();
            }
        }

        public byte[] excelBytes
        {
            get {
                return _excelBytes;
            }
            set
            {
                _excelBytes = value;
            }
        }


        private ExcelWorksheet CreateSheet(string sheetName, eOrientation eOrientation, bool fitToPage, int fitToWitdth, int fitToHeight = 0)
        {
            try
            {
                ws = _ep.Workbook.Worksheets.Add(sheetName);

                //Margini e proprieta di stampa da assegnare al foglio creato.
                ws.PrinterSettings.PaperSize = ePaperSize.A4;
                ws.PrinterSettings.Orientation = eOrientation;
                ws.PrinterSettings.FitToPage = fitToPage;
                ws.PrinterSettings.FitToWidth = fitToWitdth;
                ws.PrinterSettings.FitToHeight = fitToHeight;

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
                    ws = CreateSheet("Graph", eOrientation.Landscape, true, 1);
                    if(CreateReportHeader() == true)
                    {
                        AddPicture(fileGraphName);
                    }

                    ws = CreateSheet("Tests Execution", eOrientation.Portrait, true, 1);
                    CreateReportTestsExecution();

                    ws = CreateSheet("Table Measurers", eOrientation.Landscape, true, 1, 0);
                    CreateReportTableMeasures();
                }

                _excelBytes = GetPackageBytes();
                ws = null;
                _ep = null;
                if (_imgGraph != null)
                {
                    _imgGraph.Dispose();
                    _imgGraph = null;
                }

                DisposeGraphImage();
                return true;
            }
            catch (Exception ex)
            {
                DisposeGraphImage();
                return false;
            }
        }

        private bool CreateReportHeader()
        {
            try
            {
                _currentRow = 1;

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

            ws.Cells[row, 1, row, cols].Style.Font.Size = 12;
            ws.Cells[row, 1, row, cols].Style.Font.Name = "Tahoma";
            ws.Cells[row, 1, row, cols].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
            ws.Cells[row, 1, row, cols].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
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

        private int PrinterTitleTable(string[] columnsName, int[] columnsSize, string[] columnsColor)
        {

            int row = _currentRow;
            int cols = columnsName.Length;

            int col = 1;
            foreach (string name in columnsName)
            {
                ws.Cells[row, col].Value = name;
                ws.Column(col).Width = columnsSize[col - 1];
                ws.Cells[row, col].Style.Fill.PatternType = ExcelFillStyle.Solid;
                ws.Cells[row, col].Style.Fill.BackgroundColor.SetColor((ColorTranslator.FromHtml(columnsColor[col - 1])));
                col++;
            }

            using (ExcelRange r = ws.Cells[row, 1, row, cols])
            { 
                r.Style.Font.Size = 10;
                r.Style.Font.Name = "Tahoma";
                r.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                r.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                r.Style.Font.Color.SetColor(Color.Black);
                r.Style.Font.Bold = true;
                r.Style.Border.Left.Style = ExcelBorderStyle.None;
                //r.Style.Border.Left.Color.SetColor(Color.Black);
                r.Style.Border.Right.Style = ExcelBorderStyle.None;
                //r.Style.Border.Right.Color.SetColor(Color.Black);
                r.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                r.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);

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
            ws.Cells[row, columnStart, row, columnEnd].Style.Font.Bold = true;
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

        private void CreateReportTestsExecution()
        {
            try
            {
                string[] _cols = _paramsData.sequencesHeaders.Where(x => x.name != "").Select(x => x.name).ToArray();
                int[] _size = _paramsData.sequencesHeaders.Where(x => x.size != "").Select(x => int.Parse(x.size)).ToArray();

                _currentRow = 1;
                PrinterHeaderTitle(_cols, _size, Color.Blue);

                int maxRows = _paramsData.sequenceData.Count();
                for (int rowIndex = 0; rowIndex < maxRows; rowIndex++)
                {
                    int row = (_currentRow + rowIndex) + 1;
                    ws.Row(row).Height = 20;

                    ws.Cells[row, 1].Value = _paramsData.sequenceData[rowIndex].SequenceNumber;
                    ws.Cells[row, 2].Value = _paramsData.sequenceData[rowIndex].description;
                    ws.Cells[row, 3].Value = _paramsData.sequenceData[rowIndex].result.Split('-')[1];
                    ws.Cells[row, 4].Value = _paramsData.sequenceData[rowIndex].startSequence;
                    ws.Cells[row, 5].Value = _paramsData.sequenceData[rowIndex].endSequence;
                }

                _currentRow++;
                using (ExcelRange r = ws.Cells[_currentRow, 1, (_currentRow + maxRows), 5])
                {
                    r.Style.Font.Size = 10;
                    r.Style.Font.Name = "Tahoma";
                    r.Style.Font.Color.SetColor(Color.Black);
                    r.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                    r.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    r.Worksheet.View.ShowGridLines = false;  
                }
                
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        private void AddPicture(string filename)
        {

            try
            {
                int firstRow = 0;

                DisposeGraphImage();
                byte[] imageBytes = File.ReadAllBytes(filename);
                _graphImageStream = new MemoryStream(imageBytes);
                _graphImage = Image.FromStream(_graphImageStream);

                int imgWidthPx = _graphImage.Width;   
                int imgHeightPx = _graphImage.Height;  

                const double colWidthPx = 98.0;   
                const double rowHeightPx = 20.0;  

                int colsGraph = (int)Math.Ceiling(imgWidthPx / colWidthPx) ;
                int rowsGraph = (int)Math.Ceiling(imgHeightPx / rowHeightPx);

                _currentRow = _currentRow + 2;
                _imgGraph = ws.Drawings.AddPicture("Chart", _graphImage);
                _imgGraph.SetPosition(_currentRow, -25, 0, 0);
                _imgGraph.SetSize(100);

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
                            ws.Cells[_currentRow, colsGraph].Style.Font.Color.SetColor(Color.White);
                            ws.Cells[_currentRow, colsGraph].Style.Font.Bold = true;
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

        private void DisposeGraphImage()
        {
            if (_graphImage != null)
            {
                _graphImage.Dispose();
                _graphImage = null;
            }

            if (_graphImageStream != null)
            {
                _graphImageStream.Dispose();
                _graphImageStream = null;
            }
        }

        private void CreateReportTableMeasures()
        {
            try
            {
                _defaultCol = 3;

                string[] _columnsColor = new string[0];
                string[] _columnsNameFirst = new string[0];
                string[] _columnsNameSecond = new string[0];

                if (!this.initializeTitleArray(ref _columnsNameFirst, ref _columnsNameSecond, ref _columnsColor)) { return; }

                int _defaultSize = 10;
                int[] _columnSize = new int[1];
                _columnSize[0] = 20;

                for (int i = 1; i < _columnsNameFirst.Length; i++)
                {
                    Array.Resize(ref _columnSize, i + 1);
                    _columnSize[i] = _defaultSize;
                }

                _currentRow = 1; int _firstRow = _currentRow;
                PrinterTitleTable(_columnsNameFirst, _columnSize, _columnsColor);

                _currentRow++;
                PrinterTitleTable(_columnsNameSecond, _columnSize, _columnsColor);

                float[] timeValues = new float[0];
                for (int r = 0; r < _paramsData.MeasurColl.Count(); r++)
                {
                    float[] _rowValues = _paramsData.MeasurColl[r];

                    Array.Resize(ref timeValues, r + 1);
                    timeValues[r] = _rowValues[0];
                }

                for (int rowIndex = 0; rowIndex < timeValues.Count(); rowIndex++)
                {
                    int row = (_currentRow + rowIndex) + 1;
                    ws.Cells[row, 1].Value = ConvertSecondiToTime(timeValues[rowIndex]);
                    ws.Cells[row, 2].Value = Math.Round(timeValues[rowIndex], 2).ToString("0.00");
                }
                
                float[] dataPoints;
                int _columnValue = 0; int col = _defaultCol;
                foreach (int ID in _paramsData.MeasurID)
                {
                    int _measureIndex = _paramsData.measuresinfo.FindIndex(m => m.measureID == ID);
                    if (_measureIndex != -1)
                    {
                        if (_paramsData.measuresinfo[_measureIndex].shortname.Trim() != "")
                        {

                            dataPoints = new float[0];

                            for(int r = 0; r < _paramsData.MeasurColl.Count(); r++)
                            {
                                float[] _rowValues = _paramsData.MeasurColl[r];

                                Array.Resize(ref dataPoints, r + 1);
                                dataPoints[r] = _rowValues[_columnValue];
                            }

                            for (int rowIndex = 0; rowIndex < dataPoints.Count(); rowIndex++)
                            {
                                int row = (_currentRow + rowIndex) + 1;
                                ws.Cells[row, col].Value = Math.Round(dataPoints[rowIndex], 2).ToString("0.00");
                            }
                            col++;
                        }
                    }

                    _columnValue++;
                }

                _currentRow++;
                int ToRow = (_currentRow + _paramsData.MeasurColl.Count());
                int ToCol = _columnsNameFirst.Count();
                using (ExcelRange r = ws.Cells[_currentRow, _defaultCol - 2, ToRow, ToCol])
                {
                    r.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                    ws.Cells[_currentRow, _defaultCol - 2, ToRow, _defaultCol - 2].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    r.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    r.Style.Font.Size = 10;
                    r.Style.Font.Name = "Tahoma";
                    r.Style.Font.Color.SetColor(Color.Black);
                    r.Worksheet.View.ShowGridLines = false;
                }


            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        private bool initializeTitleArray(ref string[] columnsNameFirst, ref string[] columnsNameSecond, ref string[] columnsColor)
        {
            try
            {
                int _columnIndex = 0;

                Array.Resize(ref columnsColor, _columnIndex + 2);
                Array.Resize(ref columnsNameFirst, _columnIndex + 2);
                Array.Resize(ref columnsNameSecond, _columnIndex + 2);

                columnsNameFirst[_columnIndex] = "ABS Time";
                columnsNameSecond[_columnIndex] = "[hh:mm]-(ss..mm)";
                columnsColor[_columnIndex] = ColorTranslator.ToHtml(Color.Silver);

                _columnIndex = 1;

                Array.Resize(ref columnsColor, _columnIndex + 1);
                columnsNameFirst[_columnIndex] = "Time";
                columnsNameSecond[_columnIndex] = "sec";
                columnsColor[_columnIndex] = ColorTranslator.ToHtml(Color.Silver);

                _columnIndex = 2;
                foreach (int ID in _paramsData.MeasurID)
                {
                    int _measureIndex = _paramsData.measuresinfo.FindIndex(m => m.measureID == ID);
                    if (_measureIndex != -1)
                    {
                        if (_paramsData.measuresinfo[_measureIndex].shortname.Trim() != "")
                        {
                            if (_paramsData.axesConfig.Plots.ContainsKey("Plot" + _paramsData.measuresinfo[0].UnitTypeID.ToString()))
                            {
                                Array.Resize(ref columnsColor, _columnIndex + 1);
                                Array.Resize(ref columnsNameFirst, _columnIndex + 1);
                                Array.Resize(ref columnsNameSecond, _columnIndex + 1);

                                int _plotIndex = Array.FindIndex(_paramsData.axesConfig.Plots["Plot" + _paramsData.measuresinfo[0].UnitTypeID.ToString()].Plot, p => p == ID);
                                if (_plotIndex != -1)
                                {
                                    string _colors = _paramsData.axesConfig.PlotColors["Plot" + _paramsData.measuresinfo[0].UnitTypeID.ToString()].Color[_plotIndex];
                                    columnsColor[_columnIndex] = _colors;
                                }
                                else
                                {
                                    columnsColor[_columnIndex] = "#FFFFFF";
                                }
                            }

                            columnsNameFirst[_columnIndex] = _paramsData.measuresinfo[_measureIndex].shortname.Trim();
                            columnsNameSecond[_columnIndex] = _paramsData.measuresinfo[_measureIndex].UM.Trim();

                            _columnIndex++;
                        }
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }

        public string ConvertSecondiToTime(double a)
        {
            double tot_sec = a;
            int tot_min = (int)Math.Floor(tot_sec / 60);
            int tot_ore = (int)Math.Floor((double)tot_min / 60);

            tot_sec = tot_sec - (tot_min * 60);
            tot_min = tot_min - (tot_ore * 60);

            string str_tot_sec = tot_sec.ToString("00.00");
            string str_tot_min = tot_min.ToString("00");
            string str_tot_ore = tot_ore.ToString("00");

            return $"{str_tot_ore}:{str_tot_min} - ({str_tot_sec})";
        }

    }
}
