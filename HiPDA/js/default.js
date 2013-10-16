// 有关“导航”模板的简介，请参阅以下文档:
// http://go.microsoft.com/fwlink/?LinkId=232506
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;
    var applicationData = Windows.Storage.ApplicationData.current;

    function initialize() {
        applicationData.addEventListener("datachanged", datachangeHandler);
    }

    function dataChangeHandler(eventArgs) {
        // TODO: Refresh your data
    }
    var roamingSettings = applicationData.roamingSettings;
    var roamingFolder = applicationData.roamingFolder;
    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: 此应用程序刚刚启动。在此处初始化
                //您的应用程序。
                console.log("onstart");
            } else {
                // TODO: 此应用程序已从挂起状态重新激活。
                // 在此处恢复应用程序状态。
                console.log("onre");
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: 即将挂起此应用程序。在此处保存
        //需要持续挂起的任何状态。如果您需要
        //在应用程序挂起之前完成异步操作
        //，请调用 args.setPromise()。
        app.sessionState.history = nav.history;
        console.log("oncheckpoint");
    };
    function onLogin() {
        var password = document.getElementById("txtPassword").value;
        var username = document.getElementById("txtUsername").value;
        login(username, password, true);
    }
    function login(username,password,newLogin) {
        HiPDA.login(username, password).then(function (res) {
            if (res != "success") {
                var msg = new Windows.UI.Popups.MessageDialog(res);
                msg.showAsync();
                return;
            }
            if (newLogin) {
                roamingSettings.values["password"] = password;
                roamingSettings.values["username"] = username;
            }
            document.getElementById("loginDiv").style.display = "none";
            nav.history = {};
            nav.navigate(Application.navigator.home, { forumId: HiPDA.defaultForumId });
            HiPDA.getForums().then(function (res) {
                var navContainer = document.getElementById("navContainer");
                res.group.forEach(function (group) {
                    var groupDiv = document.createElement("div");
                    groupDiv.className = "navGroup";
                    groupDiv.innerHTML = group.title;
                    navContainer.appendChild(groupDiv);
                    group.forum.forEach(function (forum) {
                        var forumDiv = document.createElement("div");
                        if (forum.id == HiPDA.defaultForumId) {
                            forumDiv.className = "navItem selectedItem";
                        }
                        else {
                            forumDiv.className = "navItem";
                        }
                        forumDiv.innerHTML = forum.title;
                        forumDiv.forumId = forum.id;
                        forumDiv.addEventListener("click", onForumClick, false);
                        navContainer.appendChild(forumDiv);
                    });
                });
            });
        });
    }
    document.addEventListener("DOMContentLoaded", function () {
        var password = roamingSettings.values["password"];
        var username = roamingSettings.values["username"];
        if (password && username) {
            login(username, password, false);
        } else {
            document.getElementById("btnLogin").addEventListener("click", onLogin, false);
        }
        document.getElementById("contenthost").style.width = (document.body.clientWidth - 220) + "px";
    }, false);
    function onForumClick(event) {
        var old = document.getElementById("navContainer").querySelector(".selectedItem");
        if (old) old.classList.remove("selectedItem");
        this.classList.add("selectedItem");
        nav.history = {};
        nav.navigate("/pages/home/home.html", { forumId: this.forumId });
    }
    app.start();
})();
