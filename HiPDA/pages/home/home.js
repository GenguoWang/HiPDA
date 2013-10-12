(function () {
    "use strict";
    var httpClient = new SampleComponent.Example();
    WinJS.UI.Pages.define("/pages/home/home.html", {
        // 每当用户导航至此页面时都要调用此功能。它
        // 使用应用程序的数据填充页面元素。
        ready: function (element, options) {
            // TODO: 在此处初始化页面。
            /*
            var oMyFormData = new FormData();
            oMyFormData.append("username", "ciceblue");
            oMyFormData.append("password", "317519");
            WinJS.xhr({
                url: "http://www.hi-pda.com/forum/logging.php?action=login&loginsubmit=yes&inajax=1",
                type: "POST",
                data: oMyFormData,
                responseType: "document"
            }).then(function (result) {
                console.log("ttsuccess");
                
                WinJS.xhr({ "url": "http://www.hi-pda.com/forum/", "responseType": "document" }).then(function (result) {
                    console.log("success");
                    var response = result.response;
                    document.getElementById("output").innerHTML = toStaticHTML(SampleComponent.Example.getEncoding(response.body.innerHTML));
                    //document.getElementById("output").innerHTML = toStaticHTML(response.body.innerHTML);
                    WinJS.log && WinJS.log(result);
                });
                
                WinJS.xhr({ url: "http://www.baidu.com/", responseType: "document" }).then(function (result) {
                    console.log("success");
                    var response = result.response;
                    document.getElementById("content").innerHTML = toStaticHTML(response.body.innerHTML);
                    WinJS.log && WinJS.log(result);
                });
            });*/
            var ex;
            function basics1() {
                document.getElementById('output').innerHTML = SampleComponent.Example.getEncoding("这里是个什么地方");
                SampleComponent.Example.downloadAsStringsAsync("id").then(function (res) {
                    //document.getElementById('output').innerHTML = res; 
                    var dom = new DOMParser();
                    try {
                        //domd = dom.parseFromString(res, "text/xml");
                        //dom.parseFromString(
                        //console.log(domd.body.innerHTML);
                        //document.implementation.createHTMLDocument();
                        var doc = document.implementation.createHTMLDocument("example");
                        doc.documentElement.innerHTML = toStaticHTML(res);
                        document.getElementById('output').innerHTML = doc.body.innerHTML;
                    }
                    catch (e) {
                        console.log(e.message);
                    }
                    console.log("here");
                });


            }

            function basics2() {
                httpClient.httpGet("http://www.hi-pda.com/forum").then(function (res) {
                    var doc = document.implementation.createHTMLDocument("example");
                    doc.documentElement.innerHTML = toStaticHTML(res);
                    var tags = doc.getElementsByTagName("tbody");
                    for (var i = 0; i < tags.length; ++i) {

                        document.getElementById('output').innerHTML += tags[i].innerText + "<br/>";
                    }
                    //document.getElementById("output").innerHTML = toStaticHTML(res);
                }, function (res) {
                    console.log(res.message);
                });
            }
            function basics3() {
                var ps = new Windows.Foundation.Collections.PropertySet();
                //Windows.Foundation.Collections.
                ps.insert("username", "ciceblue");
                ps.insert("password", "317519");
                httpClient.httpPost("http://www.hi-pda.com/forum/logging.php?action=login&loginsubmit=yes&inajax=1", ps, "gb2312").then(function (res) {
                    console.log(res);
                    basics2();
                    basics5();
                }, function (res) {
                    console.log(res.message);
                });
            }
            function basics5() {
                httpClient.httpGet("http://www.hi-pda.com/forum/post.php?action=newthread&fid=57").then(function (res) {
                    var doc = document.implementation.createHTMLDocument("example");
                    doc.documentElement.innerHTML = toStaticHTML(res);
                    //var tags = doc.getElementsByTagName("tbody");
                    var formhash = doc.getElementById("formhash").value;
                    var posttime = doc.getElementById("posttime").value;
                    basics4(formhash, posttime);
                });
            }
            function basics4(formhash, posttime) {
                var ps = new Windows.Foundation.Collections.PropertySet();
                ps.insert("formhash", formhash);
                ps.insert("posttime", posttime);
                ps.insert("wysiwyg", "1");
                ps.insert("iconid", "14");
                ps.insert("subject", "标题哈哈");
                ps.insert("message", "好地方好地方");
                ps.insert("tags", "1，2，3");
                ps.insert("attention_add", "1");
                ps.insert("usesig", "1");
                httpClient.httpPost("http://www.hi-pda.com/forum/post.php?action=newthread&fid=57&extra=&topicsubmit=yes", ps, "gb2312").then(function (res) {
                    console.log(res);
                }, function (res) {
                    console.log(res.message);
                });
            }
            //basics2();
            //basics3();
            //basics2();
            var res = HiPDA.login("ciceblue", "317519").then(function (res) {
                console.log(res);
                HiPDA.newthread(57, "来自美好的地方", "我不是机器人哈哈").then(function (res) {
                    console.log(res);
                });
            });
        }
    });
})();
