// set active tab in the navbar automatically
$(document).ready(function () {
	var element = $('meta[name="active-menu"]').attr('content');
	$('#' + element).addClass('active');
});

// activate tooltips (the thing that shows up underneath the navbar user indicator)
$(document).ready(function () {
	$('[data-toggle="tooltip"]').tooltip();
});
