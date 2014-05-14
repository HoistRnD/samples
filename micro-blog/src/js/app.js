var app, key;
$(function() {

	var settingsLocation = window.location.href.indexOf("localhost") !== -1 ? "./hoist.json" : "/settings";

	$.getJSON(settingsLocation, function(settings) {

		Hoist.apiKey(settings.apiKey);
		key = settings.apiKey;

		//Account Controller
		window.account = new AccountManager();

		//If logged in, start the app, or show the login screen
		Hoist.status(function(member) {
			app = new App(member);
		}, function() {
			account.drawLogin();
		});

	});

});

var App = function(member) {

	var self = this,
			structure = _.template($("#page_structure").html()),
			body = _.template($("#page_body").html()),
			navigation = _.template($("#page_navigation").html()),
			fin;

	this.member = member;

	//Draw the page content
	$("#content").html(structure()).append(body());

	//The Hoist "Data Manager" doesn't store the result of a collection
	//on get, so we have two separate objects to update
	this._posts = Hoist("posts");
	this.posts;

	this._members = Hoist("members");
	this.members;

	//Get the members
	this._members.get(function(res) {

		$("nav .content").append(navigation(self));

		//Store the members in the app
		self.members = res;

		//get the member who is just logged in
		self.member = _.find(self.members, function(m) {
			return m.id === self.member.id;
		});

		//Attach event handlers
		self.attachEvents();

		self.loadPosts(function() {
			//account.loadProfileImages(self.members);
			self.startPoll();
		});


	});

};

_.extend(App.prototype, {

	attachEvents: function() {
		//attach event handlers
		$("textarea")
			.on("focus", this.focusTextarea)
			.on("blur", this.blurTextarea);

		$("#post-status")
			.on("click", this.postStatus);

		$("body")
			.on("click", ".js-delete-post", this.deleteStatus);

		$("body")
			.on("click", ".js-logout", this.logout);
	},

	focusTextarea: function() {

		$("#comments-actions").show();
		$("#preview").show();
		if($("textarea").val() === "Write something here") {
			$("textarea").val('');
		}

	},
	blurTextarea: function(e) {

		if($("textarea").val() == '') { $("textarea").val('Write something here'); }
		if($(e.relatedTarget).attr("id") === "post-status") {

		} else {
			$("#comments-actions").hide();
			$("#preview").hide();
		}

	},
	postStatus: function() {

		var content = $("textarea").val();
		if(content == "") return;
		$("textarea").val("Write something here");

		var post = {
			text: strip(content),
			media: "",
			ownerId: app.member.id
		};

		Hoist("post").post(post);
		app.drawPost(post);

		//app._posts.post(post);

		$("#comments-actions").hide();
		$("#preview").hide();

	},

	logout: function() {
		Hoist.logout(function() {
			account.drawLogin();
		});
	},

	getUser: function(id) {

		var user = _.find(this.members, function(m) {
			return m.id === id;
		});
		return user;

	},

	loadPosts: function(success) {

		var self = this;
		this._posts.get(function(res) {
			//Store the posts in the app
			self.posts = res;
			$(".loading").remove();
			//Loop through the posts to draw them
			_.each(res, function(r) {
				self.drawPost(r);
			}, this);
			success();
		});

	},

	drawPost: function(post) {

		//making it one level deep to make underscore templates easier
		//to work with
		post.post = post;
		post.post.markedDownText = marked(post.post.text);
		//Get the user from the members array
		post.user = this.getUser(post.ownerId) || {};
		post.isEditable = post.ownerId === this.member.id;

		var template = _.template($("#post").html());
		var post_html = template(post);
		$("#content-placeholder").prepend(post_html);

	},

	deleteStatus: function() {

		var c = confirm("Are you sure you want to delete this post?");
		if(c) {
			//get the id
			var id = $(this).data("post");
			//delete the post
			$(".media[data-post='"+ id +"']").remove();
			//delete from the app
			app._posts.remove(id);
		}

	},
	//Poll for changes
	startPoll: function() {
		var self = this;
		setTimeout(app.poll, 10000);
	},
	poll: function() {

		app._posts.get({
			q: {
				"_createdDate" : { "$gt" : app.lastUpdated }
			}
		}, app.drawFromPoll);

	},
	drawFromPoll: function(posts) {

		app.startPoll();
		app.lastUpdated = new Date();
		_.each(posts, function(p) {
			app.posts.push(p);
			app.drawPost(p);
		});

	}
});


//Helpers
function strip(html)
{
	var tmp = document.createElement("DIV");
	tmp.innerHTML = html;
	return tmp.textContent || tmp.innerText || "";
}
