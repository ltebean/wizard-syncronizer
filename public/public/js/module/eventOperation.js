var eventOperation = function ($http) {

    var loadHistory = function (day, cb) {
        $http.get("/admin/api/event/widget?day=" + (day || 0))
            .success(function (data) {
                cb(data);
            }).error(function (data) {
                alert("server error");
            });
    }

    return {
        loadHistory: loadHistory
    };
}