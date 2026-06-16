using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebAnalisys.Models
{
    public class QueryPayload
    {
        public Dictionary<string, object> Filters { get; set; }
        public QueryDefinition Query { get; set; }
    }

    public class DetailsPayload
    {
        public Dictionary<string, object> Filters { get; set; }
        public QueryDefinition Query { get; set; }
    }

    public class QueryDefinition
    {
        public string Select { get; set; }
        public string From { get; set; }
        public string Where { get; set; }
        public List<QueryCondition> Conditions { get; set; }
    }

    public class QueryCondition
    {
        public string Filter { get; set; }
        public string Sql { get; set; }
    }

    public class MeasureCondition
    {
        public string UnitTypeID { get; set; }
        public string CommandType { get; set; }
    }

    public class Plots
    {
        public int[] Plot { get; set; }
    }

    public class VisiblePlots
    {
        public bool[] Plot { get; set; }
    }

    public class PlotColors
    {
        public string[] Color { get; set; }
    }

    public class AxesScale
    {
        public double Xmin { get; set; }
        public double Xmax { get; set; }
        public double YAxes1MIN { get; set; }
        public double YAxes1MAX { get; set; }
        public double YAxes2MIN { get; set; }
        public double YAxes2MAX { get; set; }
        public double YAxes3MIN { get; set; }
        public double YAxes3MAX { get; set; }
        public double YAxes4MIN { get; set; }
        public double YAxes4MAX { get; set; }
    }

    public class AxesConfiguration
    {
        public Dictionary<string, Plots> Plots { get; set; } = new Dictionary<string, Plots>();
        public Dictionary<string, VisiblePlots> VisiblePlots { get; set; } = new Dictionary<string, VisiblePlots>();
        public Dictionary<string, PlotColors> PlotColors { get; set; } = new Dictionary<string, PlotColors>();
        public Dictionary<string, AxesScale> AxesScale { get; set; } = new Dictionary<string, AxesScale>();
    }

    public class InputField
    {
        public string ID_Result { get; set; }
    }


    public class GraphData
    {
        public int[] MeasurID { get; set; }

        public List<float[]> MeasurColl { get; set; }
    }

    public class measuresinfo
    {
        public int measureID { get; set; }
        public string description { get; set; }
        public string shortname { get; set; }
        public string UM { get; set; }
        public int offSet { get; set; }
        public int axesposition { get; set; }
        public int UnitTypeID { get; set; }
    }

    public class PrintDataPayload
    {
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public string ImageBase64 { get; set; } = string.Empty;
        public int[] MeasurID { get; set; }
        public List<measuresinfo> measuresinfo { get; set; } = new List<measuresinfo>();
        public List<float[]> MeasurColl { get; set; }
        public int[] seriesItems { get; set; }
        public AxesConfiguration axesConfig { get; set; } 
        public List<headerData> headerData { get; set; } = new List<headerData>();
        public List<sequenceData> sequenceData { get; set; } = new List<sequenceData>();
        public List<sequencesHeaders> sequencesHeaders { get; set; } = new List<sequencesHeaders>();
    }

    public class headerData
    {
        public string name { get; set; }
        public string descrition { get; set; }
        public string value { get; set; }
    }

    public class sequenceData
    {
        public string SequenceNumber { get; set; }
        public string description { get; set; }
        public string result { get; set; }
        public string startSequence { get; set; }
        public string endSequence { get; set; }
    }

    public class seriesItems
    {
        public string name { get; set; }
        public string[] data { get; set; }
        public string type { get; set; }
        public string color { get; set; }
    }

    public class sequencesHeaders
    {
        public string name { get; set; }
        public string field { get; set; }
        public string size { get; set; }
    }


}

    
