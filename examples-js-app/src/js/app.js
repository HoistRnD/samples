var app, account;

$(function() {

	var settingsLocation = window.location.href.indexOf("localhost") !== -1 ? "./hoist.json" : "/settings";

	$.getJSON(settingsLocation, function(settings) {

		Hoist.apiKey(settings.apiKey);

		account = new AccountManager();

		//If logged in, start the app, or show the login screen
		Hoist.status(function(member) {
			app = new App(member);
		}, function() {
			account.login();
		});

	});

});

var App = function() {

	//Load Modules
	this.module = new Module();

	//Store your own copy of the results to work with
	this._objType = Hoist("objecttype");
	this.objType;

	//Precompile Templates
	this.memberTemplate = _.template($("#template").html());

	//Save your member
	this.member = member;

	//Attach event handlers
	app.attachEvents();

	//Run application Logic
	this.posts = this.getPosts();

};

_.extend(App.prototype, {
	getPosts: function(options) {
		//run my get posts method
		return [];
	}
});

//Your Helpers
function strip(html)
{
	var tmp = document.createElement("DIV");
	tmp.innerHTML = html;
	return tmp.textContent || tmp.innerText || "";
}
