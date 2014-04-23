$(function() {

	var settingsLocation = window.location.href.indexOf("localhost") !== -1 ? "./hoist.json" : "/settings";

	$.getJSON(settingsLocation, function(settings) {

		Hoist.apiKey(settings.apiKey);

		//Account Controller
		window.account = new Account();
		//Application
		window.app = new App();

		//If logged in, start the app, or show the login screen
		Hoist.status(function(member) {
			app.start(member);
		}, function() {
			app.login();
		});

	});

	//Blur element tracking

    window.clicky;

    $(document).mousedown(function(e) {
        clicky = $(e.target);
    });

    $(document).mouseup(function(e) {
        clicky = null;
    });

});

var App = function() {

	this.focusTextarea = function() {

		$("#comments-actions").show();
		$("#preview").show();
		if($("textarea").val() === "Write something here") {
			$("textarea").val('');
		}

	};
	this.blurTextarea = function(e) {

		if($("textarea").val() == '') { $("textarea").val('Write something here'); }
		if($(e.relatedTarget).attr("id") === "post-status" || $(clicky).hasClass("mode")) {

		} else {
			$("#comments-actions").hide();
			$("#preview").hide();
		}

	};
	this.changeMode = function(e) {

		if($(e.target).attr("id") === "preview") {
			$(".mode").removeClass("active");
			$("#preview").addClass("active");
			$("textarea").hide();
			$("#content-preview").show().html(marked($("textarea").val()));
		} else {
			$(".mode").removeClass("active");
			$("#write").addClass("active");
			$("textarea").show();
			$("#content-preview").hide().html('');
		}

	};
	this.postStatus = function() {

		var content = $("textarea").val();
		if(content == "") return;
		$("textarea").val("Write something here");

		var post = {
			text: marked(content),
			media: "",
			ownerId: app.member.id
		};

		app._posts.post(post);
		app.drawPost(post);

		$("#comments-actions").hide();
		$("#preview").hide();

	};

	this.logout = function() {
		Hoist.logout(function() {
			app.login();
		});
	};

	this.getUser = function(id) {

		var user = _.find(this.members, function(m) {
			return m.id === id;
		});
		return user;

	};

	this.drawPost = function(post) {

		//making it one level deep to make underscore templates easier
		//to work with
		post.post = post;
		//Get the user from the members array
		post.user = this.getUser(post.ownerId) || {};

		var template = _.template($("#post").html());
		var post_html = template(post);
		$("#content-placeholder").prepend(post_html);

	};

	this.attachEvents = function() {
		//attach event handlers
		$("textarea")
			.on("focus", this.focusTextarea)
			.on("blur", this.blurTextarea);

		$(".mode")
			.on("click", this.changeMode);

		$("#post-status")
			.on("click", this.postStatus);

		$(".js-logout")
			.on("click", this.logout);
	};

	//The Hoist "Data Manager" doesn't store the result of a collection
	//on get, so we have two separate objects to update
	this._posts = Hoist("posts");
	this.posts;

	this._members = Hoist("members");
	this.members;

};

//Start Running the Application
App.prototype.start = function(member) {

	$("#content").html("<h1>Loading</h1>");

	this.member = member;

	//draw the content on the page
	var nav = _.template($("#page_navigation").html());
	var body = _.template($("#page_body").html());

	//Get the members
	app._members.get(function(res) {
		//Store the members in the app
		app.members = res;
		//get the member who is just logged in
		app.member.name = _.find(app.members, function(m) {
			return m.id === app.member.id;
		}).name;
		$("#content").html(nav(app)).append(body());
		app.attachEvents();
		var c = 0;
		var fin = function() {
			c--;
			if(c===0) {
				//Get the posts
				app._posts.get(function(res) {
					//Store the posts in the app
					app.posts = res;
					//Loop through the posts to draw them
					_.each(res, function(r) {
						app.drawPost(r);
					}, this);
				});
			}
		};
		//load the profile images
		_.each(app.members, function(m) {
			if(m.emailAddress) {
				c++;
				Hoist.file(m.emailAddress, function(blob) {
						//convert blob to an image url

					   var reader = new FileReader;

					   reader.onload = function() {
					     var blobAsDataUrl = reader.result;
					     m.profile_image = blobAsDataUrl;
							fin();
					   };

					   reader.readAsDataURL(blob);

				}, fin);
			}
		});
	});


};

//Draw the Login Form
App.prototype.login = function() {

	//Load the login template
	$("#content").html(_.template($("#login").html())());

	$("form[name='login']").on("submit", function(evt) {
		evt.preventDefault();

		account.login(
			$("input[name='username']").val(),
			$("input[name='password']").val(),
			function(member) {
				app.start(member);
			}
		);

		return false;
	});

	$("form[name='signup']").on("submit", function(evt) {

		evt.preventDefault();

		account.new(
			$("input[name='name']").val(),
			$("input[name='emailAddress']").val(),
			$("input[name='signupPassword']").val(),
			$("input[name='profilePhoto']"),
			function(member) {
				app.start();
			}
		)

		return false;

	});


}
