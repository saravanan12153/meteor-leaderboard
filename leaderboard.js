// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

function randomScore() {
  return Math.floor(Random.fraction() * 10) * 5;
}

if (Meteor.isClient) {
  Template.leaderboard.players = function () {
    var sortType = Session.get("sort_type");
    // return Players.find({}, {sort: {score: -1, name: 1}});
    if (sortType === "name") {
      return Players.find({}, {sort: {name: 1, score: -1}});
    } else {
      return Players.find({}, {sort: {score: -1, name: 1}});
    }
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
    'click .remove': function () {
      console.log("remove: " + this._id);
      Players.remove(this._id);
    }
  });

  Template.player.events({
    'click': function () {
      console.log(this._id);
      Session.set("selected_player", this._id);
    }
  });

  Template.actions.events({
    'click #toggle-sort' : function () {
      var sortType = Session.get("sort_type"),
        newSortType = (sortType === "name") ? "score" : "name";

      Session.set("sort_type", newSortType);
    },
    'click #reset' : function () {
      console.log("reset");
      Players.find().forEach(function(player) {
        console.log(player._id);
        Players.update(player._id, {
          $set: {
            score: randomScore()
          }
        });
      });
    }
  });

  Template.addPlayer.events({
    'click input[type=submit]': function(event) {
      var playerName = $("#newPlayerName").val();

      console.log("playerName = " + playerName);
      if (playerName.length > 0) {
        Players.insert({
          name: playerName,
          score: 0
        });
      }

      event.preventDefault();
    }
  })
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: randomScore()});
    }
  });
}
