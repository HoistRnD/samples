$(function() {

	var settingsLocation = window.location.href.indexOf("localhost") !== -1 ? "./hoist.json" : "/settings";

	$.getJSON(settingsLocation, function(settings) {

		Hoist.apiKey(settings.apiKey);

		//Application
		window.app = new App();

		//If logged in, start the app, or show the login screen
		Hoist.status(function(member) {
			app.start(member);
		}, function() {
			app.login();
		});

	});

});

var App = function() {

	this.logout = function() {
		Hoist.logout(function() {
			app.login();
		});
	};

	//Methods
	this.methodName = function() {
		console.log("Running an application Method");
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

//Helpers
function strip(html)
{
	var tmp = document.createElement("DIV");
	tmp.innerHTML = html;
	return tmp.textContent || tmp.innerText || "";
}
