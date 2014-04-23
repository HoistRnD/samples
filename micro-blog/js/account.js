var Account = function() {


};

Account.prototype = {

  login: function(email, password, success) {

    Hoist.login({
      email: email,
      password: password
    }, function(member) {
      //Success
      app.start(member);
    }, function() {
      //error
      alert("Sorry, you're not allowed in here!");
    })

  },

  new: function(name, email, password, $profilePhoto, success) {

    var user = {
      name: name,
      email: email,
      password: password
    };
    if($profilePhoto.val()) {
      
      Hoist.file(user.email, $profilePhoto, function(success) {
          //sign them up
          Hoist.signup(user, function(member) {
            var m = {
              name: user.name,
              emailAddress: user.email,
              id: member.id
            };
            app._members.post(m, function() {
              app.start(member);
            }, function(err) {
              alert(err);
            });
          }, function(err) {
            alert(err);
          });
      });

    } else {
      alert("Sorry, you need a profile photo!");
    }

  }

};
