var Account = function() {


};

Account.prototype = {

  login: function(email, password, success, failure) {

    Hoist.login({
      email: email,
      password: password
    }, success, failure);

  },

  new: function(name, email, password, $profilePhoto, success, failure) {

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
              console.log(err);
            });
          }, function(err) {
            console.log(err);
          });
      });

    } else {
      failure("Sorry, you need a profile photo!");
    }

  },

  loadProfileImages: function() {

    ///Loads the images in order from top to bottom,
    ///If there is an image in memory, use that
    ///Will be replaced when we're able to store images against
    ///a user.

    var profile = $("a.profile:not(.loaded)");

    if(profile.length > 0) {

      var $el = $(profile[0]),
          id = $el.data('profile'),
          member = _(app.members).where({id: id})[0],
          image = _.template('<img src="<%= profile_image %>" />'),
          _this = this;

      if(member.profile_image) {

        $el.append(image(member)).addClass('loaded');
        _this.loadProfileImages();

      } else {

        Hoist.file(member.emailAddress, function(blob) {

            member.profile_image = URL.createObjectURL(blob);
            $el.append(image(member)).addClass("loaded");
            _this.loadProfileImages();

        });

      }

    }

  }

};
