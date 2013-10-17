(function () {
    "use strict";
    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var ui = WinJS.UI;
    var threadList;
    var nav = WinJS.Navigation;
    var curForumId;
    var mCurPage;
    var mTotalPage;
    var mImageAttach;
    WinJS.UI.Pages.define("/pages/home/home.html", {
        // 每当用户导航至此页面时都要调用此功能。它
        // 使用应用程序的数据填充页面元素。
        ready: function (element, options) {
            // TODO: 在此处初始化页面。
            var listView = element.querySelector(".groupeditemslist").winControl;
            if (options && options.forumId) {
                mImageAttach = null;
                curForumId = options.forumId;
                if (options.pageNum) mCurPage = options.pageNum;
                else mCurPage = 1;
                threadList = new WinJS.Binding.List();
                listView.oniteminvoked = this._itemInvoked.bind(this);
                listView.itemDataSource = threadList.dataSource;
                HiPDA.getThreadsFromForum(curForumId, mCurPage).then(function (res) {
                    mTotalPage = res.totalPage;
                    Options.uid = res.uid;
                    initAppBar();
                    var info = document.getElementById("pageInfo");
                    info.innerHTML = "页码：" + mCurPage + "/" + mTotalPage;
                    res.normalthread.forEach(function (thread) {
                        threadList.push(thread);
                    });
                });
                document.getElementById("btnCancelNewThread").addEventListener("click", doClickCancelNewThread, false);
                document.getElementById("btnNewThread").addEventListener("click", doSubmitNewThread, false);
                document.getElementById("btnUploadImage").addEventListener("click", doUploadFile, false);
                document.getElementById("txtMessage").addEventListener("keydown", doOnKeyDown, false);
            }
            this._initializeLayout(listView, appView.value);
        },
        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />
            var listView = element.querySelector(".groupeditemslist").winControl;
            this._initializeLayout(listView, viewState);
        },
        _initializeLayout: function (listView, viewState) {
            if (viewState === appViewState.snapped) {
                listView.layout = new ui.ListLayout();
            } else {
                listView.layout = new ui.ListLayout();
            }
        },
        _itemInvoked: function (args) {
            var item = threadList.getAt(args.detail.itemIndex);
            nav.navigate("/pages/thread/thread.html", { thread: item,forumId:curForumId });
        }
    });
    function initAppBar() {
        var nextBtn = document.getElementById("cmdNextPage");
        var preBtn = document.getElementById("cmdPrePage");
        var gotoBtn = document.getElementById("cmdGoto");
        document.getElementById("cmdNewThread").addEventListener("click", doClickNewThread, false);
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
        if (mCurPage  < mTotalPage) {
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
        if (mCurPage  < mTotalPage) {
            nav.navigate("/pages/home/home.html", { forumId: curForumId,pageNum: mCurPage + 1 });
        }
    }
    function doClickPre() {
        document.getElementById("appbar").winControl.hide();
        if (mCurPage > 1) {
            nav.navigate("/pages/home/home.html", { forumId: curForumId,pageNum: mCurPage - 1 });
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
            nav.navigate("/pages/home/home.html", { forumId: curForumId, pageNum: pageIndex });
        }
    }
    function doClickNewThread() {
        document.getElementById("flyoutNewThread").winControl.show(document.body);
        document.getElementById("appbar").winControl.hide();
    }
    function doClickCancelNewThread() {
        document.getElementById("flyoutNewThread").winControl.hide();
    }
    function doOnKeyDown(event) {
        if (event.ctrlKey && (event.keyCode == 13 || event.key == "Enter")) {
            doSubmitNewThread();
        }
    }
    function doSubmitNewThread() {
        document.getElementById("flyoutNewThread").winControl.hide();
        var subject = document.querySelector("input[name='subject']").value;
        var message = document.querySelector("textarea[name='message']").value;
        HiPDA.newThread(curForumId, subject, message, mImageAttach).then(function (res) {
            if (res == "success") {
                nav.navigate("/pages/home/home.html", { forumId: curForumId });
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
            document.getElementById("flyoutNewThread").winControl.show(document.body);
            if (file) {
                document.getElementById("imgProgress").style.display = "inline-block";
                Windows.Storage.FileIO.readBufferAsync(file).then(function (buffer) {
                    // Add code to process the text read from the file
                    HiPDA.uploadImage(Options.uid, "", file.name, file.contentType, buffer).then(function (res) {
                        document.getElementById("imgProgress").style.display = "none";
                        if (res != "error" && parseInt(res) > 0) {
                            mImageAttach = res;
                            var messageNode = document.querySelector("textarea[name='message']");
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
