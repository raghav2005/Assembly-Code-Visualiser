// immediately hide teacher form when page loads
$(document).ready(function () {
	$('#teacher_form').hide();
	$('#teacher_card').hide();
});

function change_form_login() {
	$('#teacher_form').toggle();
	$('#student_form').toggle();
	$('#teacher_card').toggle();
	$('#student_card').toggle();
}
