app.factory('AuthFactory', ['$rootScope', 'httpFactory', function ($rootScope, httpFactory) {
  var authFact = {};

  authFact.login = function (user) {
    return httpFactory.loginUser(user)
      .then(function (res) {
        if(res.status === 200){
          $rootScope.user = $rootScope.user || {};
          $rootScope.user.id = res.headers('userId');
        }
        return res;
      });
  };

  authFact.signup = function (user) {
    return httpFactory.signupUser(user)
      .then(function (res) {
        if(res.status === 201){
          $rootScope.user = $rootScope.user || {};
          $rootScope.user.id = res.headers('userId');
        }
        return res;
      });
  };

  $rootScope.logout = authFact.logout = function () {
    return httpFactory.logout().then(function (res) {
      $rootScope.user = {};
      return res;
    });
  };

  authFact.isAuthenticated = function (done) {
    return httpFactory.getUser()
      .then(function (res) {
        if(res.headers('userId')){
          done(true);
        } else {
          done(false);
        }
      });
  };

  return authFact;

}]);
