BattleSearch.urlRoot = '/';

var Topbar = Panels.Topbar.extend({
	height: 51
});

var PokedexResultPanel = Panels.Panel.extend({
	minWidth: 639,
	maxWidth: 639,
	initialize: function() {
		this.html('not found: '+Array.prototype.join.call(arguments,' || '));
	}
});

function sourcePad(source) {
	// return (source.length<=4||source.charCodeAt(3)>=97?'0':'')+(source.length<=3||source.charCodeAt(3)>=97?'0':'')+source.substr(2).replace('.','');
	return source.length>5 ? source.substr(2) : source.substr(2)+' ';
}

var PokedexItemPanel = PokedexResultPanel.extend({
	initialize: function(id) {
		var item = Tools.getItem(id);
		this.shortTitle = item.name;

		var buf = '<div class="pfx-body dexentry">';
		buf += '<a href="/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><span class="itemicon" style="'+Tools.getItemIcon(item)+'"></span> <a href="/items/'+id+'" data-target="push" class="subtle">'+item.name+'</a></h1>';
		buf += '<p>'+Tools.escapeHTML(item.desc||item.shortDesc)+'</p>';

		// past gens
		var pastGenChanges = false;
		if (BattleTeambuilderTable) for (var genNum = 6; genNum >= 1; genNum--) {
			var genTable = BattleTeambuilderTable['gen' + genNum];
			var nextGenTable = BattleTeambuilderTable['gen' + (genNum + 1)];
			var changes = '';

			var nextGenDesc = (item.shortDesc || item.desc);
			if (nextGenTable && nextGenTable.overrideItemDesc[id]) nextGenDesc = nextGenTable.overrideItemDesc[id];
			var curGenDesc = genTable.overrideItemDesc[id] || nextGenDesc;
			if (curGenDesc !== nextGenDesc) {
				changes += curGenDesc + ' <i class="fa fa-long-arrow-right"></i> ' + nextGenDesc + '<br />';
			}

			if (changes) {
				if (!pastGenChanges) buf += '<h3>Past gens</h3><dl>';
				buf += '<dt>Gen ' + genNum + ' <i class="fa fa-arrow-right"></i> ' + (genNum + 1) + ':</dt>';
				buf += '<dd>' + changes + '</dd>';
				pastGenChanges = true;
			}
		}
		if (pastGenChanges) buf += '</dl>';

		buf += '</div>';

		this.html(buf);
	}
});
var PokedexAbilityPanel = PokedexResultPanel.extend({
	initialize: function(id) {
		var ability = Tools.getAbility(id);
		this.id = id;
		this.shortTitle = ability.name;

		var buf = '<div class="pfx-body dexentry">';
		buf += '<a href="/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><a href="/abilities/'+id+'" data-target="push" class="subtle">'+ability.name+'</a></h1>';

		if (ability.isNonstandard) buf += '<div class="warning"><strong>Note:</strong> This is a made-up ability by <a href="http://www.smogon.com/cap/" target="_blank">Smogon CAP</a>.</div>';

		buf += '<p>'+Tools.escapeHTML(ability.desc||ability.shortDesc)+'</p>';

		// pokemon
		buf += '<h3>Pok&eacute;mon with this ability</h3>';
		buf += '<ul class="utilichart nokbd">';
		buf += '</ul>';

		buf += '</div>';

		this.html(buf);

		setTimeout(this.renderPokemonList.bind(this));
	},
	renderPokemonList: function(list) {
		var ability = Tools.getAbility(this.id);
		var buf = '';
		for (var pokemonid in BattlePokedex) {
			var template = BattlePokedex[pokemonid];
			if (template.isNonstandard && !ability.isNonstandard) continue;
			if (template.abilities['0'] === ability.name || template.abilities['1'] === ability.name || template.abilities['H'] === ability.name) {
				buf += BattleSearch.renderPokemonRow(template);
			}
		}
		this.$('.utilichart').html(buf);
	}
});
var PokedexTypePanel = PokedexResultPanel.extend({
	initialize: function(id) {
		this.type = id[0].toUpperCase()+id.substr(1);
		var type = Tools.getType(this.type);
		this.shortTitle = this.type;

		var buf = '<div class="pfx-body dexentry">';
		buf += '<a href="/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><a href="/types/'+id+'" data-target="push" class="subtle">'+this.type+'</a></h1>';
		buf += '<dl>';
		var atLeastOne = false;

		buf += '<dt>Weaknesses:</dt> <dd>';
		for (var attackType in type.damageTaken) {
			if (type.damageTaken[attackType] == 1) {
				buf += '<a href="/types/'+toId(attackType)+'" data-target="push">'+Tools.getTypeIcon(attackType)+'</a> ';
				atLeastOne = true;
			}
		}
		if (!atLeastOne) {
			buf += '<em>No weaknesses</em>';
		}
		buf += '</dd>';

		buf += '<dt>Resistances:</dt> <dd>';
		atLeastOne = false;
		for (var attackType in type.damageTaken) {
			if (type.damageTaken[attackType] == 2) {
				buf += '<a href="/types/'+toId(attackType)+'" data-target="push">'+Tools.getTypeIcon(attackType)+'</a> ';
				atLeastOne = true;
			}
		}
		if (!atLeastOne) {
			buf += '<em>No resistances</em>';
		}
		buf += '</dd>';

		buf += '<dt>Immunities:</dt> <dd>';
		atLeastOne = false;
		for (var attackType in type.damageTaken) {
			if (type.damageTaken[attackType] == 3) {
				if (attackType === attackType.toLowerCase()) {
					switch (attackType) {
					case 'hail':
						buf += '<div><small><a href="/moves/hail" data-target="push">Hail</a> damage</small></div>';
						break;
					case 'sandstorm':
						buf += '<div><small><a href="/moves/sandstorm" data-target="push">Sandstorm</a> damage</small></div>';
						break;
					case 'powder':
						buf += '<div><small><a href="/tags/powder" data-target="push">Powder moves</a></small></div>';
						break;
					case 'frz':
						buf += '<div><small>FRZ status</small></div>';
						break;
					case 'brn':
						buf += '<div><small>BRN status</small></div>';
						break;
					case 'psn':
						buf += '<div><small>PSN status</small></div>';
						break;
					case 'par':
						buf += '<div><small>PAR status</small></div>';
						break;
					}
					if (!atLeastOne) atLeastOne = null;
					continue;
				}
				buf += '<a href="/types/'+toId(attackType)+'" data-target="push">'+Tools.getTypeIcon(attackType)+'</a> ';
				atLeastOne = true;
			}
		}
		if (!atLeastOne) {
			if (atLeastOne === null) {
				buf += '<div><em>No type immunities</em></div>';
			} else {
				buf += '<em>No immunities</em>';
			}
		}
		buf += '</dd>';

		buf += '</dl>';

		// move list
		buf += '<ul class="tabbar"><li><button class="button nav-first cur" value="move">Moves</button></li><li><button class="button nav-last" value="pokemon">Pokemon</button></li></ul>';
		buf += '<ul class="utilichart nokbd">';
		buf += '</ul>';

		buf += '</div>';

		this.html(buf);

		setTimeout(this.renderMoveList.bind(this));
	},
	events: {
		'click .tabbar button': 'selectTab'
	},
	selectTab: function(e) {
		this.$('.tabbar button').removeClass('cur');
		$(e.currentTarget).addClass('cur');
		switch (e.currentTarget.value) {
		case 'move':
			this.renderMoveList();
			break;
		case 'pokemon':
			this.renderPokemonList();
			break;
		}
	},
	renderMoveList: function() {
		var type = this.type;
		var buf = '<li class="resultheader"><h3>Physical '+type+' moves</h3></li>';
		for (var moveid in BattleMovedex) {
			var move = BattleMovedex[moveid];
			if (move.type === type && move.category === 'Physical') {
				buf += BattleSearch.renderMoveRow(move);
			}
		}
		this.$('.utilichart').html(buf)
			.css('min-height', 27*3 + 33*BattleSearchCountIndex[type+' move']);

		setTimeout(this.renderMoveList2.bind(this));
	},
	renderMoveList2: function() {
		var type = this.type;
		var bufs = ['<li class="resultheader"><h3>Physical '+type+' moves</h3></li>','<li class="resultheader"><h3>Special '+type+' moves</h3></li>','<li class="resultheader"><h3>Status '+type+' moves</h3></li>'];
		var bufChart = {Physical:0,Special:1,Status:2};
		for (var moveid in BattleMovedex) {
			var move = BattleMovedex[moveid];
			if (move.type === type) {
				bufs[bufChart[move.category]] += BattleSearch.renderMoveRow(move);
			}
		}
		this.$('.utilichart').html(bufs.join(''))
			.css('min-height', 27*3 + 33*BattleSearchCountIndex[type+' move']);
	},
	renderPokemonList: function() {
		var type = this.type;
		var pureBuf = '<li class="resultheader"><h3>Pure '+type+' Pok&eacute;mon</h3></li>';
		for (var templateid in BattlePokedex) {
			var template = BattlePokedex[templateid];
			if (template.types[0] === type && !template.types[1]) {
				pureBuf += BattleSearch.renderPokemonRow(template);
			}
		}
		this.$('.utilichart').html(pureBuf)
			.css('min-height', 27*3 + 33*BattleSearchCountIndex[type+' pokemon']);

		setTimeout(this.renderPokemonList2.bind(this));
	},
	renderPokemonList2: function() {
		var type = this.type;
		var primaryBuf = '<li class="resultheader"><h3>Primary '+type+' Pok&eacute;mon</h3></li>';
		var secondaryBuf = '<li class="resultheader"><h3>Secondary '+type+' Pok&eacute;mon</h3></li>';
		for (var templateid in BattlePokedex) {
			var template = BattlePokedex[templateid];
			if (template.types[0] === type) {
				if (template.types[1]) {
					primaryBuf += BattleSearch.renderPokemonRow(template);
				}
			} else if (template.types[1] === type) {
				secondaryBuf += BattleSearch.renderPokemonRow(template);
			}
		}
		this.$('.utilichart').append(primaryBuf + secondaryBuf);
	}
});
var PokedexTagPanel = PokedexResultPanel.extend({
	table: {
		contact: {
			name: 'Contact',
			tag: 'contact',
			desc: 'Affected by a variety of moves, abilities, and items.</p><p>Moves affected by contact moves include: Spiky Shield, King\'s Shield. Abilities affected by contact moves include: Iron Barbs, Rough Skin, Gooey, Flame Body, Static, Tough Claws. Items affected by contact moves include: Rocky Helmet, Sticky Barb.'
		},
		sound: {
			name: 'Sound',
			tag: 'sound',
			desc: 'Bypasses <a href="/moves/substitute" data-target="push">Substitute</a>. Doesn\'t affect <a href="/abilities/soundproof" data-target="push">Soundproof</a> Pok&eacute;mon.'
		},
		powder: {
			name: 'Powder',
			tag: 'powder',
			desc: 'Doesn\'t affect <a href="/types/grass" data-target="push">Grass-type</a> Pok&eacute;mon, <a href="/abilities/overcoat" data-target="push">Overcoat</a> Pok&eacute;mon, or <a href="/items/safetygoggles" data-target="push">Safety Goggles</a> holders.'
		},
		fist: {
			name: 'Fist',
			tag: 'punch',
			desc: 'Boosted 1.2x by <a href="/abilities/ironfist" data-target="push">Iron Fist</a>.'
		},
		pulse: {
			name: 'Pulse',
			tag: 'pulse',
			desc: 'Boosted 1.5x by <a href="/abilities/megalauncher" data-target="push">Mega Launcher</a>.'
		},
		bite: {
			name: 'Bite',
			tag: 'bite',
			desc: 'Boosted 1.5x by <a href="/abilities/strongjaw" data-target="push">Strong Jaw</a>.'
		},
		ballistic: {
			name: 'Ballistic',
			tag: 'bullet',
			desc: 'Doesn\'t affect <a href="/abilities/bulletproof" data-target="push">Bulletproof</a> Pok&eacute;mon.'
		},
		bypassprotect: {
			name: 'Bypass Protect',
			tag: '',
			desc: 'Bypasses <a class="subtle" href="/moves/protect" data-target="push">Protect</a>, <a class="subtle" href="/moves/detect" data-target="push">Detect</a>, <a class="subtle" href="/moves/kingsshield" data-target="push">King\'s Shield</a>, and <a class="subtle" href="/moves/spikyshield" data-target="push">Spiky Shield</a>.'
		},
		nonreflectable: {
			name: 'Nonreflectable',
			tag: '',
			desc: 'Can\'t be bounced by <a class="subtle" href="/moves/magiccoat" data-target="push">Magic Coat</a> or <a class="subtle" href="/abilities/magicbounce" data-target="push">Magic Bounce</a>.'
		},
		nonmirror: {
			name: 'Nonmirror',
			tag: '',
			desc: 'Can\'t be copied by <a class="subtle" href="/moves/mirrormove" data-target="push">Mirror Move</a>.'
		},
		nonsnatchable: {
			name: 'Nonsnatchable',
			tag: '',
			desc: 'Can\'t be copied by <a class="subtle" href="/moves/snatch" data-target="push">Snatch</a>.'
		},
		bypasssub: {
			name: 'Bypass Substitute',
			tag: 'authentic',
			desc: 'Bypasses but does not break a <a class="subtle" href="/moves/substitute" data-target="push">Substitute</a>.'
		},
		zmove: {
			name: 'Z-Move',
			tag: '',
			desc: 'Is a <a class="subtle" href="/articles/zmoves" data-target="push">Z-Move</a>.'
		}
	},
	initialize: function(id) {
		var tag = this.table[id];
		var name = (tag ? tag.name : id);
		this.id = id;
		this.shortTitle = name;

		var buf = '<div class="pfx-body dexentry">';

		buf += '<a href="/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><a href="/tags/'+id+'" data-target="push" class="subtle">'+name+'</a></h1>';

		if (tag) buf += '<p>'+tag.desc+'</p>';

		// distribution
		buf += '<h3>'+name+' moves</h3>';
		buf += '<ul class="utilichart metricchart nokbd">';
		buf += '</ul>';

		buf += '</div>';

		this.html(buf);

		setTimeout(this.renderDistribution.bind(this));
	},
	getDistribution: function() {
		if (this.results) return this.results;
		var tag = (this.id in this.table ? this.table[this.id].tag : this.id);
		var results = [];
		if (tag) {
			for (var moveid in BattleMovedex) {
				if (BattleMovedex[moveid].flags && tag in BattleMovedex[moveid].flags) results.push(moveid);
			}
		} else if (this.id === 'bypassprotect') {
			for (var moveid in BattleMovedex) {
				if (BattleMovedex[moveid].target !== 'self' && BattleMovedex[moveid].flags && !('protect' in BattleMovedex[moveid].flags)) {
					results.push(moveid);
				}
			}
		} else if (this.id === 'nonreflectable') {
			for (var moveid in BattleMovedex) {
				if (BattleMovedex[moveid].target !== 'self' && BattleMovedex[moveid].category === 'Status' && BattleMovedex[moveid].flags && !('reflectable' in BattleMovedex[moveid].flags)) {
					results.push(moveid);
				}
			}
		} else if (this.id === 'zmove') {
			for (var moveid in BattleMovedex) {
				if (BattleMovedex[moveid].isZ) {
					results.push(moveid);
				}
			}
		} else if (this.id === 'nonmirror') {
			for (var moveid in BattleMovedex) {
				if (BattleMovedex[moveid].target !== 'self' && BattleMovedex[moveid].flags && !('mirror' in BattleMovedex[moveid].flags)) {
					results.push(moveid);
				}
			}
		} else if (this.id === 'nonsnatchable') {
			for (var moveid in BattleMovedex) {
				if ((BattleMovedex[moveid].target === 'allyTeam' || BattleMovedex[moveid].target === 'self' || BattleMovedex[moveid].target === 'adjacentAllyOrSelf') && BattleMovedex[moveid].flags && !('snatch' in BattleMovedex[moveid].flags)) {
					results.push(moveid);
				}
			}
		}
		return this.results = results;
	},
	renderDistribution: function() {
		var results = this.getDistribution();
		this.$chart = this.$('.utilichart');

		if (results.length > 1600/33) {
			this.streamLoading = true;
			this.$el.on('scroll', this.handleScroll.bind(this));

			var panelTop = this.$el.children().offset().top;
			var panelHeight = this.$el.outerHeight();
			var chartTop = this.$chart.offset().top;
			var scrollLoc = this.scrollLoc = this.$el.scrollTop();

			var start = Math.floor((scrollLoc - (chartTop-panelTop)) / 33 - 35);
			var end = Math.floor(start + 35 + panelHeight / 33 + 35);
			if (start < 0) start = 0;
			if (end > results.length-1) end = results.length-1;
			this.start = start, this.end = end;

			// distribution
			var buf = '';
			for (var i=0, len=results.length; i<len; i++) {
				buf += '<li class="result">'+this.renderRow(i, i < start || i > end)+'</li>';
			}
			this.$chart.html(buf);
		} else {
			var buf = '';
			for (var i=0, len=results.length; i<len; i++) {
				buf += '<li class="result">'+this.renderRow(i)+'</li>';
			}
			this.$chart.html(buf);
		}
	},
	renderRow: function(i, offscreen) {
		var results = this.results;
		var move = BattleMovedex[results[i]];
		if (offscreen) {
			return move.name;
		} else {
			return BattleSearch.renderMoveRowInner(move);
		}
	},
	handleScroll: function() {
		var scrollLoc = this.$el.scrollTop();
		if (Math.abs(scrollLoc - this.scrollLoc) > 20*33) {
			this.renderUpdateDistribution();
		}
	},
	debouncedPurgeTimer: null,
	renderUpdateDistribution: function(fullUpdate) {
		if (this.debouncedPurgeTimer) {
			clearTimeout(this.debouncedPurgeTimer);
			this.debouncedPurgeTimer = null;
		}

		var panelTop = this.$el.children().offset().top;
		var panelHeight = this.$el.outerHeight();
		var chartTop = this.$chart.offset().top;
		var scrollLoc = this.scrollLoc = this.$el.scrollTop();

		var results = this.results;

		var rowFit = Math.floor(panelHeight / 33);

		var start = Math.floor((scrollLoc - (chartTop-panelTop)) / 33 - 35);
		var end = start + 35 + rowFit + 35;
		if (start < 0) start = 0;
		if (end > results.length-1) end = results.length-1;

		var $rows = this.$chart.children();

		if (fullUpdate || start < this.start - rowFit - 30 || end > this.end + rowFit + 30) {
			var buf = '';
			for (var i=0, len=results.length; i<len; i++) {
				buf += '<li class="result">'+this.renderRow(i, (i < start || i > end))+'</li>';
			}
			this.$chart.html(buf);
			this.start = start, this.end = end;
			return;
		}

		if (start < this.start) {
			for (var i = start; i<this.start; i++) {
				$rows[i].innerHTML = this.renderRow(i);
			}
			this.start = start;
		}

		if (end > this.end) {
			for (var i = this.end+1; i<=end; i++) {
				$rows[i].innerHTML = this.renderRow(i);
			}
			this.end = end;
		}

		if (this.end - this.start > rowFit+90) {
			var self = this;
			this.debouncedPurgeTimer = setTimeout(function() {
				self.renderUpdateDistribution(true);
			}, 1000);
		}
	}
});
var PokedexEggGroupPanel = PokedexResultPanel.extend({
	table: {
		amorphous: {
			name: 'Amorphous',
			desc: ""
		},
		bug: {
			name: 'Bug',
			desc: ""
		},
		ditto: {
			name: 'Ditto',
			desc: "Can breed with anything."
		},
		dragon: {
			name: 'Dragon',
			desc: ""
		},
		fairy: {
			name: 'Fairy',
			desc: ""
		},
		field: {
			name: 'Field',
			desc: ""
		},
		flying: {
			name: 'Flying',
			desc: ""
		},
		grass: {
			name: 'Grass',
			desc: ""
		},
		humanlike: {
			name: 'Human-Like',
			desc: ""
		},
		mineral: {
			name: 'Mineral',
			desc: ""
		},
		monster: {
			name: 'Monster',
			desc: ""
		},
		plant: {
			name: 'Plant',
			desc: ""
		},
		undiscovered: {
			name: 'Undiscovered',
			desc: "Can't breed."
		},
		water1: {
			name: 'Water 1',
			desc: ""
		},
		water2: {
			name: 'Water 2',
			desc: ""
		},
		water3: {
			name: 'Water 3',
			desc: ""
		}
	},
	initialize: function(id) {
		var ids = id.split('+');
		this.id = ids[0];
		var names = this.table[ids[0]].name;
		this.shortTitle = names;
		if (ids[1]) {
			this.id2 = ids[1];
			names += ' + '+this.table[ids[1]].name;
			this.shortTitle = "Egg groups";
		}

		var buf = '<div class="pfx-body dexentry">';

		buf += '<a href="/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><a href="/egggroups/'+id+'" data-target="push" class="subtle">'+names+'</a></h1>';

		if (this.id2) {
			buf += '<p>All Pok&eacute;mon in either the <a href="/egggroups/'+this.id+'" data-target="push">'+this.table[ids[0]].name+'</a> or <a href="/egggroups/'+this.id2+'" data-target="push">'+this.table[ids[1]].name+'</a> egg group.</p>';
		} else {
			buf += '<p>'+this.table[ids[0]].desc+'</p>';
		}

		// distribution
		buf += '<h3>Basic '+names+' pokemon</h3>';
		buf += '<ul class="utilichart metricchart nokbd">';
		buf += '</ul>';

		buf += '</div>';

		this.html(buf);

		setTimeout(this.renderDistribution.bind(this));
	},
	getDistribution: function() {
		var name = this.table[this.id].name;
		var name2 = '!';
		if (this.id2) name2 = this.table[this.id2].name;
		if (this.results) return this.results;
		var results = [];
		for (var pokemonid in BattlePokedex) {
			var eggGroups = BattlePokedex[pokemonid].eggGroups;
			var prevo = BattlePokedex[pokemonid].prevo;
			if (!eggGroups || BattlePokedex[pokemonid].forme || (prevo && BattlePokedex[prevo].eggGroups[0] !== "Undiscovered")) continue;
			if (BattlePokedex[pokemonid] && BattlePokedex[pokemonid].isNonstandard) continue;
			if (eggGroups[0] === name || eggGroups[1] === name ||
				eggGroups[0] === name2 || eggGroups[1] === name2) {
				results.push(pokemonid);
			}
		}
		results.sort();
		return this.results = results;
	},
	renderDistribution: function() {
		var results = this.getDistribution();
		this.$chart = this.$('.utilichart');

		if (results.length > 1600/33) {
			this.streamLoading = true;
			this.$el.on('scroll', this.handleScroll.bind(this));

			var panelTop = this.$el.children().offset().top;
			var panelHeight = this.$el.outerHeight();
			var chartTop = this.$chart.offset().top;
			var scrollLoc = this.scrollLoc = this.$el.scrollTop();

			var start = Math.floor((scrollLoc - (chartTop-panelTop)) / 33 - 35);
			var end = Math.floor(start + 35 + panelHeight / 33 + 35);
			if (start < 0) start = 0;
			if (end > results.length-1) end = results.length-1;
			this.start = start, this.end = end;

			// distribution
			var buf = '';
			for (var i=0, len=results.length; i<len; i++) {
				buf += '<li class="result">'+this.renderRow(i, i < start || i > end)+'</li>';
			}
			this.$chart.html(buf);
		} else {
			var buf = '';
			for (var i=0, len=results.length; i<len; i++) {
				buf += '<li class="result">'+this.renderRow(i)+'</li>';
			}
			this.$chart.html(buf);
		}
	},
	renderRow: function(i, offscreen) {
		var results = this.results;
		var template = BattlePokedex[results[i]];
		if (offscreen) {
			return ''+template.species+' '+template.abilities['0']+' '+(template.abilities['1']||'')+' '+(template.abilities['H']||'')+'';
		} else {
			return BattleSearch.renderTaggedPokemonRowInner(template, '<span class="picon" style="margin-top:-12px;'+Tools.getPokemonIcon('egg')+'"></span>');
		}
	},
	handleScroll: function() {
		var scrollLoc = this.$el.scrollTop();
		if (Math.abs(scrollLoc - this.scrollLoc) > 20*33) {
			this.renderUpdateDistribution();
		}
	},
	debouncedPurgeTimer: null,
	renderUpdateDistribution: function(fullUpdate) {
		if (this.debouncedPurgeTimer) {
			clearTimeout(this.debouncedPurgeTimer);
			this.debouncedPurgeTimer = null;
		}

		var panelTop = this.$el.children().offset().top;
		var panelHeight = this.$el.outerHeight();
		var chartTop = this.$chart.offset().top;
		var scrollLoc = this.scrollLoc = this.$el.scrollTop();

		var results = this.results;

		var rowFit = Math.floor(panelHeight / 33);

		var start = Math.floor((scrollLoc - (chartTop-panelTop)) / 33 - 35);
		var end = start + 35 + rowFit + 35;
		if (start < 0) start = 0;
		if (end > results.length-1) end = results.length-1;

		var $rows = this.$chart.children();

		if (fullUpdate || start < this.start - rowFit - 30 || end > this.end + rowFit + 30) {
			var buf = '';
			for (var i=0, len=results.length; i<len; i++) {
				buf += '<li class="result">'+this.renderRow(i, (i < start || i > end))+'</li>';
			}
			this.$chart.html(buf);
			this.start = start, this.end = end;
			return;
		}

		if (start < this.start) {
			for (var i = start; i<this.start; i++) {
				$rows[i].innerHTML = this.renderRow(i);
			}
			this.start = start;
		}

		if (end > this.end) {
			for (var i = this.end+1; i<=end; i++) {
				$rows[i].innerHTML = this.renderRow(i);
			}
			this.end = end;
		}

		if (this.end - this.start > rowFit+90) {
			var self = this;
			this.debouncedPurgeTimer = setTimeout(function() {
				self.renderUpdateDistribution(true);
			}, 1000);
		}
	}
});
var PokedexCategoryPanel = PokedexResultPanel.extend({
	initialize: function(id) {
		var category = {
			id: id,
			name: id[0].toUpperCase()+id.substr(1)
		};
		this.shortTitle = category.name;

		var buf = '<div class="pfx-body dexentry">';
		buf += '<a href="/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><a href="/categories/'+id+'" data-target="push" class="subtle">'+category.name+'</a></h1>';
		switch (id) {
		case 'physical':
			buf += '<p>Physical moves are damaging moves generally calculated with the user\'s Attack stat and the target\'s Defense stat.</p>';
			break;
		case 'special':
			buf += '<p>Special moves are damaging moves generally calculated with the user\'s Special Attack stat and the target\'s Special Defense stat.</p>';
			break;
		case 'status':
			buf += '<p>Status moves are moves that don\'t deal damage directly.</p>';
			break;
		}
		buf += '</div>';

		this.html(buf);
	}
});
var PokedexTierPanel = PokedexResultPanel.extend({
	initialize: function(id) {
		var tierTable = {
			uber: "Uber",
			ou: "OU",
			uu: "UU",
			ru: "RU",
			nu: "NU",
			pu: "PU",
			nfe: "NFE",
			lcuber: "LC Uber",
			lc: "LC",
			cap: "CAP",
			uubl: "UUBL",
			rubl: "RUBL",
			nubl: "NUBL",
			publ: "PUBL",
			illegal: "Illegal",
			bank: "Bank",
			bankuber: "Bank-Uber",
			banklc: "Bank-LC",
			banknfe: "Bank-NFE",
		};
		var name = tierTable[id] || id;
		this.id = id;
		this.shortTitle = name;

		var buf = '<div class="pfx-body dexentry">';
		buf += '<a href="/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><a href="/tiers/'+id+'" data-target="push" class="subtle">'+name+'</a></h1>';

		if (id === 'nfe' || id === 'banknfe') {
			buf += '<p>"NFE" (Not Fully Evolved) as a tier refers to NFE Pokémon that aren\'t legal in LC and don\'t make the usage cutoff for a tier such as PU.</p>';
		}

		if (id === 'cap') buf += '<div class="warning"><strong>Note:</strong> <a href="http://www.smogon.com/cap/" target="_blank">Smogon CAP</a> is a project to make up Pok&eacute;mon.</div>';

		// buf += '<p></p>';

		// pokemon
		buf += '<h3>Pok&eacute;mon in this tier</h3>';
		buf += '<ul class="utilichart nokbd">';
		buf += '</ul>';

		buf += '</div>';

		this.html(buf);

		setTimeout(this.renderPokemonList.bind(this));
	},
	renderPokemonList: function(list) {
		var tierName = this.shortTitle;
		var tierName2 = '(' + tierName + ')';
		var buf = '';
		for (var pokemonid in BattlePokedex) {
			var template = BattlePokedex[pokemonid];
			if (template.tier === tierName || template.tier === tierName2) {
				buf += BattleSearch.renderPokemonRow(template);
			}
		}
		this.$('.utilichart').html(buf);
	}
});
var PokedexArticlePanel = PokedexResultPanel.extend({
	initialize: function(id) {
		this.shortTitle = id;

		var buf = '<div class="pfx-body dexentry">';
		buf += '<a href="/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><a href="/articles/'+id+'" data-target="push" class="subtle">'+id+'</a></h1>';
		buf += '<div class="article-content"><em>Loading...</em></div>';
		buf += '</div>';

		this.html(buf);

		var self = this;
		$.get('/.articles-cached/' + id + '.html').done(function (html) {
			var html = html.replace(/<h1[^>]*>([^<]+)<\/h1>/, function (match, innerMatch) {
				self.shortTitle = innerMatch;
				self.$('h1').first().html('<a href="/articles/' + id + '" class="subtle" data-target="push">' + innerMatch + '</a>');
				return '';
			});
			self.$('.article-content').html(html);
		});
	}
});
