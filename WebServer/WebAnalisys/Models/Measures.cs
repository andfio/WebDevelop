using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Threading;

namespace WebAnalisys.Models
{
    public class Measures
    {

        private const int ACQ_SLEEP_COUNT = 200;

        // Ex-global VB6 fields portati dentro la classe
        public List<float[]> MeasurColl  = new List<float[]>();
        public int[] MeasurID = Array.Empty<int>();

        public int intNumEnabledMeasure;
        public float sngLastPoint;
        public float sngFirstPoint;

        public float g_lngSeekRealTime;
        public float[] m_sngOutVet = new float[0];
        public long m_lngTotRec;

        public Measures()
        {
            ResetMeasures();
        }

        public void ResetMeasures()
        {
            MeasurColl = new List<float[]>();
            MeasurID = Array.Empty<int>();
            intNumEnabledMeasure = 0;
            g_lngSeekRealTime = 0;
            m_lngTotRec = 0;
            m_sngOutVet = new float[0];
        }

        public bool ParsMeasures(string strMeasuresData)
        {
            try
            {
                int idxAcqCount = 0;
                string strSect;
                string strAppData;
                string strDataType;
                int lngActStart;
                short intDataLen;
                bool blnSicurezza;
                int intNumEnMeasure = 0;
                int lngStrDataLen;

                lngStrDataLen = strMeasuresData?.Length ?? 0;

                if (lngStrDataLen > 0)
                {
                    // VB6 usa stringhe 1-based
                    lngActStart = 1;
                    blnSicurezza = true;
                    idxAcqCount = 0;

                    while ((lngActStart < strMeasuresData.Length) && blnSicurezza)
                    {
                        if (idxAcqCount > ACQ_SLEEP_COUNT)
                        {
                            idxAcqCount = 0;
                            Thread.Sleep(0);
                        }
                        else
                        {
                            idxAcqCount++;
                        }

                        // Lettura dei primi 3 byte (tipo e lunghezza)
                        strSect = Mid(strMeasuresData, lngActStart, 3);

                        // Tipo di dato
                        strDataType = Left(strSect, 1);

                        // Dimensioni del dato
                        intDataLen = GetInt(Mid(strSect, 2, 2));

                        switch (strDataType)
                        {
                            case "S":
                                // Lettura della stringa
                                strAppData = Mid(strMeasuresData, lngActStart + 3, intDataLen);

                                GestString(strAppData, ref MeasurID, ref intNumEnMeasure);

                                if (intNumEnMeasure > 0)
                                {
                                    // In VB6: ReDim m_sngOutVet(0 To intNumEnMeasure, 0 To 0)
                                    m_sngOutVet = new float[intNumEnMeasure + 1];
                                    intNumEnabledMeasure = intNumEnMeasure;
                                }

                                lngActStart += intDataLen + 3;
                                g_lngSeekRealTime += intDataLen + 3;
                                break;

                            case "D":
                                // Lettura dei Double
                                strAppData = Mid(strMeasuresData, lngActStart + 3, intDataLen * 8);

                                if (intNumEnabledMeasure > (strAppData.Length / 8))
                                {
                                    blnSicurezza = false;
                                }
                                else
                                {
                                    m_sngOutVet = new float[intNumEnabledMeasure + 1];

                                    if (LoadOutMeasVet(strAppData, ref m_sngOutVet, MeasurID))
                                    {
                                        // Clono il vettore, altrimenti aggiungeresti sempre lo stesso riferimento
                                        MeasurColl.Add(m_sngOutVet);
                                        m_lngTotRec++;
                                    }
                                    else
                                    {
                                        return false;
                                    }

                                    lngActStart += (intDataLen * 8) + 3;
                                    g_lngSeekRealTime += (intDataLen * 8) + 3;
                                }
                                break;

                            default:
                                blnSicurezza = false;
                                break;
                        }
                    }
                }
                else
                {
                    m_lngTotRec = 0;
                }

                return true;
            }
            catch(Exception ex)
            {
                ErrorLogger.LogException(ex);
                return false;
            }
        }

