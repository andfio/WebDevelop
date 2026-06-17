using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.CompilerServices;
using System.Web;

namespace WebAnalisys
{ 

    public static class ErrorLogger
    {
        private static readonly object _lock = new object();

        public static void LogException(
            Exception ex,
            [CallerMemberName] string callerName = "",
            [CallerFilePath] string callerFile = "",
            [CallerLineNumber] int callerLine = 0)
        {
            try
            {
                string logFolder = System.Web.Hosting.HostingEnvironment.MapPath("~/Logs/");

                if (!Directory.Exists(logFolder))
                {
                    Directory.CreateDirectory(logFolder);
                }

                string logFile = Path.Combine(logFolder, "errors-" + DateTime.Now.ToString("yyyyMMdd") + ".log");

                StackTrace trace = new StackTrace(ex, true);
                StackFrame frame = trace.GetFrame(0);

                string errorFile = frame != null ? frame.GetFileName() : "";
                int errorLine = frame != null ? frame.GetFileLineNumber() : 0;
                string errorMethod = frame != null && frame.GetMethod() != null
                    ? frame.GetMethod().DeclaringType.FullName + "." + frame.GetMethod().Name
                    : "";

                string message =
                    "--------------------------------------------------" + Environment.NewLine +
                    "Date: " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + Environment.NewLine +
                    "Caller Method: " + callerName + Environment.NewLine +
                    "Caller File: " + callerFile + Environment.NewLine +
                    "Caller Line: " + callerLine + Environment.NewLine +
                    "Error Method: " + errorMethod + Environment.NewLine +
                    "Error File: " + errorFile + Environment.NewLine +
                    "Error Line: " + errorLine + Environment.NewLine +
                    "Exception Type: " + ex.GetType().FullName + Environment.NewLine +
                    "Message: " + ex.Message + Environment.NewLine +
                    "Source: " + ex.Source + Environment.NewLine +
                    "StackTrace:" + Environment.NewLine + ex.StackTrace + Environment.NewLine;

                if (ex.InnerException != null)
                {
                    message +=
                        "InnerException Type: " + ex.InnerException.GetType().FullName + Environment.NewLine +
                        "InnerException Message: " + ex.InnerException.Message + Environment.NewLine +
                        "InnerException StackTrace:" + Environment.NewLine + ex.InnerException.StackTrace + Environment.NewLine;
                }

                lock (_lock)
                {
                    File.AppendAllText(logFile, message);
                }
            }
            catch
            {
                // Evita che un errore nel logger blocchi l'applicazione.
            }
        }
    }
}