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
		'keyup': 'keyup',
		'click': 'click',
		'click .result a': 'clickResult',
		'click .filter': 'removeFilter',
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
		buf += '<h1><a href="/" data-target="replace">Pok&eacute;dex</a></h1>';
		buf += '<ul class="tabbar centered" style="margin-bottom: 18px"><li><button class="button nav-first' + (fragment === '' ? ' cur' : '') + '" value="">Search</button></li>';
		buf += '<li><button class="button' + (fragment === 'pokemon/' ? ' cur' : '') + '" value="pokemon/">Pok&eacute;mon</button></li>';
		buf += '<li><button class="button nav-last' + (fragment === 'moves/' ? ' cur' : '') + '" value="moves/">Moves</button></li></ul>';
		buf += '<div class="searchboxwrapper"><input class="textbox searchbox" type="search" name="q" value="' + Dex.escapeHTML(this.$('.searchbox').val() || '') + '" autocomplete="off" autofocus placeholder="Search Pok&eacute;mon, moves, abilities, items, types, or more" /></div>';
		if (fragment === '') {
			buf += '<p class="buttonbar"><button class="button"><strong>Pok&eacute;dex Search</strong></button> <button name="lucky" class="button">I\'m Feeling Lucky</button></p>';
		}
		buf += '</form>';
		buf += '<div class="results"></div></div>';
		this.$el.html(buf);
		var $searchbox = this.$('.searchbox');
		this.$searchbox = $searchbox;
		this.$searchfilters = null;
		var results = this.$('.results');
		if (results.length) {
			var search = this.search = new BattleSearch(results, this.$el);
			this.$el.on('scroll', function () {
				search.updateScroll();
			});
			if (fragment === 'pokemon/') {
				search.setType('pokemon');
				$searchbox.attr('placeholder', 'Search pokemon OR filter by type, move, ability, egg group');
				this.$('.buttonbar').remove();
			} else if (fragment === 'moves/') {
				search.setType('move');
				$searchbox.attr('placeholder', 'Search moves OR filter by type, category, pokemon');
				this.$('.buttonbar').remove();
			}
			this.search.externalFilter = true;
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
	removeFilter: function(e) {
		this.search.removeFilter(e);
		this.updateFilters();
		this.$searchbox.focus();
	},
	updateFilters: function() {
		// this.search.externalFilter = true;
		var buf = '';
		if (this.search.qType === 'pokemon') {
			buf = '<button class="filter noclear" value=":">Pokémon</button> ';
		} else if (this.search.qType === 'move') {
			buf = '<button class="filter noclear" value=":">Moves</button> ';
		} else {
			this.$('.searchbox-filters').remove();
			this.$searchbox.css('padding', '2px');
			return;
		}
		if (this.search.filters) {
			for (var i = 0; i < this.search.filters.length; i++) {
				var filter = this.search.filters[i];
				var text = filter[1];
				if (filter[0] === 'move') text = Dex.getMove(text).name;
				if (filter[0] === 'pokemon') text = Dex.getSpecies(text).name;
				buf += '<button class="filter" value="' + Dex.escapeHTML(filter.join(':')) + '">' + text + ' <i class="fa fa-times-circle"></i></button> ';
			}
		}
		if (!this.$searchfilters) {
			this.$searchfilters = $('<div class="searchbox-filters"></div>').insertAfter(this.$searchbox);
		}
		this.$searchfilters.html(buf);
		var filterWidth = this.$searchfilters.width();
		if (filterWidth > this.$searchbox.outerWidth() / 2) {
			this.$searchbox.css('padding', '' + (this.$searchfilters.height() + 4) + 'px 2px 2px 2px');
		} else {
			this.$searchbox.css('padding', '2px 2px 2px ' + (filterWidth + 6) + 'px');
		}
	},
	submit: function(e) {
		e.preventDefault();
		this.$('.searchbox').attr('placeholder', 'Type in: Pokemon, move, item, ability...').focus();
	},
	keyup: function (e) {
		var val = this.$searchbox.val();
		var id = toID(val);
		if (!id) return;
		var lastchar = val.charAt(val.length - 1);
		if (lastchar === ',' || lastchar === ' ') {
			if (id === 'ds' || id === 'dexsearch' || id === 'pokemon') {
				this.app.go('pokemon/', this, true);
				return;
			}
			if (id === 'ms' || id === 'movesearch' || id === 'move' || id === 'moves') {
				this.app.go('moves/', this, true);
				return;
			}
		}
		if (lastchar === ',') {
			if (this.search.addFilter(this.activeLink)) {
				this.$searchbox.val('');
				this.find('');
				return;
			}
		}
	},
	keydown: function(e) {
		switch (e.keyCode) {
		case 13: // enter
			e.preventDefault();
			e.stopPropagation();
			if (this.search.addFilter(this.activeLink)) {
				this.$searchbox.val('');
				this.find('');
				return;
			}
			if (this.activeLink) {
				var path = this.activeLink.pathname.substr(1);
				if (path === 'moves/' || path === 'pokemon/') {
					this.app.go(path, this, true);
					return;
				}
				this.app.go(path, this, false, $(this.activeLink));
			} else if (!this.$searchbox.val()) {
				this.app.slicePanel(this);
			}
			break;
		case 188: // comma
			if (this.search.addFilter(this.activeLink)) {
				e.preventDefault();
				e.stopPropagation();
				this.$searchbox.val('');
				this.find('');
				return;
			}
			break;
		case 32: // space
			var id = toID(this.$searchbox.val());
			if (id === 'ds' || id === 'pokemon') {
				e.preventDefault();
				e.stopPropagation();
				this.app.go('pokemon/', this, true);
				return;
			}
			if (id === 'ms' || id === 'move' || id === 'moves') {
				e.preventDefault();
				e.stopPropagation();
				this.app.go('moves/', this, true);
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
			if (this.$searchbox.val()) break;

			if (this.search.removeFilter()) {
				this.find('');
				return;
			}
			if (this.search.qType) {
				this.app.go('', this, true);
				return;
			}
			if (this.app.panels.length > 1) {
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
		this.$searchbox.focus();
		this.$el.scrollTop(scrollLoc);
	},
	clickResult: function(e) {
		if (this.search.addFilter(e.currentTarget)) {
			e.preventDefault();
			e.stopImmediatePropagation();
			this.$searchbox.val('');
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
		this.updateFilters();
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
