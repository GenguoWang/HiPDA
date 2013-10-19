using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.Net.Http;
using System.IO;
using Windows.Foundation;
using System.Text.RegularExpressions;
using System.Runtime.InteropServices.WindowsRuntime;
namespace KingoComponent
{
    public sealed class HttpHandle
    {
        private CookieContainer cookieJar = new CookieContainer();
        public IAsyncOperation<string> HttpGet(string url)
        {
            return Task.Run<string>(async () =>
            {
                HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(url);
                request.CookieContainer = cookieJar;
                Task<WebResponse> taskresponse = request.GetResponseAsync();
                HttpWebResponse response = (HttpWebResponse)await taskresponse;
                byte[] data = new byte[1024000];
                int length = 0;
                int cnt = 1;
                while (cnt > 0)
                {
                    cnt = await response.GetResponseStream().ReadAsync(data, length, 1024000 - length);
                    length += cnt;
                }
                char[] asciiChars = new char[length];
                Encoding ascii = Encoding.GetEncoding("us-ascii");
                ascii.GetChars(data, 0, length, asciiChars, 0);
                string tempStr = new string(asciiChars);
                Match m = Regex.Match(tempStr, "<meta.*charset=(.*?)\"");
                string code = m.Groups[1].ToString();
                Encoding gb;
                if (code == "gbk" || code == "gb2312") gb = Encoding.GetEncoding("gb2312");
                else gb = Encoding.UTF8;
                Encoding ut = Encoding.UTF8;
                byte[] utbyte = Encoding.Convert(gb, ut, data, 0, length);
                char[] utChars = new char[ut.GetCharCount(utbyte, 0, utbyte.Length)];
                ut.GetChars(utbyte, 0, utbyte.Length, utChars, 0);
                string res = new string(utChars);
                return res;
            }).AsAsyncOperation();
        }
        public IAsyncOperation<string> HttpPost(string url, IDictionary<string, object> toPost, string toCode)
        {
            return Task.Run<string>(async () =>
           {
               HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(url);
               request.CookieContainer = cookieJar;
               request.Method = "POST";
               request.ContentType = "application/x-www-form-urlencoded";
               string postData = "";
               bool first = true;
               foreach (KeyValuePair<string, object> kvp in toPost)
               {
                   if (first)
                   {
                       first = false;
                       postData += GetEncoding(kvp.Key, toCode) + "=" + GetEncoding(kvp.Value.ToString(), toCode);
                   }
                   else
                   {
                       postData += "&" + GetEncoding(kvp.Key, toCode) + "=" + GetEncoding(kvp.Value.ToString(), toCode);
                   }
               }
               Encoding ascii = Encoding.GetEncoding("us-ascii");
               byte[] byte1 = ascii.GetBytes(postData);
               Stream newStream = await request.GetRequestStreamAsync();
               newStream.Write(byte1, 0, byte1.Length);
               Task<WebResponse> taskresponse = request.GetResponseAsync();
               HttpWebResponse response = (HttpWebResponse)await taskresponse;
               byte[] data = new byte[1024000];
               int length = 0;
               int cnt = 1;
               while (cnt > 0)
               {
                   cnt = await response.GetResponseStream().ReadAsync(data, length, 1024000 - length);
                   length += cnt;
               }
               char[] asciiChars = new char[length];
               ascii.GetChars(data, 0, length, asciiChars, 0);
               string tempStr = new string(asciiChars);
               Match m = Regex.Match(tempStr, "<meta.*charset=(.*?)\"");
               string code = m.Groups[1].ToString();
               if (string.IsNullOrEmpty(code))
               {
                   m = Regex.Match(tempStr, "<\\?xml.*encoding=\"(.*?)\"");
                   code = m.Groups[1].ToString();
               }
               Encoding gb;
               if (code == "gbk" || code == "gb2312") gb = Encoding.GetEncoding("gb2312");
               else gb = Encoding.UTF8;
               Encoding ut = Encoding.UTF8;
               byte[] utbyte = Encoding.Convert(gb, ut, data, 0, length);
               char[] utChars = new char[ut.GetCharCount(utbyte, 0, utbyte.Length)];
               ut.GetChars(utbyte, 0, utbyte.Length, utChars, 0);
               string res = new string(utChars);
               return res;
           }).AsAsyncOperation();
        }

