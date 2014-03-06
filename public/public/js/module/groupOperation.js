var groupOperation = function ($http) {

    var loadAllWidget = function (cb) {
        $http.get("/admin/api/group/widget")
            .success(function (data) {
                cb(data);
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
        loadAllWidget: loadAllWidget
    };
}