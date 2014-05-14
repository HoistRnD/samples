var AccountManager = function() {


};

AccountManager.prototype = {

  drawLogin: function() {

    //Load the login template
    $("#content").html(_.template($("#login").html())());

    $("form[name='login']").on("submit", function(evt) {

      //Kill the login button
      $("#login-button").attr("disabled", "disabled");

      evt.preventDefault();

      account.login(
        $("input[name='username']").val(),
        $("input[name='password']").val(),
        function(member) {
          app = new App(member);
        },
        function() {
          alert("Sorry, you can't come in here.");
          $("#login-button").removeAttr("disabled");
        }
      );

      return false;
    });

    $("form[name='signup']").on("submit", function(evt) {

      evt.preventDefault();

      //Kill the login button
      $("#signup-button").attr("disabled", "disabled");

      account.new(
        $("input[name='name']").val(),
        $("input[name='emailAddress']").val(),
        $("input[name='signupPassword']").val(),
        $("input[name='profilePhoto']"),
        function(member) {

          app = new App(member);

        }, function(message) {

          alert(message || "Signup failed, sorry.");
          $("#signup-button").removeAttr("disabled");

        }
      )

      return false;

    });


  },


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
          var members = Hoist("members").post(m, function() {
            app = new App(member);
          });
        });
      });

    } else {
      failure("Sorry, you need a profile photo!");
    }

  }
};
