var handle_index_page = (req, res) => {
	res.render('index', { 
		title: 'Home',
		menu_id: 'home',
		user: req.user
	});
}

module.exports = {
	handle_index_page: handle_index_page,
};