        //private short GetInt(string strSource)
        //{
        //    try
        //    {
        //        if (string.IsNullOrEmpty(strSource) || strSource.Length < 2)
        //            return 0;


        //        byte[] bytes = new byte[2];
        //        bytes[0] = (byte)strSource[0];
        //        bytes[1] = (byte)strSource[1];

        //        return BitConverter.ToInt16(bytes, 0);
        //    }
        //    catch
        //    {
        //        return 0;
        //    }
        //}

        private short GetInt(string strSource)
        {
            try
            {
                if (string.IsNullOrEmpty(strSource) || strSource.Length < 2)
                    return 0;

                byte[] bytes = System.Text.Encoding.GetEncoding(1252).GetBytes(strSource.Substring(0, 2));
                return BitConverter.ToInt16(bytes, 0);
            }
            catch
            {
                return 0;
            }
        }

        private double GetDouble(string strSource)
        {
            try
            {
                if (string.IsNullOrEmpty(strSource) || strSource.Length < 8)
                    return 0;

                byte[] bytes = System.Text.Encoding.GetEncoding(1252).GetBytes(strSource.Substring(0, 8));
                return BitConverter.ToDouble(bytes, 0);
            }
            catch
            {
                return 0;
            }
        }

        private void GestString(string data, ref int[] intMeasIDVect, ref int intNSampleMeas)
        {
            try
            {
                string strAppKey;
                int intEndPos;
                string strAppNMeas;
                string strAppIdMeas;

                if (!string.IsNullOrEmpty(data))
                {
                    intEndPos = InStr(1, data, ":");

                    if (intEndPos > 0)
                    {
                        strAppKey = Left(data, intEndPos - 1).Trim();

                        switch (strAppKey)
                        {
                            case "Number of Measures":
                                // Nel VB6 originale c'è "Number of Measure" senza s.
                                // Mantengo la stessa logica per compatibilità.
                                strAppNMeas = GetDataKey(data, "Number of Measure", ":");

                                if (!string.IsNullOrEmpty(strAppNMeas))
                                {
                                    intNSampleMeas = SafeValToInt(strAppNMeas);

                                    if (intNSampleMeas > 0)
                                    {
                                        intMeasIDVect = new int[intNSampleMeas];
                                    }
                                    else
                                    {
                                        intMeasIDVect = Array.Empty<int>();
                                    }
                                }
                                else
                                {
                                    intNSampleMeas = -1;
                                }
                                break;

                            case "Measures IDs":
                                intNSampleMeas = -1;

                                strAppIdMeas = GetDataKey(data, "Measures IDs", ":");
                                if (!string.IsNullOrEmpty(strAppIdMeas))
                                {
                                    SetRealMeaIdVet(strAppIdMeas, ref intMeasIDVect);
                                }
                                break;
                        }
                    }
                }
            }
            catch
            {
                // Nel VB6 originale l'errore viene ignorato
            }
        }

