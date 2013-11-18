// 有关“页面控制”模板的简介，请参阅以下文档:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var ui = WinJS.UI;
    var nav = WinJS.Navigation;
    var curThread;
    var curForumId;
    var mCurPage;
    var mTotalPage;
    var mImageAttach;
    var mQuote;
    var mReply;
    var mCurPosts;
    WinJS.UI.Pages.define("/pages/thread/thread.html", {
        // 每当用户导航至此页面时都要调用此功能。它
        // 使用应用程序的数据填充页面元素。
        ready: function (element, options) {
            // TODO: 在此处初始化页面。
            var tmp = element.querySelector("#postTemplate").winControl;
            var container = element.querySelector("#postList");
            if (options && options.thread && options.forumId) {
                mImageAttach = null;
                mQuote = null;
                mReply = null;
                mCurPosts = null;
                curThread = options.thread;
                curForumId = options.forumId;
                if (options.pageNum) mCurPage = options.pageNum;
                else mCurPage = 1;
                HiPDA.getPostsFromThread(options.thread.id, mCurPage).then(function (res) {
                    curThread.formhash = res.formhash;
                    Options.uid = res.uid;
                    mTotalPage = res.totalPage;
                    mCurPosts = res.post;
                    initAppBar();
                    var info = document.getElementById("pageInfo");
                    info.innerHTML = "页码：" + mCurPage + "/" + mTotalPage;
                    res.post.forEach(function (post, index) {
                        if (index == 0) {
                            post.subject = curThread.subject;
                        } else {
                            post.subject = "";
                        }
                        tmp.render(post).then(function (div) {
                            div.querySelector("button.quote").addEventListener("click", onQuote, false);
                            div.querySelector("button.reply").addEventListener("click", onReply, false);
                            container.appendChild(div);
                        });
                    });
                });
                document.getElementById("cmdNewPost").addEventListener("click", doClickNewPost, false);
                document.getElementById("btnCancelNewPost").addEventListener("click", doClickCancelNewPost, false);
                document.getElementById("btnUploadImage").addEventListener("click", doUploadFile, false);
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
    function onQuote() {
        HiPDA.getQuote(curThread.id, this.postId).then(function (res) {
            console.log(res);
            mQuote = res;
            doClickNewPost();
        });
    }
    function onReply() {
        var post = mCurPosts[this.index];
        HiPDA.getReply(curThread.id, post.id).then(function (res) {
            console.log(res);
            mReply = {
                noticeauthor : "r|"+post.uid+"|[i]"+post.author+"[/i]",
                noticetrimstr : res,
                noticeauthormsg : post.message
            }
            doClickNewPost();
        });
    }
    function initAppBar() {
        var nextBtn = document.getElementById("cmdNextPage");
        var preBtn = document.getElementById("cmdPrePage");
        var gotoBtn = document.getElementById("cmdGoto");
        document.getElementById("btnNewPost").addEventListener("click", doSubmitNewPost, false);
        document.getElementById("pageInfo").addEventListener("click", function () { document.getElementById("appbar").winControl.show(); }, false);
        nextBtn.addEventListener("click", doClickNext, false);
        preBtn.addEventListener("click", doClickPre, false);
        gotoBtn.addEventListener("click", doClickGoto, false);
        document.getElementById("btnGoto").addEventListener("click", doGoto, false);
        updateAppBar();
    }
    function updateAppBar() {
        var nextBtn = document.getElementById("cmdNextPage");
        var preBtn = document.getElementById("cmdPrePage");
        var gotoBtn = document.getElementById("cmdGoto");
        if (mCurPage < mTotalPage) {
            nextBtn.removeAttribute("disabled");
        }
        else {
            nextBtn.setAttribute("disabled", "disabled");
        }
        if (mCurPage > 1) {
            preBtn.removeAttribute("disabled");
        }
        else {
            preBtn.setAttribute("disabled", "disabled");
        }
        if (mTotalPage > 1) {
            gotoBtn.removeAttribute("disabled");
        }
        else {
            gotoBtn.setAttribute("disabled", "disabled");
        }
    }
    function doClickNext() {
        document.getElementById("appbar").winControl.hide();
        if (mCurPage < mTotalPage) {
            nav.navigate("/pages/thread/thread.html", { thread: curThread, pageNum: mCurPage + 1, forumId: curForumId });
        }
    }
    function doClickPre() {
        document.getElementById("appbar").winControl.hide();
        if (mCurPage > 1) {
            nav.navigate("/pages/thread/thread.html", { thread: curThread, pageNum: mCurPage - 1, forumId: curForumId });
        }
    }
    function doClickGoto() {
        var gotoBtn = document.getElementById("cmdGoto");
        document.getElementById("gotoFlyout").winControl.show(gotoBtn, "top");
    }
    function doGoto() {
        document.getElementById("appbar").winControl.hide();
        var pageIndex = document.getElementById("txtGoto").value;
        pageIndex = parseInt(pageIndex);
        if (pageIndex > 0 && pageIndex <= mTotalPage) {
            nav.navigate("/pages/thread/thread.html", { thread: curThread, pageNum: pageIndex, forumId: curForumId });
        }
    }
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
        if (mQuote) {
            message = mQuote + message;
        }
        
        HiPDA.newPost(curForumId, curThread.id, message, curThread.formhash,mImageAttach,mReply).then(function (res) {
            if (res == "success") {
                nav.navigate("/pages/thread/thread.html", { thread: curThread, forumId: curForumId });
            } else{
                var msg = new Windows.UI.Popups.MessageDialog(res);
                msg.showAsync();
                return;
            }
        });
    }
    function doUploadFile() {
        // Verify that we are currently not snapped, or that we can unsnap to open the picker
        var currentState = Windows.UI.ViewManagement.ApplicationView.value;
        if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
            !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
            // Fail silently if we can't unsnap
            return;
        }

        // Create the picker object and set options
        var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
        openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
        openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
        // Users expect to have a filtered view of their folders depending on the scenario.
        // For example, when choosing a documents folder, restrict the filetypes to documents for your application.
        openPicker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg"]);

        // Open the picker for the user to pick a file
        openPicker.pickSingleFileAsync().then(function (file) {
            document.getElementById("flyoutNewPost").winControl.show(document.body);
            if (file) {
                document.getElementById("imgProgress").style.display = "inline-block";
                Windows.Storage.FileIO.readBufferAsync(file).then(function (buffer) {
                    // Add code to process the text read from the file
                    HiPDA.uploadImage(Options.uid, "", file.name, file.contentType, buffer).then(function (res) {
                        document.getElementById("imgProgress").style.display = "none";
                        if (res != "error" && parseInt(res) > 0) {
                            mImageAttach = res;
                            var messageNode = document.querySelector("textarea[name='postmessage']");
                            messageNode.value += "\n[attachimg]" + res + "[/attachimg]";
                        }
                        else {
                            var msg = new Windows.UI.Popups.MessageDialog("上传图片出错");
                            msg.showAsync();
                        }
                    });
                });
            } else {
                // The picker was dismissed with no selected file
                WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
            }
        });

    }
})();
