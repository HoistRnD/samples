//Interactions

//*Show the buttons and grow the textarea when it's in focus and remove the placeholder textarea
//*on blur, if the placeholder text isn't there, then keep it the same
//*but if it's in it's default state, then revert it

//*Preview should render the comment in markdown

$(function() {

	window.app = new App();

	app.start();

    window.clicky;

    $(document).mousedown(function(e) {
        // The latest element clicked
        clicky = $(e.target);
    });

    // when 'clicky == null' on blur, we know it was not caused by a click
    // but maybe by pressing the tab key
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
			post: {
				text: marked(content),
				media: ""
			},
			user: {
				name: "Jamie Wilson",
				profile_url: "https://www.twitter.com/_jamiewilson",
				profile_image: "./img/profile.jpg"
			}
		};
		var template = _.template($("#post").html());
		var post_html = template(post);
		$("#content-placeholder").prepend(post_html);
		$("#comments-actions").hide();
		$("#preview").hide();

	};

};

App.prototype.start = function() {

	//attach event handlers
	$("textarea")
		.on("focus", this.focusTextarea)
		.on("blur", this.blurTextarea);

	$(".mode")
		.on("click", this.changeMode);

	$("#post-status")
		.on("click", this.postStatus);

}