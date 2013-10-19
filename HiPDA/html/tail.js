(function () {
    function beforeHideHandler() {
        Options.tailMessage = document.querySelector("input[name='tail']").value;
    }
    beforeHideHandler.supportedForProcessing = true;
    function afterShowHandler() {
        document.querySelector("input[name='tail']").value = Options.tailMessage;
    }
    afterShowHandler.supportedForProcessing = true;
    WinJS.Namespace.define("SFTail", { afterShowHandler: afterShowHandler, beforeHideHandler: beforeHideHandler });
})();