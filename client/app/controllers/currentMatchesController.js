app.controller('currentMatchesController', ['httpFactory', '$state', '$scope', '$rootScope', function (httpFactory, $state, $scope, $rootScope) {
  $scope.refresh = function () {
    httpFactory.getMatches()
      .then(function (data) {
        $scope.matches = data;
      });
  };

  $scope.matchReady = function (userLevel, oppLevel) {
    return userLevel > oppLevel ?
      'Ready to Play!' :
      'Waiting for opponent';
  };

  $scope.goToMatch = function (matchId) {
    console.log(matchId);
    $rootScope.currentMatchId = matchId;
    $state.go('/game');
  };

  $scope.newMatch = function () {
    $state.go('/new-match');
  };

}]);
