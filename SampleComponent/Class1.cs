using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.Net.Http;
using System.IO;
using Windows.Foundation;

namespace SampleComponent
{
    public sealed class Example
    {
        public static string GetAnswer()
        {
            return "The answer is 42.";
        }
        public static string GetEncoding(string wgg)
        {
            Encoding gb = Encoding.GetEncoding("gb2312");
            Encoding ut = Encoding.UTF8;
            byte[] utbyte = ut.GetBytes(wgg);
            byte[] gbbyte = Encoding.Convert(ut, gb, utbyte);
            byte[] enn = WebUtility.UrlEncodeToBytes(gbbyte, 0, gbbyte.Length);

            char[] gbChars = new char[ut.GetCharCount(enn, 0, enn.Length)];
            ut.GetChars(enn, 0, enn.Length, gbChars, 0);
            string res = new string(gbChars);
            return res;
        }
        /*
        public static async Task GetHtml()
        {
            //WebRequest request = WebRequest.Create("http://www.baidu.com");
            //WebResponse response = await request.GetResponseAsync();
            HttpClient client = new HttpClient();
            Task<byte[]> getContentsTask = client.GetByteArrayAsync("http://www.baidu.com");
            byte[] urlContents = await getContentsTask;
            //return urlContents;
        }*/
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
