(function () {
    "use strict";
    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var ui = WinJS.UI;
    var threadList;
    var nav = WinJS.Navigation;
    WinJS.UI.Pages.define("/pages/home/home.html", {
        // 每当用户导航至此页面时都要调用此功能。它
        // 使用应用程序的数据填充页面元素。
        ready: function (element, options) {
            // TODO: 在此处初始化页面。
            var listView = element.querySelector(".groupeditemslist").winControl;
            if (options && options.forumId) {
                threadList = new WinJS.Binding.List();
                listView.oniteminvoked = this._itemInvoked.bind(this);
                listView.itemDataSource = threadList.dataSource;
                HiPDA.getThreadsFromForum(options.forumId).then(function (res) {
                    res.normalthread.forEach(function (thread) {
                        threadList.push(thread);
                    });
                });
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
            nav.navigate("/pages/thread/thread.html", { thread: item });
            console.log(args);
        }
    });
})();
