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
			var c = strip($("textarea").val());
			$("#content-preview").show().html(marked(strip($("textarea").val())));
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
			text: strip(content),
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

	this.loadPosts = function(success) {

		app._posts.get(function(res) {
			//Store the posts in the app
			app.posts = res;
			$(".loading").remove();
			//Loop through the posts to draw them
			_.each(res, function(r) {
				app.drawPost(r);
			}, this);
			success();
		});

	};

	this.drawPost = function(post) {

		//making it one level deep to make underscore templates easier
		//to work with
		post.post = post;
		post.post.markedDownText = marked(post.post.text);
		//Get the user from the members array
		post.user = this.getUser(post.ownerId) || {};
		post.isEditable = post.ownerId === app.member.id;

		var template = _.template($("#post").html());
		var post_html = template(post);
		$("#content-placeholder").prepend(post_html);

	};

	this.editStatus = function() {

		var id = $(this).data("post");
		var post =_(app.posts).where({_id: id})[0];
		var el = $(".media[data-post='" + id + "'] .post-content");
		var editPostTemplate = _.template($("#edit_post").html());
		el.html(editPostTemplate({post: post.text}));


		//on edit
			//add an 'edited' class
		//on blur
			//if it hasn't changed, then kill the save
			//if it has changed, then do nothing
		//on save
			//save it
		//on cancel
			//revert it


	};

	this.deleteStatus = function() {

		var c = confirm("Are you sure you want to delete this post?");
		if(c) {
			//get the id
			var id = $(this).data("post");
			//delete the post
			$(".media[data-post='"+ id +"']").remove();
			//delete from the app
			app._posts.remove(id);

		}

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

		$("body")
			.on("click", ".js-edit-post", this.editStatus);

		$("body")
			.on("click", ".js-delete-post", this.deleteStatus);

		$("body")
			.on("click", ".js-logout", this.logout);
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

	var structure = _.template($("#page_structure").html()),
			body = _.template($("#page_body").html()),
			navigation = _.template($("#page_navigation").html()),
			fin;

	this.member = member;

	//Draw the page content
	$("#content").html(structure()).append(body());


	//Get the members
	app._members.get(function(res) {

		$("nav .content").append(navigation(app));

		//Store the members in the app
		app.members = res;
		//get the member who is just logged in
		app.member.name = _.find(app.members, function(m) {
			return m.id === app.member.id;
		}).name;

		//Attach event handlers
		app.attachEvents();

		app.loadPosts(function() {
			account.loadProfileImages(app.members);
		});


	});


};

//Draw the Login Form
App.prototype.login = function() {

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
				app.start(member);
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

				app.start();

			}, function(message) {

				alert(message || "Signup failed, sorry.");
				$("#signup-button").removeAttr("disabled");

			}
		)

		return false;

	});


}
