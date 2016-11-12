var PokedexSearchPanel = Panels.Panel.extend({
	minWidth: 639,
	maxWidth: 639,
	sidebarWidth: 280,
	search: null,
	events: {
		'keyup input.searchbox': 'updateSearch',
		'change input.searchbox': 'updateSearch',
		'search input.searchbox': 'updateSearch',
		'submit': 'submit',
		'keydown': 'keydown',
		'click': 'click',
		'click .result a': 'clickResult',
		'mouseover .result a': 'hoverlink'
	},
	activeLink: null,
	initialize: function () {
		var fragment = this.fragment;
		var questionIndex = fragment.indexOf('?');
		if (fragment === 'moves') fragment = 'moves/';
		if (fragment === 'pokemon') fragment = 'pokemon/';
		if (questionIndex >= 0) fragment = fragment.slice(0, questionIndex);
		var buf = '<div class="pfx-body"><form class="pokedex">';
		buf += '<h1><a href="/">Pok&eacute;dex</a></h1>';
		buf += '<ul class="tabbar centered" style="margin-bottom: 18px"><li><button class="button nav-first' + (fragment === '' ? ' cur' : '') + '" value="">Search</button></li>';
		buf += '<li><button class="button' + (fragment === 'pokemon/' ? ' cur' : '') + '" value="pokemon/">Pok&eacute;mon</button></li>';
		buf += '<li><button class="button nav-last' + (fragment === 'moves/' ? ' cur' : '') + '" value="moves/">Moves</button></li></ul>';
		buf += '<div class="searchboxwrapper"><input class="textbox searchbox" type="search" name="q" value="' + Tools.escapeHTML(this.$('.searchbox').val() || '') + '" autocomplete="off" autofocus placeholder="Search Pok&eacute;mon, moves, abilities, items, types, or more" /></div>';
		if (fragment === '') {
			buf += '<p class="buttonbar"><button class="button"><strong>Pok&eacute;dex Search</strong></button> <button name="lucky" class="button">I\'m Feeling Lucky</button></p>';
		}
		buf += '</form>';
		buf += '<div class="results"></div></div>';
		this.$el.html(buf);
		var $searchbox = this.$('.searchbox');
		var results = this.$('.results');
		if (results.length) {
			var search = this.search = new BattleSearch(results, this.$el);
			this.$el.on('scroll', function () {
				search.updateScroll();
			});
			if (fragment === 'pokemon/') {
				search.qType = 'pokemon';
				$searchbox.attr('placeholder', 'Search pokemon OR filter by type, move, ability, egg group');
				this.$('.buttonbar').remove();
			} else if (fragment === 'moves/') {
				search.qType = 'move';
				$searchbox.attr('placeholder', 'Search moves OR filter by type, category, pokemon');
				this.$('.buttonbar').remove();
			}
		} else {
			this.search = null;
		}
		$searchbox.focus();
		this.find($searchbox.val());
		this.checkExactMatch();
	},
	updateSearch: function(e) {
		this.find(e.currentTarget.value);
	},
	submit: function(e) {
		e.preventDefault();
		this.$('.searchbox').attr('placeholder', 'Type in: Pokemon, move, item, ability...').focus();
	},
	keydown: function(e) {
		switch (e.keyCode) {
		case 13: // enter
			e.preventDefault();
			e.stopPropagation();
			if (this.search.addFilter(this.activeLink)) {
				this.$('.searchbox').val('');
				this.find('');
				return;
			}
			if (this.activeLink) {
				this.app.go(this.activeLink.pathname.substr(1), this, false, $(this.activeLink));
			} else if (!this.$('.searchbox').val()) {
				this.app.slicePanel(this);
			}
			break;
		case 188: // comma
			if (this.search.addFilter(this.activeLink)) {
				e.preventDefault();
				e.stopPropagation();
				this.$('.searchbox').val('');
				this.find('');
				return;
			}
			break;
		case 38: // up
			e.preventDefault();
			e.stopPropagation();
			var $link = $(this.activeLink).parent().prev();
			while ($link[0] && $link[0].firstChild.tagName !== 'A') $link = $link.prev();
			if ($link[0] && $link.children()[0]) {
				$(this.activeLink).removeClass('active');
				this.activeLink = $link.children()[0];
				$(this.activeLink).addClass('active');
			}
			break;
		case 40: // down
			e.preventDefault();
			e.stopPropagation();
			var $link = $(this.activeLink).parent().next();
			while ($link[0] && $link[0].firstChild.tagName !== 'A') $link = $link.next();
			if ($link[0] && $link.children()[0]) {
				$(this.activeLink).removeClass('active');
				this.activeLink = $link.children()[0];
				$(this.activeLink).addClass('active');
			}
			break;
		case 27: // esc
		case 8: // backspace
			if (!this.$('.searchbox').val() && this.search.removeFilter()) {
				this.find('');
				return;
			}
			if (!this.$('.searchbox').val() && this.app.panels.length > 1) {
				e.preventDefault();
				e.stopPropagation();
				this.app.slicePanel(this);
			}
			break;
		}
	},
	click: function(e) {
		if (e.target.tagName === 'BUTTON' && $(e.target).closest('.tabbar').length) {
			e.preventDefault();
			e.stopPropagation();
			this.app.go(e.target.value, this, true);
			return;
		}
		if (e.target.tagName === 'BUTTON' && e.target.name === 'lucky') {
			e.preventDefault();
			e.stopPropagation();
			alert(['That\'s pretty cool.','Your mom\'s feeling lucky.','I see.','If you feel lucky for more than four hours, perhaps you should see a doctor.'][Math.floor(Math.random()*4)]);
			return;
		}
		var scrollLoc = this.$el.scrollTop();
		this.$('.searchbox').focus();
		this.$el.scrollTop(scrollLoc);
	},
	clickResult: function(e) {
		if (this.search.addFilter(e.currentTarget)) {
			e.preventDefault();
			e.stopImmediatePropagation();
			this.$('.searchbox').val('');
			this.find('');
			return;
		}
	},
	hoverlink: function(e) {
		$(this.activeLink).removeClass('active');
		this.activeLink = e.currentTarget;
		$(this.activeLink).addClass('active');
	},
	find: function(val) {
		if (!this.search) return;
		if (!val) val = '';
		if (!this.search.find(val)) return;
		if (this.search.q || this.search.filters) {
			this.$('.pokedex').addClass('aboveresults');
			this.activeLink = this.search.el.getElementsByTagName('a')[0];
			$(this.activeLink).addClass('active');
		} else {
			this.$('.pokedex').removeClass('aboveresults');
			this.activeLink = null;
		}
	},
	checkExactMatch: function() {
		if (this.search && this.search.exactMatch && this.search.q !== 'metronome' && this.search.q !== 'psychic') {
			setTimeout(function(){
				this.app.go($(this.activeLink).attr('href'), this, false, $(this.activeLink), true);
			}.bind(this));
		}
	}
});
