// immediately hide teacher form when page loads
$(document).ready(function () {
	$('#teacher_form').hide();
});

function change_form_login() {
	$('#teacher_form').toggle();
	$('#student_form').toggle();
}
