$(document).ready(function () {
	$('#active_challenges_card_body').hide();
	$('#active_challenges').hide();
	$('#challenges_havent_been_assigned').hide();
	$('#students_have_submitted').hide();
	$('#students_have_submitted_table').hide();
	$('#students_yet_to').hide();
	$('#students_yet_to_table').hide();
	$('#students_missed').hide();
	$('#students_missed_table').hide();
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

function toggle_challenges_have_been_assigned() {
	$('#challenges_have_been_assigned').toggle();
	if ($('#display_challenges_have_been_toggle').text() == "Show Challenges" || $('#display_challenges_have_been_toggle').text() === "Show Challenges") {
		$('#display_challenges_have_been_toggle').text("Hide Challenges");
	} else {
		$('#display_challenges_have_been_toggle').text("Show Challenges");
	};
};

function toggle_challenges_havent_been_assigned() {
	$('#challenges_havent_been_assigned').toggle();
	if ($('#display_challenges_havent_been_toggle').text() == "Show Challenges" || $('#display_challenges_havent_been_toggle').text() === "Show Challenges") {
		$('#display_challenges_havent_been_toggle').text("Hide Challenges");
	} else {
		$('#display_challenges_havent_been_toggle').text("Show Challenges");
	};
};

function toggle_challenge_info() {
	$('#challenge_info').toggle();
	if ($('#display_challenge_info').text() == "Show Information" || $('#display_challenge_info').text() === "Show Information") {
		$('#display_challenge_info').text("Hide Information");
	} else {
		$('#display_challenge_info').text("Show Information");
	};
}

function toggle_students_have_submitted() {
	$('#students_have_submitted').toggle();
	$('#students_have_submitted_table').toggle();
	if ($('#display_students_have_submitted').text() == "Show Students" || $('#display_students_have_submitted').text() === "Show Students") {
		$('#display_students_have_submitted').text("Hide Students");
	} else {
		$('#display_students_have_submitted').text("Show Students");
	};
}

function toggle_students_yet_to() {
	$('#students_yet_to').toggle();
	$('#students_yet_to_table').toggle();
	if ($('#display_students_yet_to').text() == "Show Students" || $('#display_students_yet_to').text() === "Show Students") {
		$('#display_students_yet_to').text("Hide Students");
	} else {
		$('#display_students_yet_to').text("Show Students");
	};
}

function toggle_students_missed() {
	$('#students_missed').toggle();
	$('#students_missed_table').toggle();
	if ($('#display_students_missed').text() == "Show Students" || $('#display_students_missed').text() === "Show Students") {
		$('#display_students_missed').text("Hide Students");
	} else {
		$('#display_students_missed').text("Show Students");
	};
}

