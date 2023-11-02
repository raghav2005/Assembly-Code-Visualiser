$(document).ready(function () {
	$('#completed_card_body').hide();
	$('#completed').hide();
	$('#missed_card_body').hide();
	$('#missed').hide();
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

function toggle_display_completed() {
	$('#completed_card_body').toggle();
	$('#completed').toggle();
	if ($('#display_completed_toggle').text() == "Show Challenges" || $('#display_completed_toggle').text() === "Show Challenges") {
		$('#display_completed_toggle').text("Hide Challenges");
	} else {
		$('#display_completed_toggle').text("Show Challenges");
	};
};

function toggle_display_missed() {
	$('#missed_card_body').toggle();
	$('#missed').toggle();
	if ($('#display_missed_toggle').text() == "Show Challenges" || $('#display_missed_toggle').text() === "Show Challenges") {
		$('#display_missed_toggle').text("Hide Challenges");
	} else {
		$('#display_missed_toggle').text("Show Challenges");
	};
};

