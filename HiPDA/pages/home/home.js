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
    WinJS.UI.Pages.define("/pages/home/home.html", {
        // 每当用户导航至此页面时都要调用此功能。它
        // 使用应用程序的数据填充页面元素。
        ready: function (element, options) {
            // TODO: 在此处初始化页面。
            var listView = element.querySelector(".groupeditemslist").winControl;
            if (options && options.forumId) {
                curForumId = options.forumId;
                if (options.pageNum) mCurPage = options.pageNum;
                else mCurPage = 1;
                threadList = new WinJS.Binding.List();
                listView.oniteminvoked = this._itemInvoked.bind(this);
                listView.itemDataSource = threadList.dataSource;
                HiPDA.getThreadsFromForum(curForumId, mCurPage).then(function (res) {
                    mTotalPage = res.totalPage;
                    initAppBar();
                    var info = document.getElementById("pageInfo");
                    info.innerHTML = "页码：" + mCurPage + "/" + mTotalPage;
                    res.normalthread.forEach(function (thread) {
                        threadList.push(thread);
                    });
                });
                document.getElementById("btnCancelNewThread").addEventListener("click", doClickCancelNewThread, false);
                document.getElementById("btnNewThread").addEventListener("click", doSubmitNewThread, false);
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
            console.log(args);
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
        HiPDA.newthread(curForumId, subject, message).then(function (res) {
            if (res == "success") {
                nav.navigate("/pages/home/home.html", { forumId: curForumId });
            }
        });
    }
})();
