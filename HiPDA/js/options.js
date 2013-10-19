(function (window) {
    "use strict";
    var applicationData = Windows.Storage.ApplicationData.current;
    var roamingSettings = applicationData.roamingSettings;
    var roamingFolder = applicationData.roamingFolder;
    window.Options = {
        isLogin: false,
        set tailMessage(value) {
            HiPDA.tailMessage = value;
            roamingSettings.values["tailMessage"] = value;
        },
        get tailMessage() {
            return HiPDA.tailMessage;
        },
        uid:null
    };
})(window);