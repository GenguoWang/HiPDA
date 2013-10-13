(function () {
    "use strict";
    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var ui = WinJS.UI;
    var dataList = new WinJS.Binding.List();
    var nav = WinJS.Navigation;
    WinJS.Namespace.define("Data", { dataList: dataList });
    WinJS.UI.Pages.define("/pages/home/home.html", {
        // 每当用户导航至此页面时都要调用此功能。它
        // 使用应用程序的数据填充页面元素。
        ready: function (element, options) {
            // TODO: 在此处初始化页面。
            var listView = element.querySelector(".groupeditemslist").winControl;
            listView.oniteminvoked = this._itemInvoked.bind(this);
            HiPDA.login("ciceblue", "317519").then(function (res) {
                HiPDA.getThreadsFromForum(2, 1).then(function (res) {
                    res.normalthread.forEach(function (thread) {
                        dataList.push(thread);
                    });
                });
            });
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
                listView.layout = new ui.GridLayout();
            }
        },
        _itemInvoked: function (args) {
            var item = dataList.getAt(args.detail.itemIndex);
            nav.navigate("/pages/thread/thread.html", { thread: item });
            console.log(args);
        }
    });
})();
