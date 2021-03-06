﻿(function (window) {
    "use strict";
    if (window.HiPDA) return;
    function hipda() {
        var baseUrl = "http://www.hi-pda.com/forum/";
        var loginUrl = baseUrl + "logging.php?action=login&loginsubmit=yes&inajax=1";
        var postUrl = baseUrl + "post.php";
        var postImageUrl = baseUrl + "misc.php?action=swfupload&operation=upload&simple=1&type=image";
        var forumUrl = baseUrl + "forumdisplay.php";
        var threadUrl = baseUrl + "viewthread.php";
        var userUrl = baseUrl + "space.php";
        var avatarUrl = baseUrl + "uc_server/data/avatar/";
        var pmUrl = baseUrl + "pm.php";
        var encode = "gb2312";
        var httpClient = new KingoComponent.HttpHandle();
        this.defaultForumId = "2";
        this.tailMessage = "Win8客户端";
        this.tailFormat = "    [size=1][color=#48d1cc][b]%s[/b][/color][/size]";
        this.login = function (username, password) {
            var ps = new Windows.Foundation.Collections.PropertySet();
            ps.insert("username", username);
            ps.insert("password", password);
            return httpClient.httpPost(loginUrl, ps, encode).then(function (res) {
                var resXml = new DOMParser().parseFromString(res, "text/xml");
                if (res.indexOf("错误") === -1 && res.indexOf("失败") === -1) {
                    return "success";
                } else {
                    return resXml.getElementsByTagName("root")[0].textContent;
                }
            });
        }
        this.uploadImage = function (uid, hash, filename, filetype, buffer) {
            hash = "aefa3a07ab4914a199e1f528ec937466";
            var ps = new Windows.Foundation.Collections.PropertySet();
            ps.insert("uid", uid);
            ps.insert("hash", hash);
            return httpClient.httpPostFile(postImageUrl, ps, filename, filetype, "Filedata", buffer).then(function (res) {
                if (res.match(/(.*\|){3}/)) return res.split("|")[2];
                else return "error";
            }, function (res) {
                WinJS.log && WinJS.log(res);
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
        this.getForums = function () {
            return httpClient.httpGet(baseUrl).then(function (res) {
                var data = {};
                data.group = [];
                try {
                    var doc = document.implementation.createHTMLDocument("doc");
                    MSApp.execUnsafeLocalFunction(function () {
                        doc.documentElement.innerHTML = res;
                    });
                    HiPDA.uid = doc.querySelector("#header cite a").href.split("=")[1];
                    var groups = doc.getElementsByClassName("mainbox");
                    var groupSize = groups.length;
                    for (var i = 0; i < groupSize; ++i) {
                        var group = {};
                        group.forum = [];
                        var head = groups[i].querySelector("h3 a");
                        if (head) {
                            group.title = head.innerText;
                            group.id = head.href.split("=")[1];
                        }
                        var nodes = groups[i].querySelectorAll("tr");
                        var fSize = nodes.length;
                        if (fSize > 0) {
                            for (var j = 0; j < fSize; ++j) {
                                var forum = {};
                                var title = nodes[j].querySelector("a");
                                forum.title = title.innerText;
                                forum.id = title.href.split("=")[1];
                                forum.message = nodes[j].querySelector("p").innerText;
                                group.forum.push(forum);
                            }
                            data.group.push(group);
                        }
                    }
                }
                catch (e) {
                    WinJS.log && WinJS.log(e.message);
                }
                return data;
            });
        }
        this.getThreadsFromForum = function (fid, page) {
            return this.getForum(fid, page).then(function (res) {
                var data = {};
                data.uid = -1;
                data.normalthread = [];
                data.stickthread = [];
                data.totalPage = 1;
                try {
                    data.uid = res.querySelector("#header cite a").href.split("=")[1];
                    var pages = res.querySelector(".pages");
                    if (pages) {
                        pages = pages.children;
                        var i = pages.length - 1;
                        while (i >= 0 && pages[i].innerText.indexOf("下一页") >= 0) i--;
                        data.totalPage = parseInt(pages[i].innerText.replace(/\D*/g, ""));
                    }
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
                            if (author) {
                                thread.uid = author[1];
                                thread.author = author[2];
                                thread.avatar = getAvatarUrl(thread.uid);
                                thread.postTime = author[3];
                            } else {
                                thread.uid = -1;
                                thread.author = "匿名";
                                thread.avatar = "/images/noavatar.jpg";
                                thread.postTime = "xxxx";
                            }
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
                }
                catch (e) {
                    WinJS.log && WinJS.log(e.message);
                }
                return data;
            });
        }
        this.getPM = function(pmUid){
            var url = pmUrl;
            if(pmUid) url += "?uid="+pmUid+"&filter=privatepm&daterange=5";
            return httpClient.httpGet(url).then(function (res) {
                var data = {
                    pm: []
                };
                try {
                    var doc = document.implementation.createHTMLDocument("doc");
                    MSApp.execUnsafeLocalFunction(function () {
                        doc.documentElement.innerHTML = res;
                    });
                    var lis = doc.querySelectorAll(".pm_list li");
                    var len = lis.length;
                    for (var i = 0; i < len; ++i) {
                        if (lis[i].className == "pm_date") continue;
                        var author = lis[i].querySelector("cite").innerText;
                        if (!pmUid) {
                            var uid = lis[i].querySelector("cite a").href.split("=")[1];
                        }
                        else if (lis[i].classList.contains("self")) {
                            var uid = HiPDA.uid;
                        }
                        else {
                            var uid = pmUid;
                        }
                        var postTime = lis[i].querySelector(".cite").childNodes[2].nodeValue.trim();
                        var message = lis[i].querySelector(".summary").innerText;
                        data.pm.push({ author: author, uid: uid, postTime: postTime, message: message });
                    }
                }
                catch (e) {
                    console.log(e.message);
                }
                return data;
            });
        }
        this.getPostsFromThread = function (tid, page) {
            return this.getThread(tid, page).then(function (res) {
                var data = {};
                data.post = [];
                data.uid = -1;
                data.formhash = null;
                data.totalPage = 1;
                var index = 0;
                try {
                    data.uid = res.querySelector("#header cite a").href.split("=")[1];
                    data.formhash = res.querySelector("input[name=formhash]").value;
                    var pages = res.querySelector(".pages");
                    if (pages) {
                        pages = pages.children;
                        var i = pages.length - 1;
                        while (i >= 0 && pages[i].innerText.indexOf("下一页") >= 0) i--;
                        data.totalPage = parseInt(pages[i].innerText.replace(/\D*/g, ""));
                    }
                    var postlist = res.getElementById("postlist").children;
                    var size = postlist.length;
                    for (var i = 0; i < size; i++) {

                        var post = {};
                        post.id = postlist[i].id.split("_")[1];
                        post.num = postlist[i].querySelector(".postinfo em").innerText;
                        var message = postlist[i].getElementsByClassName("t_msgfontfix")[0];
                        if (!message) continue;//todo, 作者被禁止或删除
                        var hrefs = message.getElementsByTagName("a");
                        var hSize = hrefs.length;
                        for (var j = 0; j < hSize; ++j) {
                            if (hrefs[j].href.indexOf("http://") == -1) {
                                hrefs[j].href = hrefs[j].href.replace(/ms-appx:\/\/[\w\-]*\//, baseUrl);
                            }
                        }
                        var imgs = message.getElementsByTagName("img");
                        var iSize = imgs.length;
                        for (var j = 0; j < iSize; ++j) {
                            if (imgs[j].attributes["file"]) {
                                imgs[j].src = baseUrl + imgs[j].attributes["file"].value;
                            }
                            else if (imgs[j].src && imgs[j].src.indexOf("http://") == -1) {
                                imgs[j].src = imgs[j].src.replace(/ms-appx:\/\/[\w\-]*\//, baseUrl);
                            }
                        }
                        post.message = toStaticHTML(message.innerHTML);
                        var postTime = postlist[i].getElementsByClassName("authorinfo")[0].getElementsByTagName("em")[0].innerText;
                        postTime = postTime.split(" ");
                        post.postTime = postTime[1] + " " + postTime[2];
                        post.author = postlist[i].getElementsByClassName("postinfo")[0].innerText;
                        var profile = postlist[i].getElementsByClassName("profile")[0];
                        post.uid = profile.children[1].innerText.trim();
                        post.avatar = getAvatarUrl(post.uid);
                        post.index = index;
                        data.post.push(post);
                        index++;
                    }
                }
                catch (e) {
                    WinJS.log && WinJS.log(e.message);
                }
                return data;
            });
        }
        this.getQuote = function (tid, postId) {
            var url = postUrl + "?action=reply&tid=" + tid + "&repquote=" + postId;
            return httpClient.httpGet(url).then(function (res) {
                var doc = document.implementation.createHTMLDocument("example");
                MSApp.execUnsafeLocalFunction(function () {
                    doc.documentElement.innerHTML = res;
                });
                return doc.querySelector("textarea").value;
            });
        }
        this.getReply = function (tid, postId) {
            var url = postUrl + "?action=reply&tid=" + tid + "&reppost=" + postId;
            return httpClient.httpGet(url).then(function (res) {
                var doc = document.implementation.createHTMLDocument("example");
                MSApp.execUnsafeLocalFunction(function () {
                    doc.documentElement.innerHTML = res;
                });
                return doc.querySelector("textarea").value;
            });
        }
        this.newThread = function (fid, subject, message, imageAttach) {
            if (this.tailMessage) message += this.tailFormat.replace("%s", this.tailMessage);
            return httpClient.httpGet(postUrl + "?action=newthread&fid=" + fid).then(function (res) {
                var doc = document.implementation.createHTMLDocument("example");
                MSApp.execUnsafeLocalFunction(function () {
                    doc.documentElement.innerHTML = res;
                });
                var formhash = doc.querySelector("input[name=formhash]").value;
                var posttime = doc.querySelector("input[name=posttime]").value;
                var hash = doc.querySelector("[name='hash']").value;
                var ps = new Windows.Foundation.Collections.PropertySet();
                //console.log(typeof Windows.Foundation.Collections);
                //console.log(typeof Windows.Foundation.Collections.PropertySet);
                ps.insert("formhash", formhash);
                ps.insert("posttime", posttime);
                ps.insert("wysiwyg", "1");
                ps.insert("iconid", "14");
                ps.insert("subject", subject);
                ps.insert("message", message);
                ps.insert("tags", "1，2，3");
                ps.insert("attention_add", "1");
                ps.insert("usesig", "1");
                if (imageAttach) {
                    ps.insert("attachnew[" + imageAttach + "][description]:", "");
                }
                return httpClient.httpPost(postUrl + "?action=newthread&fid=" + fid + "&extra=&topicsubmit=yes", ps, "gb2312").then(function (res) {
                    return "success";
                });
            });
        }
        this.newPost = function (fid, tid, message, formhash, imageAttach,reply) {
            if (!formhash) formhash = "8eeca5a8";
            if (this.tailMessage) message += this.tailFormat.replace("%s", this.tailMessage);
            var ps = new Windows.Foundation.Collections.PropertySet();
            if (reply) {
                message = reply.noticetrimstr + message;
                ps.insert("noticeauthor", reply.noticeauthor);
                ps.insert("noticetrimstr", reply.noticetrimstr);
                ps.insert("noticeauthormsg", reply.noticeauthormsg);
            }
            ps.insert("formhash", formhash);
            ps.insert("subject", "");
            ps.insert("usesig", "1");
            ps.insert("message", message);
            if (imageAttach) {
                ps.insert("attachnew[" + imageAttach + "][description]:", "");
            }
            
            return httpClient.httpPost(postUrl + "?action=reply&fid=" + fid + "&tid=" + tid + "&replysubmit=yes&infloat=yes&handlekey=fastpost&inajax=1", ps, "gb2312").then(function (res) {
                if (res.indexOf("您的回复已经发布") != -1) {
                    return "success";
                } else {
                    return new DOMParser().parseFromString(res, "text/xml").getElementsByTagName("root")[0].textContent.replace(/<script[\s\S\n]*script>/g, "");
                }
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