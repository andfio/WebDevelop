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
        public string Plot { get; set; }
        public string UnitTypeID { get; set; }
    }

    public class VisiblePlots
    {
        public string Plot { get; set; }
        public string UnitTypeID { get; set; }
    }

    public class Colors
    {
        public string Color { get; set; }
        public string UnitTypeID { get; set; }
    }

    public class AxesScale
    {
        public string UnitTypeID { get; set; }
        public string Xmin { get; set; }
        public string Xmax { get; set; }
        public string YAxes1MIN { get; set; }
        public string YAxes1MAX { get; set; }
        public string YAxes2MIN { get; set; }
        public string YAxes2MAX { get; set; }
        public string YAxes3MIN { get; set; }
        public string YAxes3MAX { get; set; }
        public string YAxes4MIN { get; set; }
        public string YAxes4MAX { get; set; }
    }

    public class AxesConfiguration
    {
        public Dictionary<string, List<Plots>> Plots = new Dictionary<string, List<Plots>>();
        public Dictionary<string, List<VisiblePlots>> VisiblePlots = new Dictionary<string, List<VisiblePlots>>();
        public Dictionary<string, List<Colors>> Colors = new Dictionary<string, List<Colors>>();
        public Dictionary<string, List<AxesScale>> AxesScale = new Dictionary<string, List<AxesScale>>();
    }
}
    
