using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebAnalisys.Models;
using Newtonsoft.Json.Linq;
using System.Data.SqlClient;
using System.Configuration;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Nodes;
using System.IO;
using System.IO.Compression;
using WebAnalisys.ExcelTools;


namespace WebAnalisys.Controllers
{
    [RoutePrefix("api/query")]
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
        [Route("")]
        public IHttpActionResult Query([FromBody] QueryPayload payload)
        {
            string connString = ConfigurationManager.ConnectionStrings["DBResults"].ConnectionString;

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

                sql += " ORDER BY Date_Time ASC";

                using (var conn = new SqlConnection(connString))
                using (var cmd = new SqlCommand(sql, conn))
                {
                    // Parametri SQL
                    foreach (var f in filters)
                    {
                        string param = "@" + Normalize(f.Key);
                        string value; DateTime dtvalue;
                        if (DateTime.TryParse(f.Value.ToString(), out dtvalue) == true)
                        {
                            value = dtvalue.ToString("yyyy-MM-dd HH:mm:ss");
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

        [HttpPost]
        [Route("details")]
        public IHttpActionResult Details([FromBody] DetailsPayload payload)
        {
            var result = new List<Dictionary<string, object>>();

            string connDBResultsString = ConfigurationManager.ConnectionStrings["DBResults"].ConnectionString;
            string connDBTestString = ConfigurationManager.ConnectionStrings["DBTest"].ConnectionString;

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

                sql += " ORDER BY ProgressiveGroup";

                var details = new List<Dictionary<string, object>>();

                using (var conn = new SqlConnection(connDBResultsString))
                using (var cmd = new SqlCommand(sql, conn))
                {
                    // Parametri SQL
                    foreach (var f in filters)
                    {
                        string param = "@" + Normalize(f.Key);
                        string value = f.Value.ToString();
                        
                        cmd.Parameters.AddWithValue(param, value);
                    }

                    conn.Open();
                    var reader = cmd.ExecuteReader();

                    while (reader.Read())
                    {
                        var row = new Dictionary<string, object>();
                        var pars = new List<string>();

                        for (int i = 0; i < reader.FieldCount; i++)
                        {
                            row.Add(reader.GetName(i), reader.GetValue(i));

                            if (reader.GetName(i) == "TestType")
                            {

                                int testType = int.Parse(reader["TestType"].ToString());

                                switch (testType)
                                {
                                    case 1:
                                        row.Add("M", reader["ProgressiveMeasure"].ToString());
                                        row.Add("TestDescr", "");
                                        row.Add("UM", "");
                                        row.Add("TestRes", reader["ErrorMeasure"].ToString());
                                        row.Add("Min", reader["MinSet"].ToString());
                                        row.Add("Value", reader["AnalogueValue"].ToString());
                                        row.Add("Max", reader["MaxSet"].ToString());
                                        row.Add("Name", reader["StoreName"].ToString());
                                        row.Add("LimitMin", reader["MinLimit"].ToString());
                                        row.Add("LimitMax", reader["MaxLimit"].ToString());
                                        break;

                                    default:
                                        if(reader["Params"].ToString().Trim() != "")
                                        {
                                            string values = reader["Params"].ToString().Trim();
                                            pars = values.Split(';').ToList<string>();
                                        }

                                        row.Add("P", testType.ToString());
                                        row.Add("TestDescr", reader["Descr"].ToString());
                                        row.Add("TestRes", reader["TestResult"].ToString());
                                        for(int iPar = 1; iPar <= 10; iPar++)
                                        {
                                            if (iPar < pars.Count)
                                            {
                                                row.Add("Descr" + iPar.ToString(), "");
                                                row.Add("UM" + iPar.ToString(), "");
                                                row.Add("Valore" + iPar.ToString(), pars[iPar - 1]);
                                            }
                                            else
                                            {
                                                row.Add("Descr" + iPar.ToString(), "?");
                                                row.Add("UM" + iPar.ToString(), "?");
                                                row.Add("Valore" + iPar.ToString(), "?");
                                            }
                                        }
                                        
                                        break;
                                }
                                break;
                            }
                        }

                        details.Add(row);
                    }
                }

                using (var conn = new SqlConnection(connDBTestString))
                {
                    conn.Open();
                    foreach (Dictionary<string, object> itemList in details)
                    {
                        var row = new Dictionary<string, object>();
                        foreach (var itemRow in itemList.ToList()) //foreach (KeyValuePair<string, object> itemRow in itemList )
                        {

                            row.Add(itemRow.Key, itemRow.Value);

                            if (itemRow.Key == "P" || itemRow.Key == "M")
                            {
                                switch (itemRow.Key)
                                {
                                    case "M":                                         
                                        sql = "SELECT ComDescr, UM FROM Commands ";                                        
                                        sql = sql + "WHERE UnitTypeID=" + row["UnitTypeID"].ToString() + " AND ComID=" + itemRow.Value.ToString() + " AND ComType= 1";
                                        break;

                                    default:
                                        sql = "SELECT CommandsInputParameters.Descr, CommandsInputParameters.UM FROM Commands INNER JOIN CommandsInputParameters ON (Commands.UnitTypeID = CommandsInputParameters.UnitTypeID AND Commands.ComID = CommandsInputParameters.ComID AND Commands.ComType = CommandsInputParameters.ComType) ";
                                        sql = sql + "WHERE Commands.UnitTypeID=" + row["UnitTypeID"].ToString() + " AND Commands.ComID=" + itemRow.Value.ToString();
                                        break;
                                }

                                if (itemRow.Value.ToString().Trim() != "")
                                {
                                    using (var cmd = new SqlCommand(sql, conn))
                                    {
                                        SqlDataReader reader = cmd.ExecuteReader();

                                        int iPar = 1;
                                        while (reader.Read())
                                        {
                                            switch (itemRow.Key)
                                            {
                                                case "M":
                                                    itemList["TestDescr"] = reader["ComDescr"].ToString().Trim();
                                                    itemList["UM"] = reader["UM"].ToString().Trim();
                                                    break;

                                                default:
                                                    itemList["Descr" + iPar.ToString()] = reader["Descr"].ToString().Trim();
                                                    itemList["UM" + iPar.ToString()] = reader["UM"].ToString().Trim();
                                                    iPar++;
                                                    break;
                                            }

                                        }
                                        reader.Close();

                                    }
                                }

                            }
                        }
                    }

                    result = details;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return Ok(result);
        }

        [HttpPost]
        [Route("informations")]
        public IHttpActionResult Informations([FromBody] object obj)
        {
            var result = new List<Dictionary<string, object>>();

            string connDBTestString = ConfigurationManager.ConnectionStrings["DBTest"].ConnectionString;

            try
            {
                string sql = "SELECT UnitID, UnitDescr, Units.UnitTypeID, UnitTypes.UnitTypeDescr, Units.LineID, Lines.LineDescr ";
                sql += "FROM Units INNER JOIN Lines ON Units.LineID = Lines.LineID INNER JOIN UnitTypes ON Units.UnitTypeID = UnitTypes.UnitTypeID ";
                sql += "ORDER BY LineID, UnitTypeID, UnitID";

                using (var conn = new SqlConnection(connDBTestString))
                using (var cmd = new SqlCommand(sql, conn))
                {
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

        [HttpPost]
        [Route("modelsinfo")]
        public IHttpActionResult modelsinfo([FromBody] object obj)
        {
            var result = new List<Dictionary<string, object>>();

            string connDBTestString = ConfigurationManager.ConnectionStrings["DBTest"].ConnectionString;

            try
            {
                string sql = "SELECT DISTINCT FixedPart As ModelCode, ModelDescr From Models";

                using (var conn = new SqlConnection(connDBTestString))
                using (var cmd = new SqlCommand(sql, conn))
                {
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

        [HttpPost]
        [Route("abortcodeinfo")]
        public IHttpActionResult abortcodeinfo([FromBody] object obj)
        {
            var result = new List<Dictionary<string, object>>();

            string connDBTestString = ConfigurationManager.ConnectionStrings["DBTest"].ConnectionString;

            try
            {
                string sql = "SELECT UnitTypeID, ErrorID As AbortCode, Descr As AbortDescr FROM UnitTypesErrors";

                using (var conn = new SqlConnection(connDBTestString))
                using (var cmd = new SqlCommand(sql, conn))
                {
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

        [HttpPost]
        [Route("functionsinfo")]
        public IHttpActionResult functionsinfo([FromBody] object obj)
        {
            var result = new List<Dictionary<string, object>>();

             string connDBTestString = ConfigurationManager.ConnectionStrings["DBTest"].ConnectionString;

            try
            {
                string sql = "SELECT FuncID, FuncDescr FROM Functions";

                using (var conn = new SqlConnection(connDBTestString))
                using (var cmd = new SqlCommand(sql, conn))
                {
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

        [HttpPost]
        [Route("measuresinfo")]
        public IHttpActionResult measuresinfo([FromBody] MeasureCondition parameters)
        {
            var result = new List<Dictionary<string, object>>();

            string connDBTestString = ConfigurationManager.ConnectionStrings["DBTest"].ConnectionString;

            try
            {
                string sql = "SELECT ComID As measureID, ComDescr As description, UM, ComDescrShort As shortname, Axes As axesposition, OffSet, UnitTypeID FROM Commands";
                sql += " WHERE UnitTypeID = " + parameters.UnitTypeID;
                sql += " AND ComType = " + parameters.CommandType;
                sql += " AND ComVisible = 1";
                sql += " AND ComDescrShort != ''";
                sql += " AND ComID != 0";
                sql += " ORDER BY ComID";

                using (var conn = new SqlConnection(connDBTestString))
                using (var cmd = new SqlCommand(sql, conn))
                {
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


        [HttpPost]
        [Route("saveplots")]
        public IHttpActionResult saveplots([FromBody] AxesConfiguration payload)
        {
            try
            {
                string fileConfig = System.Web.Hosting.HostingEnvironment.MapPath("~/App_Data/GPlot.json");

                var options = new JsonSerializerOptions
                {
                    WriteIndented = true,
                    IncludeFields = true
                };

                string json = JsonSerializer.Serialize(payload, options);
                File.WriteAllText(fileConfig, json);

                return Ok(new { success = true, message = "" });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
                throw;
            }

        }

        [HttpPost]
        [Route("loadplots")]
        public IHttpActionResult loadplots([FromBody] object obj)
        {
            try
            {
                string fileConfig = System.Web.Hosting.HostingEnvironment.MapPath("~/App_Data/GPlot.json");
                if (!File.Exists(fileConfig))
                {
                    return Ok(new { success = false, message = "NO_FILE" });
                }

                string json = File.ReadAllText(fileConfig);

                AxesConfiguration axesConfig = JsonSerializer.Deserialize<AxesConfiguration>(json);

                return Ok(new { success = true, config = axesConfig });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
                throw;
            }

        }

        [HttpPost]
        [Route("acquisitionstring")]
        public IHttpActionResult acquisitionstring([FromBody] InputField payload)
        {
            string connDBTestString = ConfigurationManager.ConnectionStrings["DBResults"].ConnectionString;

            try
            {
                string sql = "SELECT ACQType, ACQData, ACQName FROM Tab_Acquisitions WHERE ID_Result='" + payload.ID_Result + "'";

                using (var conn = new SqlConnection(connDBTestString))
                using (var cmd = new SqlCommand(sql, conn))
                {
                    conn.Open();
                    var reader = cmd.ExecuteReader();

                    if (reader.Read())
                    {
                        string binaryString = "";

                        int AcqType = int.Parse(reader.GetValue(0).ToString());

                        switch (AcqType)
                        {
                            case 1:

                                lock (this)
                                {
                                    byte[] fileData = (Byte[])reader["ACQData"];
                                    string FileZip = System.Web.Hosting.HostingEnvironment.MapPath("~/Files/ACQFile.Zip");
                                    string FileAcq = System.Web.Hosting.HostingEnvironment.MapPath("~/Files/ACQFile.ACQ");

                                    File.WriteAllBytes(FileZip, fileData); 

                                    string destionationPath = UnZipFile(FileZip, System.Web.Hosting.HostingEnvironment.MapPath("~/Files/"));
                                    if (destionationPath.Trim() != "")
                                    {
                                        binaryString = File.ReadAllText(FileAcq, System.Text.Encoding.Default );
                                    }
                                }

                                return Ok(ParserMeasures(binaryString));

                            default:
                                binaryString = ReadFile(reader["ACQName"].ToString());
                                return Ok(ParserMeasures(binaryString));
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return Ok(new GraphData());

        }

        [HttpPost]
        [Route("printgraphdata")]
        public IHttpActionResult printgraphdata([FromBody] PrintDataPayload payload)
        {

            byte[] imageBytes = Convert.FromBase64String(payload.ImageBase64);

            string filePath = Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath("~/Images/" + payload.FileName));

            System.IO.File.WriteAllBytes(filePath, imageBytes);

            ExcelLibrary objExcel = new ExcelLibrary();
            objExcel.NewPackage(payload.FileName);

            if (objExcel.CreateReport(payload, filePath)) { 
                return Ok(new { result = "OK" });
            }
            else
            {
                return Ok(new { result = "OK", file = "" });
            }
            
            
        }

        private string Normalize(string key)
        {
            return key.Replace(" ", "").Replace("-", "");
        }

        private string formatnumber(string value)
        {
            try
            {
                Decimal outputDec = 0;
                if (Decimal.TryParse(value, out outputDec))
                {
                    return Decimal.Round(outputDec, 3).ToString();
                }
                else
                {
                    return int.Parse(value).ToString();
                }
            }
            catch
            {
                return value;
            }
            
        }

        private GraphData ParserMeasures(string measuredata)
        {
            GraphData graphData = new GraphData();
            if (measuredata.Trim() == "") return graphData;
 
            Measures measures = new Measures();

            bool res = measures.ParsMeasures(measuredata);
            
            if (res) {
                graphData.MeasurID = measures.MeasurID;
                graphData.MeasurColl = measures.MeasurColl;  
            }

            return graphData;

        }

        public string ReadFile(string fileAcqName)
        {
            if (!File.Exists(fileAcqName))
            {
                return "";
            }

            using (StreamReader rd = new StreamReader(fileAcqName, System.Text.Encoding.GetEncoding(1252)))
            {
                return rd.ReadToEnd(); 
            }
        }

        public string UnZipFile(string FileZipName, string extractPath)
        {
            try
            {
                if (!extractPath.EndsWith(Path.DirectorySeparatorChar.ToString(), StringComparison.Ordinal))
                    extractPath += Path.DirectorySeparatorChar;

                string destinationPath = "";

                using (ZipArchive archive = ZipFile.OpenRead(FileZipName))
                {
                    foreach (ZipArchiveEntry entry in archive.Entries)
                    {
                        if (entry.FullName.EndsWith(".ACQ", StringComparison.OrdinalIgnoreCase))
                        {
                            // SOLO nome file (senza cartelle)
                            string fileName = entry.Name;

                            destinationPath = Path.Combine(extractPath, fileName);

                            entry.ExtractToFile(destinationPath, true); // overwrite se esiste
                        }
                    }
                }

                return destinationPath;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return "";
        }

    }
}