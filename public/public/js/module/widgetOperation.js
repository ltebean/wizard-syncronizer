var widgetOperation = function ($http) {
    //save the widget
    var commit = function (body, cb) {
        $http.post("/admin/api/widget/commit", body)
            .success(function (data) {
                cb(data);
            }).error(function (data) {
                showError(data);
            });
    }
    //load a widget
    var load = function (widgetName, cb) {
        $http.get("/admin/api/widget/" + widgetName)
            .success(function (data) {
                cb(data);
            }).error(function (data) {
                showError(data);
            });
    }

    var create=function(widgetExtInfo,cb){
        $http.post("/admin/api/widget/extInfo", widgetExtInfo)
            .success(function (data) {
                cb(data);
            }).error(function (data) {
                showError(data);
            });
    }

    var updateExtInfo=function(widgetExtInfo,cb){
        $http.post("/admin/api/widget/"+widgetExtInfo.name+"/extInfo", widgetExtInfo)
            .success(function (data) {
                cb(data);
            }).error(function (data) {
                showError(data);
            });
    }

    //render a widget
    var render = function (shopId, widget, mode, cb) {
        var widgetToRender={
            name:widget.name,
            layoutRule:widget.layoutRule,
            layoutName:widget.layoutName,
            parentWidgetName:widget.parentWidgetName,
            modes:widget.modes
        }
        var body ="shopId="+ shopId+"&widgetString="+encodeURIComponent(JSON.stringify(widgetToRender));
        $http({
            method: 'POST',
            url: "/admin/wizardPreviewAction.action",
            data: body,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (data) {
                cb(data)
            }).error(function (data) {
                showError(data);
            });
    }

    var loadHistory = function (widgetName, page, cb) {
        $http.get("/admin/api/widget/" + widgetName + "/history?page=" + (page || 0))
            .success(function (data) {
                cb(data);
            }).error(function (data) {
                showError(data);
            });
    }

    var sync = function (options,cb) {
        $http.post("/admin/ci/sync", options)
            .success(function (data) {
                cb && cb(data);
            }).error(function (data) {
                showError(data);
            });
    }

    var remove = function (name,cb) {
        $http.post("/admin/api/widget/"+name+"/delete")
            .success(function (data) {
                cb && cb(data);
            }).error(function (data) {
                showError(data);
            });
    }

    function showError(msg){
        Messenger().post({
            message: msg,
            type: 'error',
            showCloseButton: true
        });
    }

    return {
        commit: commit,
        load: load,
        create:create,
        updateExtInfo:updateExtInfo,
        render: render,
        loadHistory: loadHistory,
        sync:sync,
        remove: remove
    };
}