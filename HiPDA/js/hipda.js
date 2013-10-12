(function () {
    "use strict";
     function hipda() {
        var baseUrl = "http://www.hi-pda.com/forum/";
        var loginUrl = baseUrl + "logging.php?action=login&loginsubmit=yes&inajax=1";
        var postUrl = baseUrl + "post.php";
        var encode = "gb2312";
        var httpClient = new SampleComponent.Example();
        this.login = function (username, password) {
            var ps = new Windows.Foundation.Collections.PropertySet();
            ps.insert("username", username);
            ps.insert("password", password);
            return httpClient.httpPost(loginUrl, ps, encode).then(function (res) {
                return "success";
            });
        }
        this.newthread = function (fid,subject, message) {
            return httpClient.httpGet(postUrl + "?action=newthread&fid=" + fid).then(function (res) {
                try{
                    var doc = document.implementation.createHTMLDocument("example");
                    doc.documentElement.innerHTML = toStaticHTML(res);
                    var formhash = doc.getElementById("formhash").value;
                    var posttime = doc.getElementById("posttime").value;
                    var ps = new Windows.Foundation.Collections.PropertySet();
                    ps.insert("formhash", formhash);
                    ps.insert("posttime", posttime);
                    ps.insert("wysiwyg", "1");
                    ps.insert("iconid", "14");
                    ps.insert("subject", subject);
                    ps.insert("message", message);
                    ps.insert("tags", "1，2，3");
                    ps.insert("attention_add", "1");
                    ps.insert("usesig", "1");
                    return httpClient.httpPost(postUrl+"?action=newthread&fid="+fid+"&extra=&topicsubmit=yes", ps, "gb2312").then(function (res) {
                        return "success";
                    });
                } catch (e) {
                    return e.message;
                }
            });
        }
    };
     window.HiPDA = new hipda();
})();