        private bool LoadOutMeasVet(string data, ref float[] outMeasVet, int[] vetMeasID)
        {
            try
            {
                int intNumMeas = data.Length / 8;
                int intActPos = 1;

                for (int i = 0; i < intNumMeas; i++)
                {
                    double dblValue = GetDouble(Mid(data, intActPos, 8));
                    outMeasVet[i] = (float)dblValue;
                    intActPos += 8;
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        private string GetDataKey(string strSearch, string key, string separatore)
        {
            try
            {
                if (string.IsNullOrEmpty(strSearch))
                    return string.Empty;

                string upperSearch = strSearch.ToUpperInvariant();
                string upperKey = key.ToUpperInvariant();

                int intStart = upperSearch.IndexOf(upperKey, StringComparison.Ordinal);
                if (intStart < 0)
                    return string.Empty;

                int intAppPos = upperSearch.IndexOf(separatore, intStart, StringComparison.Ordinal);
                if (intAppPos < 0)
                    return string.Empty;

                intAppPos += 1;

                int lineBreakPos = upperSearch.IndexOf("\r\n", intAppPos, StringComparison.Ordinal);

                string strAppData;
                if (lineBreakPos < 0)
                {
                    strAppData = upperSearch.Substring(intAppPos);
                }
                else
                {
                    strAppData = upperSearch.Substring(intAppPos, lineBreakPos - intAppPos);
                }

                return strAppData.Trim();
            }
            catch
            {
                return string.Empty;
            }
        }

        private bool SetRealMeaIdVet(string strMeasId, ref int[] intMeasIDVect)
        {
            try
            {
                int intActStart = 1;
                int intActVetPos = 0;
                int intActEnd = InStr(intActStart, strMeasId, ";");

                while (intActEnd != 0)
                {
                    int intIdLen = intActEnd - intActStart;
                    string strAppId = Mid(strMeasId, intActStart, intIdLen).Trim();

                    if (int.TryParse(strAppId, NumberStyles.Integer, CultureInfo.InvariantCulture, out int id))
                    {
                        if (intActVetPos < intMeasIDVect.Length)
                        {
                            intMeasIDVect[intActVetPos] = id;
                        }
                    }

                    intActStart = intActEnd + 1;
                    intActEnd = InStr(intActStart, strMeasId, ";");
                    intActVetPos++;
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        //private double GetDouble(string strSource)
        //{
        //    try
        //    {
        //        if (string.IsNullOrEmpty(strSource) || strSource.Length < 8)
        //            return 0;

        //        byte[] bytes = new byte[8];
        //        for (int i = 0; i < 8; i++)
        //        {
        //            bytes[i] = (byte)strSource[i];
        //        }

        //        return BitConverter.ToDouble(bytes, 0);
        //    }
        //    catch
        //    {
        //        return 0;
        //    }
        //}

        private static float[,] Clone2DArray(float[,] source)
        {
            int dim0 = source.GetLength(0);
            int dim1 = source.GetLength(1);
            var clone = new float[dim0, dim1];

            for (int i = 0; i < dim0; i++)
            {
                for (int j = 0; j < dim1; j++)
                {
                    clone[i, j] = source[i, j];
                }
            }

            return clone;
        }

        // Helpers VB6-like

        private static string Mid(string value, int start, int length)
        {
            if (string.IsNullOrEmpty(value) || start <= 0 || start > value.Length)
                return string.Empty;

            int zeroBasedStart = start - 1;
            int safeLength = Math.Min(length, value.Length - zeroBasedStart);
            if (safeLength <= 0)
                return string.Empty;

            return value.Substring(zeroBasedStart, safeLength);
        }

        private static string Left(string value, int length)
        {
            if (string.IsNullOrEmpty(value) || length <= 0)
                return string.Empty;

            return value.Length <= length ? value : value.Substring(0, length);
        }

        private static int InStr(int start, string text, string search)
        {
            if (string.IsNullOrEmpty(text) || string.IsNullOrEmpty(search) || start <= 0)
                return 0;

            int index = text.IndexOf(search, start - 1, StringComparison.OrdinalIgnoreCase);
            return index >= 0 ? index + 1 : 0;
        }

        private static int SafeValToInt(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return 0;

            value = value.Trim();

            int i = 0;
            while (i < value.Length &&
                   (char.IsDigit(value[i]) || value[i] == '+' || value[i] == '-' || value[i] == '.' || value[i] == ','))
            {
                i++;
            }

            string numericPart = value.Substring(0, i).Replace(',', '.');

            if (double.TryParse(numericPart, NumberStyles.Any, CultureInfo.InvariantCulture, out double result))
                return (int)result;

            return 0;
        }
    }
}
