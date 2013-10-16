// 有关“页面控制”模板的简介，请参阅以下文档:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var ui = WinJS.UI;
    var postList;
    var nav = WinJS.Navigation;
    var curThread;
    var curForumId;
    var mCurPage;
    var mTotalPage;
    WinJS.UI.Pages.define("/pages/thread/thread.html", {
        // 每当用户导航至此页面时都要调用此功能。它
        // 使用应用程序的数据填充页面元素。
        ready: function (element, options) {
            // TODO: 在此处初始化页面。
            var tmp = element.querySelector("#postTemplate").winControl;
            var container = element.querySelector("#postList");
            if (options && options.thread && options.forumId) {
                curThread = options.thread;
                curForumId = options.forumId;
                if (options.pageNum) mCurPage = options.pageNum;
                else mCurPage = 1;
                postList = new WinJS.Binding.List();
                HiPDA.getPostsFromThread(options.thread.id).then(function (res) {
                    curThread.formhash = res.formhash;
                    mTotalPage = res.totalPage;
                    var info = document.getElementById("pageInfo");
                    info.innerHTML = "页码：" + mCurPage + "/" + mTotalPage;
                    res.post.forEach(function (post, index) {
                        if (index == 0) {
                            post.subject = curThread.subject;
                        } else {
                            post.subject = "";
                        }
                        tmp.render(post).then(function (div) {
                            container.appendChild(div);
                        });
                    });
                });
                document.getElementById("cmdNewPost").addEventListener("click", doClickNewPost, false);
                document.getElementById("btnCancelNewPost").addEventListener("click", doClickCancelNewPost, false);
                document.getElementById("btnNewPost").addEventListener("click", doSubmitNewPost, false);
                document.getElementById("txtPostMessage").addEventListener("keydown", doOnKeyDown, false);
            }
        },

        unload: function () {
            // TODO: 响应导航到其他页。
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: 响应 viewState 的更改。
        }
    });
    function doClickNewPost() {
        document.getElementById("flyoutNewPost").winControl.show(document.body);
        document.getElementById("appbar").winControl.hide();
    }
    function doClickCancelNewPost() {
        document.getElementById("flyoutNewPost").winControl.hide();
    }
    function doOnKeyDown(event) {
        if (event.ctrlKey && (event.keyCode == 13 || event.key == "Enter")) {
            doSubmitNewPost();
        }
    }
    function doSubmitNewPost() {
        document.getElementById("flyoutNewPost").winControl.hide();
        var message = document.querySelector("textarea[name='postmessage']").value;
        HiPDA.newPost(curForumId, curThread.id, message, curThread.formhash).then(function (res) {
            if (res == "success") {
                nav.navigate("/pages/thread/thread.html", { thread: curThread, forumId: curForumId });
            } else{
                var msg = new Windows.UI.Popups.MessageDialog(res);
                msg.showAsync();
                return;
            }
        });
    }
})();
