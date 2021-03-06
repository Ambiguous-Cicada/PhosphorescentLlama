var Match = require('../models/matchModel.js');

var matchController = {};

matchController.getAllMatches = function(req, res) {
  var userId = req.session.passport.user;
  Match.find().populate('users.id')
    .exec(function(err, matches) {
    if(err){
      res.status(404).send(err);
    } else {
      matches = matches.filter(function (match) {
        if(!match.open){
          return false;
        }
        for (var i = 0; i < match.users.length; i++) {
          if(match.users[i].id._id.toString() === userId){
            return true;
          }
        }
        return false;
      }).map(function (match) {
        var result = {};
        result._id = match._id;
        for (var i = 0; i < match.users.length; i++) {
          if (match.users[i].id._id.toString() !== userId){
            result.opponent = match.users[i].id;
          } else {
            result.user = match.users[i].id;
          }
        }
        return result;
      });
      res.status(200).send(matches);
    }
  });
};

matchController.getMatchById = function(req, res) {
  Match.findById(req.params.id).populate('users.id').exec( function(err, match) {
    if(err){
      res.status(404).send(err);
    } else {
      res.status(200).send(match);
    }
  });
};

matchController.createMatch = function(req, res) {
  console.log(req.session.passport.user);
  console.log(req.body.otherId);
  Match.create({
    open: true,
    users: [
    {
      id: req.session.passport.user,
      levelScore: 100,
      totalScore: 0,
      currentLevel: 1,
      plays: 0,
      fails: 0,
      won: false
    },
    {
      id: req.body.otherId,
      levelScore: 100,
      totalScore: 0,
      currentLevel: 1,
      plays: 0,
      fails: 0,
      won: false
    }]
  }).then(function (match) {
    res.status(201).send(match);
  }, function (err) {
    res.status(500).send(err);
  });
};

matchController.updater = function(matchObject, req, callback) {
  for (var i = 0; i < matchObject.users.length; i++) {
    if (matchObject.users[i].id._id.toString() === req.session.passport.user){
      matchObject.users[i].plays += req.body.play;
      matchObject.users[i].fails += req.body.fail;
      matchObject.users[i].levelScore -= (req.body.play * 5 + req.body.fail * 10);

      if(matchObject.users[i].currentLevel !== req.body.currentLevel) {
        console.log('got in here');
        matchObject.users[i].totalScore += matchObject.users[i].levelScore;
        matchObject.users[i].currentLevel = req.body.currentLevel;
        matchObject.users[i].levelScore = 100 + req.body.currentLevel * 20;
      }

    } else {
      matchObject.users[i].won = req.body.forfeit;
    }
  }
  matchObject.open = !req.body.forfeit;
  callback(matchObject);
};

matchController.updateMatch = function(req, res) {
  Match.findById(req.params.id).populate("users.id").exec(function(err, match) {
    if(err){
      res.status(404).send(err);
    } else {
      match = matchController.updater(match, req, function (match) {
        match.save(function(err, match) {
          if (err) {
            res.status(404).send(err);
          } else {
            res.status(202).send(match);
          }
        });
      });
    }
  });
};

module.exports = matchController;
