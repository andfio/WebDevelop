using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebAnalisys.Models;
using Newtonsoft.Json.Linq;
using System.Data.SqlClient;



namespace WebAnalisys.Controllers
{
    public class QueryController : ApiController
    {
        // GET api/<controller>
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<controller>/5
        public string Get(int id)
        {
            return "value";
        }

        // PUT api/<controller>/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }

        private QueryDefinition LoadQueryDefinition()
        {
            // Path verso App_Data
            var path = System.Web.Hosting.HostingEnvironment.MapPath("~/App_Data/appconfig.json");

            // Legge il file
            var json = System.IO.File.ReadAllText(path);

            // Prende solo la sezione "query"
            var root = Newtonsoft.Json.Linq.JObject.Parse(json);
            var query = root["query"].ToObject<QueryDefinition>();

            return query;
        }

        [HttpPost]
        public IHttpActionResult Post([FromBody] QueryPayload payload)
        {
            var result = new List<Dictionary<string, object>>();
            
            try
            {
                if (payload == null)
                    return BadRequest("Payload non valido.");

                var filters = payload.Filters;
                var queryDef = payload.Query;

                // Costruisce la query SQL
                string sql = queryDef.Select + " " +
                             queryDef.From + " " +
                             queryDef.Where;

                foreach (var cond in queryDef.Conditions)
                {
                    if (filters.ContainsKey(cond.Filter))
                    {
                        sql += " " + cond.Sql;

                    }
                }


                using (var conn = new SqlConnection("Persist Security Info=False;User ID=sa;Password=Ab123456;Initial Catalog=DBResults_FDG_AL6_GV640A;Data Source=172.31.1.57\\SQLEXPRESS,1434"))
                using (var cmd = new SqlCommand(sql, conn))
                {
                    // Parametri SQL
                    foreach (var f in filters)
                    {
                        string param = "@" + Normalize(f.Key);
                        string value; DateTime dtvalue;
                        if (DateTime.TryParse(f.Value.ToString(), out dtvalue) == true)
                        {
                            value = dtvalue.ToString("yyyy-MM-dd HH:mm");
                        }
                        else if (f.Value.ToString().IndexOf("-") > -1)
                        {
                            value = f.Value.ToString().Substring(0, f.Value.ToString().IndexOf("-"));
                        }
                        else
                        {
                            value = f.Value.ToString();
                        }
                        cmd.Parameters.AddWithValue(param, value);
                    }

                    conn.Open();
                    var reader = cmd.ExecuteReader();

                    while (reader.Read())
                    {
                        var row = new Dictionary<string, object>();

                        for (int i = 0; i < reader.FieldCount; i++)
                        {
                            row.Add(reader.GetName(i), reader.GetValue(i));
                        }
                        
                        result.Add(row);
                    }
                }
            
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
          
            return Ok(result);
        }

        private string Normalize(string key)
        {
            return key.Replace(" ", "").Replace("-", "");
        }

    }
}