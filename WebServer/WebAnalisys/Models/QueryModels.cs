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
        public double[] Xmin { get; set; }
        public double[] Xmax { get; set; }
        public double[] YAxes1MIN { get; set; }
        public double[] YAxes1MAX { get; set; }
        public double[] YAxes2MIN { get; set; }
        public double[] YAxes2MAX { get; set; }
        public double[] YAxes3MIN { get; set; }
        public double[] YAxes3MAX { get; set; }
        public double[] YAxes4MIN { get; set; }
        public double[] YAxes4MAX { get; set; }
    }

    public class AxesConfiguration
    {
        public Dictionary<string, Plots> Plots { get; set; } = new Dictionary<string, Plots>();
        public Dictionary<string, VisiblePlots> VisiblePlots { get; set; } = new Dictionary<string, VisiblePlots>();
        public Dictionary<string, PlotColors> PlotColors { get; set; } = new Dictionary<string, PlotColors>();
        public Dictionary<string, AxesScale> AxesScale { get; set; } = new Dictionary<string, AxesScale>();
    }
}
    
