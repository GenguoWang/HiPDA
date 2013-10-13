(function (window) {
    "use strict";
    console.log("Loading HiPDA");
    if (window.HiPDA) return;
    function hipda() {
        var baseUrl = "http://www.hi-pda.com/forum/";
        var loginUrl = baseUrl + "logging.php?action=login&loginsubmit=yes&inajax=1";
        var postUrl = baseUrl + "post.php";
        var forumUrl = baseUrl + "forumdisplay.php";
        var threadUrl = baseUrl + "viewthread.php";
        var userUrl = baseUrl + "space.php";
        var avatarUrl = baseUrl+"uc_server/data/avatar/";
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
        this.getForum = function (fid, page) {
            return httpClient.httpGet(forumUrl + "?fid=" + fid + "&page=" + page).then(function (res) {
                var doc = document.implementation.createHTMLDocument("doc");
                MSApp.execUnsafeLocalFunction(function () {
                    doc.documentElement.innerHTML = res;
                });
                return doc;
            });
        }
        this.getThread = function (tid, page) {
            return httpClient.httpGet(threadUrl + "?tid=" + tid + "&page=" + page).then(function (res) {
                var doc = document.implementation.createHTMLDocument("doc");
                MSApp.execUnsafeLocalFunction(function () {
                    doc.documentElement.innerHTML = res;
                });
                return doc;
            });
        }
        this.getThreadsFromForum = function (fid, page) {
            return this.getForum(fid, page).then(function (res) {
                var data = {};
                data.normalthread = [];
                data.stickthread = [];
                var tbody = res.getElementsByTagName("tbody");
                var size = tbody.length;
                for (var i = 0; i < size; i++) {
                    if (tbody[i].id.indexOf("stickthread") >= 0 || tbody[i].id.indexOf("normalthread") >= 0) {
                        var thread = {};
                        thread.id = tbody[i].id.trim().split("_")[1];
                        var nodes = tbody[i].getElementsByTagName("tr")[0];
                        thread.subject = nodes.children[2].getElementsByTagName("span")[0].innerText;
                        var regex = /^[\s\S]*uid=(\d*)">(.*)<\/a>[\s\S]*<em>(\S*)<\/em>[\s\S]*$/m
                        var author = nodes.children[3].innerHTML.trim().match(regex);
                        thread.uid = author[1];
                        thread.author = author[2];
                        thread.avatar = getAvatarUrl(thread.uid);
                        thread.postTime = author[3];
                        var replay = nodes.children[4].innerText.trim().split("/");
                        thread.replyNum = replay[0];
                        thread.viewNum = replay[1];
                        if (tbody[i].id.indexOf("stickthread") >= 0) {
                            data.stickthread.push(thread);
                        } else if (tbody[i].id.indexOf("normalthread") >= 0) {
                            data.normalthread.push(thread);
                        }
                    }
                }
                return data;
            });
        }
        this.getPostsFromThread = function (tid, page) {
            return this.getThread(tid, page).then(function (res) {
                var data = {};
                data.post = [];
                var postlist = res.getElementById("postlist").children;
                var size = postlist.length;
                for (var i = 0; i < size; i++) {
                    var post = {};
                    post.message = toStaticHTML(postlist[i].getElementsByClassName("t_msgfont")[0].innerHTML);
                    var postTime = postlist[i].getElementsByClassName("authorinfo")[0].getElementsByTagName("em")[0].innerText;
                    postTime = postTime.split(" ");
                    post.postTime = postTime[1] + " " + postTime[2];
                    post.author = postlist[i].getElementsByClassName("postinfo")[0].innerText;
                    var profile = postlist[i].getElementsByClassName("profile")[0];
                    post.uid = profile.children[1].innerText.trim();
                    post.avatar = getAvatarUrl(post.uid);
                    data.post.push(post);
                }
                return data;
            });
        }
        this.newthread = function (fid, subject, message) {
            return httpClient.httpGet(postUrl + "?action=newthread&fid=" + fid).then(function (res) {
                var doc = document.implementation.createHTMLDocument("example");
                MSApp.execUnsafeLocalFunction(function () {
                    doc.documentElement.innerHTML = res;
                });
                var formhash = doc.querySelector("input[name=formhash]").value;
                var posttime = doc.querySelector("input[name=posttime]").value;
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
                return httpClient.httpPost(postUrl + "?action=newthread&fid=" + fid + "&extra=&topicsubmit=yes", ps, "gb2312").then(function (res) {
                    return "success";
                });
            });
        }
        function getAvatarUrl(uid) {
            uid = parseInt(uid);
            var s = [];
            for (var i = 0; i < 9; ++i) {
                s[i] = uid % 10;
                uid = (uid - s[i]) / 10;
            }
            return avatarUrl + s[8] + s[7] + s[6] + "/" + s[5] + s[4] + "/" + s[3] + s[2] + "/" + s[1] + s[0] + "_avatar_middle.jpg";
        }
    };
    window.HiPDA = new hipda();
})(window);