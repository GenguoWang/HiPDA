(function () {
    "use strict";
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
                ex.sampleProperty += 1;
                document.getElementById('output').innerHTML += "<br/>" +
                    ex.sampleProperty;
            }
            basics1();
            //basics2();
        }
    });
})();