        public IAsyncOperation<string> HttpPostFile(string url, IDictionary<string, object> toPost, string filename,string filetype, string fieldname, Windows.Storage.Streams.IBuffer filebuffer)
        {
            return Task.Run<string>(async () =>
            {
                string boundary = "---------------------------" + DateTime.Now.Ticks.ToString("x");
                Encoding ascii = Encoding.GetEncoding("us-ascii");
                byte[] boundarybytes = ascii.GetBytes("\r\n--" + boundary + "\r\n");

                HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(url);
                request.CookieContainer = cookieJar;
                request.Method = "POST";
                request.ContentType = "multipart/form-data; boundary=" + boundary;
                string formdataTemplate = "Content-Disposition: form-data; name=\"{0}\"\r\n\r\n{1}";
                Stream newStream = await request.GetRequestStreamAsync();
                foreach (KeyValuePair<string, object> kvp in toPost)
                {
                    newStream.Write(boundarybytes, 0, boundarybytes.Length);
                    string formitem = string.Format(formdataTemplate, kvp.Key, kvp.Value.ToString());
                    byte[] formitembytes = Encoding.UTF8.GetBytes(formitem);
                    newStream.Write(formitembytes, 0, formitembytes.Length);
                }
                newStream.Write(boundarybytes, 0, boundarybytes.Length);
                string headerTemplate = "Content-Disposition: form-data; name=\"{0}\"; filename=\"{1}\"\r\nContent-Type: {2}\r\n\r\n";
                string header = string.Format(headerTemplate, fieldname, filename, filetype);
                byte[] headerbytes = Encoding.UTF8.GetBytes(header);
                newStream.Write(headerbytes, 0, headerbytes.Length);
                //newStream.wr
                byte []buffer = filebuffer.ToArray();
                newStream.Write(buffer, 0, buffer.Length);
                byte[] trailer = ascii.GetBytes("\r\n--" + boundary + "--\r\n");
                newStream.Write(trailer, 0, trailer.Length);
                Task<WebResponse> taskresponse = request.GetResponseAsync();
                HttpWebResponse response = (HttpWebResponse)await taskresponse;
                byte[] data = new byte[1024000];
                int length = 0;
                int cnt = 1;
                while (cnt > 0)
                {
                    cnt = await response.GetResponseStream().ReadAsync(data, length, 1024000 - length);
                    length += cnt;
                }
                char[] asciiChars = new char[length];
                ascii.GetChars(data, 0, length, asciiChars, 0);
                string tempStr = new string(asciiChars);
                Match m = Regex.Match(tempStr, "<meta.*charset=(.*?)\"");
                string code = m.Groups[1].ToString();
                if (string.IsNullOrEmpty(code))
                {
                    m = Regex.Match(tempStr, "<\\?xml.*encoding=\"(.*?)\"");
                    code = m.Groups[1].ToString();
                }
                Encoding gb;
                if (code == "gbk" || code == "gb2312") gb = Encoding.GetEncoding("gb2312");
                else gb = Encoding.UTF8;
                Encoding ut = Encoding.UTF8;
                byte[] utbyte = Encoding.Convert(gb, ut, data, 0, length);
                char[] utChars = new char[ut.GetCharCount(utbyte, 0, utbyte.Length)];
                ut.GetChars(utbyte, 0, utbyte.Length, utChars, 0);
                string res = new string(utChars);
                return res;
            }).AsAsyncOperation();
        }

        public static string GetAnswer()
        {
            return "The answer is 42.";
        }
        public string GetEncoding(string wgg,string code)
        {
            Encoding gb;
            if (code == "gbk" || code == "gb2312") gb = Encoding.GetEncoding("gb2312");
            else gb = Encoding.UTF8;
            Encoding ut = Encoding.UTF8;
            byte[] utbyte = ut.GetBytes(wgg);
            byte[] gbbyte = Encoding.Convert(ut, gb, utbyte);
            byte[] enn = WebUtility.UrlEncodeToBytes(gbbyte, 0, gbbyte.Length);
            char[] gbChars = new char[ut.GetCharCount(enn, 0, enn.Length)];
            ut.GetChars(enn, 0, enn.Length, gbChars, 0);
            string res = new string(gbChars);
            return res;
        }

        public static IAsyncOperation<string> DownloadAsStringsAsync(string id)
        {
            return Task.Run<string>(async () =>
            {
                HttpClient client = new HttpClient();
                Task<byte[]> getContentsTask = client.GetByteArrayAsync("http://www.baidu.com");
                byte[] urlContents = await getContentsTask;
                //Encoding gb = Encoding.GetEncoding("gb2312");
                Encoding gb = Encoding.UTF8;
                Encoding ut = Encoding.UTF8;
                byte[] utbyte = Encoding.Convert(gb, ut, urlContents);
                char[] utChars = new char[ut.GetCharCount(utbyte, 0, utbyte.Length)];
                ut.GetChars(utbyte, 0, utbyte.Length, utChars, 0);
                string res = new string(utChars);
                return res;
            }).AsAsyncOperation();
        }
        public int SampleProperty { get; set; }
    }
}
