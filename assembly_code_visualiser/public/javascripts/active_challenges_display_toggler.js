$(document).ready(function () {
	$('#active_challenges_card_body').hide();
	$('#active_challenges').hide();
});

function toggle_display_challenges() {
	$('#active_challenges_card_body').toggle();
	$('#active_challenges').toggle();
	if ($('#display_challenges_toggle').text() == "Show Challenges" || $('#display_challenges_toggle').text() === "Show Challenges") {
		$('#display_challenges_toggle').text("Hide Challenges");
	} else {
		$('#display_challenges_toggle').text("Show Challenges");
	};
};

function toggle_assign_challenges() {
	$('#assign_challenges_card_body').toggle();
	$('#assign_challenge_form').toggle();
	if ($('#assign_challenges_toggle').text() == "Show Assign Challenges" || $('#assign_challenges_toggle').text() === "Show Assign Challenges") {
		$('#assign_challenges_toggle').text("Hide Assign Challenges");
	} else {
		$('#assign_challenges_toggle').text("Show Assign Challenges");
	};
};
