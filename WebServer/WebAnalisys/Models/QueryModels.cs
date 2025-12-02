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

}