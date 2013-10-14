// 有关“页面控制”模板的简介，请参阅以下文档:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var ui = WinJS.UI;
    var postList;
    var nav = WinJS.Navigation;
    WinJS.UI.Pages.define("/pages/thread/thread.html", {
        // 每当用户导航至此页面时都要调用此功能。它
        // 使用应用程序的数据填充页面元素。
        ready: function (element, options) {
            // TODO: 在此处初始化页面。
            var listView = element.querySelector(".postlist").winControl;
            if (options && options.thread) {
                postList = new WinJS.Binding.List();
                listView.itemDataSource = postList.dataSource;
                HiPDA.getPostsFromThread(options.thread.id).then(function (res) {
                    res.post.forEach(function (post) {
                        postList.push(post);
                    });
                });
            }
            this._initializeLayout(listView, appView.value);
        },

        unload: function () {
            // TODO: 响应导航到其他页。
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: 响应 viewState 的更改。
        },
        _initializeLayout: function (listView, viewState) {
            if (viewState === appViewState.snapped) {
                listView.layout = new ui.ListLayout();
            } else {
                listView.layout = new ui.ListLayout();
            }
        }
    });
})();
