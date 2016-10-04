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

var PokedexPokemonPanel = PokedexResultPanel.extend({
	initialize: function(id) {
		var pokemon = Tools.getTemplate(id);
		this.id = id;
		this.shortTitle = pokemon.baseSpecies;

		var buf = '<div class="pfx-body dexentry">';

		buf += '<a href="/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<a href="/tiers/'+toId(pokemon.tier)+'" data-target="push" class="tier">'+pokemon.tier+'</a>';
		buf += '<h1>';
		if (pokemon.forme) {
			buf += '<a href="/pokemon/'+id+'" data-target="push" class="subtle">'+pokemon.baseSpecies+'<small>-'+pokemon.forme+'</small></a>';
		} else {
			buf += '<a href="/pokemon/'+id+'" data-target="push" class="subtle">'+pokemon.name+'</a>';
		}
		if (pokemon.num > 0) buf += ' <code>#'+pokemon.num+'</code>';
		buf += '</h1>';

		if (pokemon.isNonstandard) {
			if (id === 'missingno') buf += '<div class="warning"><strong>Note:</strong> This is a glitch Pok&eacute;mon.</div>';
			else buf += '<div class="warning"><strong>Note:</strong> This is a made-up Pok&eacute;mon by <a href="http://www.smogon.com/cap/" target="_blank">Smogon CAP</a>.</div>';
		}

		buf += '<img src="'+Tools.resourcePrefix+'sprites/bw/'+pokemon.spriteid+'.png'+'" alt="" width="96" height="96" class="sprite" />';

		buf += '<dl class="typeentry">';
		buf += '<dt>Types:</dt> <dd>';
		for (var i=0; i<pokemon.types.length; i++) {
			buf += '<a class="type '+toId(pokemon.types[i])+'" href="/types/'+toId(pokemon.types[i])+'" data-target="push">'+pokemon.types[i]+'</a> ';
		}
		buf += '</dd>';
		buf += '</dl>';

		buf += '<dl class="sizeentry">';
		buf += '<dt>Size:</dt> <dd>';
		var gkPower = (function(weightkg) {
			if (weightkg >= 200) return 120;
			if (weightkg >= 100) return 100;
			if (weightkg >= 50) return 80;
			if (weightkg >= 25) return 60;
			if (weightkg >= 10) return 40;
			return 20;
		})(pokemon.weightkg);
		buf += ''+pokemon.heightm+' m, '+pokemon.weightkg+' kg<br /><small><a class="subtle" href="/moves/grassknot" data-target="push">Grass Knot</a>: '+gkPower+'</small>';
		buf += '</dd>';
		buf += '</dl>';

		buf += '<dl class="abilityentry">';
		buf += '<dt>Abilities:</dt> <dd class="imgentry">';
		for (var i in pokemon.abilities) {
			var ability = pokemon.abilities[i];
			if (!ability) continue;

			if (i !== '0') buf += ' | ';
			if (i === 'H') ability = '<em>'+pokemon.abilities[i]+'</em>';
			buf += '<a href="/abilities/'+toId(pokemon.abilities[i])+'" data-target="push">'+ability+'</a>';
			if (i === 'H') buf += '<small> (H)</small>';
		}
		buf += '</dd>';
		buf += '</dl>';

		buf += '<dl>';
		buf += '<dt style="clear:left">Base stats:</dt><dd><table class="stats">';

		var StatTitles = {
			hp: "HP",
			atk: "Attack",
			def: "Defense",
			spa: "Sp. Atk",
			spd: "Sp. Def",
			spe: "Speed"
		};
		buf += '<tr><td></td><td></td><td style="width:200px"></td><th class="ministat"><abbr title="0 IVs, 0 EVs, negative nature">min&minus;</a></th><th class="ministat"><abbr title="31 IVs, 0 EVs, neutral nature">min</abbr></th><th class="ministat"><abbr title="31 IVs, 252 EVs, neutral nature">max</abbr></th><th class="ministat"><abbr title="31 IVs, 252 EVs, positive nature">max+</abbr></th>';
		var bst = 0;
		for (var i in BattleStatNames) {
			var baseStat = pokemon.baseStats[i];
			bst += baseStat;
			var width = Math.floor(baseStat*200/200);
			if (width > 200) width = 200;
			var color = Math.floor(baseStat*180/255);
			if (color > 360) color = 360;
			buf += '<tr><th>'+StatTitles[i]+':</th><td class="stat">'+baseStat+'</td>';
			buf += '<td class="statbar"><span style="width:'+Math.floor(width)+'px;background:hsl('+color+',85%,45%);border-color:hsl('+color+',75%,35%)"></span></td>';
			buf += '<td class="ministat"><small>'+(i==='hp'?'':this.getStat(baseStat, false, 100, 0, 0, 0.9))+'</small></td><td class="ministat"><small>'+this.getStat(baseStat, i==='hp', 100, 31, 0, 1.0)+'</small></td>';
			buf += '<td class="ministat"><small>'+this.getStat(baseStat, i==='hp', 100, 31, 255, 1.0)+'</small></td><td class="ministat"><small>'+(i==='hp'?'':this.getStat(baseStat, false, 100, 31, 255, 1.1))+'</small></td></tr>';
		}
		buf += '<tr><th class="bst">Total:</th><td class="bst">'+bst+'</td><td></td><td class="ministat"></td><td class="ministat"></td><td class="ministat"></td><td class="ministat"></td>';

		buf += '</table></dd>';

		buf += '<dt>Evolution:</dt> <dd>';
		var template = pokemon;
		while (template.prevo) template = Tools.getTemplate(template.prevo);
		if (template.evos) {
			buf += '<table class="evos"><tr><td>';
			var evos = [template];
			while (evos) {
				if (evos[0] === 'dustox') evos = ['beautifly','dustox'];
				for (var i=0; i<evos.length; i++) {
					template = Tools.getTemplate(evos[i]);
					if (i <= 0) {
						if (!evos[0].exists) {
							if (evos[1] === 'dustox') {
								buf += '</td><td class="arrow"><span>&rarr;<br />&rarr;</span></td><td>';
							} else {
								buf += '</td><td class="arrow"><span>&rarr;</span></td><td>';
							}
						}
					}
					var name = (template.forme ? template.baseSpecies+'<small>-'+template.forme+'</small>' : template.name);
					name = '<span class="picon" style="'+Tools.getPokemonIcon(template)+'"></span>'+name;
					if (template === pokemon) {
						buf += '<div><strong>'+name+'</strong></div>';
					} else {
						buf += '<div><a href="/pokemon/'+template.id+'" data-target="replace">'+name+'</a></div>';
					}
				}
				evos = template.evos;
			}
			buf += '</td></tr></table>';
		} else {
			buf += '<em>Does not evolve</em>';
		}
		buf += '</dd>';

		if (pokemon.otherFormes || pokemon.forme) {
			buf += '<dt>Formes:</dt> <dd>';
			template = (pokemon.forme ? Tools.getTemplate(pokemon.baseSpecies) : pokemon);
			var name = template.baseForme || 'Base';
			name = '<span class="picon" style="'+Tools.getPokemonIcon(template)+'"></span>'+name;
			if (template === pokemon) {
				buf += '<strong>'+name+'</strong>';
			} else {
				buf += '<a href="/pokemon/'+template.id+'" data-target="replace">'+name+'</a>';
			}
			var otherFormes = template.otherFormes;
			if (otherFormes) for (var i=0; i<otherFormes.length; i++) {
				template = Tools.getTemplate(otherFormes[i]);
				var name = template.forme;
				name = '<span class="picon" style="'+Tools.getPokemonIcon(template)+'"></span>'+name;
				if (template === pokemon) {
					buf += ', <strong>'+name+'</strong>';
				} else {
					buf += ', <a href="/pokemon/'+template.id+'" data-target="replace">'+name+'</a>';
				}
			}
		}
		buf += '</dd></dl>';

		if (pokemon.eggGroups) {
			buf += '<dl class="colentry"><dt>Egg groups:</dt><dd><span class="pokemonicon" style="margin-top:-3px;'+Tools.getIcon('egg')+'"></span><a href="/egggroups/'+pokemon.eggGroups.map(toId).join('+')+'" data-target="push">'+pokemon.eggGroups.join(', ')+'</a></dd></dl>';
			buf += '<dl class="colentry"><dt>Gender ratio:</dt><dd>';
			if (pokemon.gender) switch (pokemon.gender) {
			case 'M':
				buf += '100% male';
				break;
			case 'F':
				buf += '100% female';
				break;
			case 'N':
				buf += '100% genderless';
				break;
			} else if (pokemon.genderRatio) {
				buf += ''+(pokemon.genderRatio.M*100)+'% male, '+(pokemon.genderRatio.F*100)+'% female';
			} else {
				buf += '50% male, 50% female';
			}
			buf += '</dd></dl>';
			buf += '<div style="clear:left"></div>';
		}

		// learnset
		buf += '<ul class="tabbar"><li><button class="button nav-first cur" value="move">Moves</button></li><li><button class="button nav-last" value="details">Flavor</button></li></ul>';
		buf += '<ul class="utilichart nokbd">';
		buf += '<li class="resultheader"><h3>Level-up</h3></li>';

		var learnset = BattleLearnsets[id] && BattleLearnsets[id].learnset;
		if (!learnset) learnset = BattleLearnsets[toId(pokemon.baseSpecies)].learnset;

		var moves = [];
		for (var moveid in learnset) {
			var sources = learnset[moveid];
			if (typeof sources === 'string') sources = [sources];
			for (var i=0, len=sources.length; i<len; i++) {
				var source = sources[i];
				if (source.substr(0,2) === '6L') {
					moves.push('a'+sourcePad(source)+moveid);
				}
			}
		}
		moves.sort();
		for (var i=0, len=moves.length; i<len; i++) {
			var move = BattleMovedex[moves[i].substr(5)];
			if (move) {
				var desc = moves[i].substr(1,3) === '001' ? '&ndash;' : '<small>L</small>'+(parseInt(moves[i].substr(1,3),10)||'?');
				buf += BattleSearch.renderTaggedMoveRow(move, desc);
			}
		}
		buf += '</ul>';

		buf += '</div>';

		this.html(buf);

		setTimeout(this.renderFullLearnset.bind(this));
	},
	events: {
		'click .tabbar button': 'selectTab'
	},
	selectTab: function(e) {
		this.$('.tabbar button').removeClass('cur');
		$(e.currentTarget).addClass('cur');
		switch (e.currentTarget.value) {
		case 'move':
			this.renderFullLearnset();
			break;
		case 'details':
			this.renderDetails();
			break;
		}
	},
	renderFullLearnset: function() {
		var pokemon = Tools.getTemplate(this.id);
		var learnset = BattleLearnsets[this.id] && BattleLearnsets[this.id].learnset;
		if (!learnset) learnset = BattleLearnsets[toId(pokemon.baseSpecies)].learnset;

		// learnset
		var buf = '';
		var moves = [];
		var shownMoves = {};
		for (var moveid in learnset) {
			var sources = learnset[moveid];
			if (typeof sources === 'string') sources = [sources];
			for (var i=0, len=sources.length; i<len; i++) {
				var source = sources[i];
				if (source.substr(0,2) === '6L') {
					moves.push('a'+sourcePad(source)+moveid);
					shownMoves[moveid] = (shownMoves[moveid]|2);
				} else if (source === '6M') {
					moves.push('d000 '+moveid);
					shownMoves[moveid] = (shownMoves[moveid]|1);
				} else if (source === '6T') {
					moves.push('e000 '+moveid);
					shownMoves[moveid] = (shownMoves[moveid]|1);
				} else if (source === '6E') {
					moves.push('f000 '+moveid);
					shownMoves[moveid] = (shownMoves[moveid]|4);
				} else if (source.charAt(1) === 'S') {
					if (shownMoves[moveid]&8) continue;
					moves.push('i000 '+moveid);
					shownMoves[moveid] = (shownMoves[moveid]|8);
				}
			}
		}
		var prevo1, prevo2;
		if (pokemon.prevo) {
			prevo1 = pokemon.prevo;
			var prevoLearnset = BattleLearnsets[prevo1].learnset;
			for (var moveid in prevoLearnset) {
				var sources = prevoLearnset[moveid];
				if (typeof sources === 'string') sources = [sources];
				for (var i=0, len=sources.length; i<len; i++) {
					var source = sources[i];
					if (source.substr(0,2) === '6L') {
						if (shownMoves[moveid]&2) continue;
						moves.push('b'+sourcePad(source)+moveid);
						shownMoves[moveid] = (shownMoves[moveid]|2);
					} else if (source === '6E') {
						if (shownMoves[moveid]&4) continue;
						moves.push('g000 '+moveid);
						shownMoves[moveid] = (shownMoves[moveid]|4);
					} else if (source.charAt(1) === 'S') {
						if (shownMoves[moveid]&8) continue;
						moves.push('i000 '+moveid);
						shownMoves[moveid] = (shownMoves[moveid]|8);
					}
				}
			}

			if (BattlePokedex[prevo1].prevo) {
				prevo2 = BattlePokedex[prevo1].prevo;
				prevoLearnset = BattleLearnsets[prevo2].learnset;
				for (var moveid in prevoLearnset) {
					var sources = prevoLearnset[moveid];
					if (typeof sources === 'string') sources = [sources];
					for (var i=0, len=sources.length; i<len; i++) {
						var source = sources[i];
						if (source.substr(0,2) === '6L') {
							if (shownMoves[moveid]&2) continue;
							moves.push('c'+sourcePad(source)+moveid);
							shownMoves[moveid] = (shownMoves[moveid]|2);
						} else if (source === '6E') {
							if (shownMoves[moveid]&4) continue;
							moves.push('h000 '+moveid);
							shownMoves[moveid] = (shownMoves[moveid]|4);
						} else if (source.charAt(1) === 'S') {
							if (shownMoves[moveid]&8) continue;
							moves.push('i000 '+moveid);
							shownMoves[moveid] = (shownMoves[moveid]|8);
						}
					}
				}
			}
		}
		for (var moveid in learnset) {
			if (moveid in shownMoves) continue;
			moves.push('j000 '+moveid);
			shownMoves[moveid] = (shownMoves[moveid]|1);
		}
		moves.sort();
		var last = '', lastChanged = false;
		for (var i=0, len=moves.length; i<len; i++) {
			var move = BattleMovedex[moves[i].substr(5)];
			if (!move) {
				buf += '<li><pre>error: "'+moves[i]+'"</pre></li>';
			} else {
				if ((lastChanged = (moves[i].substr(0,1) !== last))) {
					last = moves[i].substr(0,1);
				}
				var desc = '';
				switch (last) {
				case 'a': // level-up move
					if (lastChanged) buf += '<li class="resultheader"><h3>Level-up</h3></li>';
					desc = moves[i].substr(1,3) === '001' ? '&ndash;' : '<small>L</small>'+(Number(moves[i].substr(1,3))||'?');
					break;
				case 'b': // prevo1 level-up move
					if (lastChanged) buf += '<li class="resultheader"><h3>Level-up from '+BattlePokedex[prevo1].species+'</h3></li>';
					desc = moves[i].substr(1,3) === '001' ? '&ndash;' : '<small>L</small>'+(Number(moves[i].substr(1,3))||'?');
					break;
				case 'c': // prevo2 level-up move
					if (lastChanged) buf += '<li class="resultheader"><h3>Level-up from '+BattlePokedex[prevo2].species+'</h3></li>';
					desc = moves[i].substr(1,3) === '001' ? '&ndash;' : '<small>L</small>'+(Number(moves[i].substr(1,3))||'?');
					break;
				case 'd': // tm/hm
					if (lastChanged) buf += '<li class="resultheader"><h3>TM/HM</h3></li>';
					desc = '<span class="itemicon" style="margin-top:-3px;'+Tools.getItemIcon({spritenum:508})+'"></span>';
					break;
				case 'e': // tutor
					if (lastChanged) buf += '<li class="resultheader"><h3>Tutor</h3></li>';
					desc = '<img src="//play.pokemonshowdown.com/sprites/tutor.png" style="margin-top:-4px;opacity:.7" width="27" height="26" alt="T" />';
					break;
				case 'f': // egg move
					if (lastChanged) buf += '<li class="resultheader"><h3>Egg</h3></li>';
					desc = '<span class="pokemonicon" style="margin-top:-3px;'+Tools.getIcon('egg')+'"></span>';
					break;
				case 'g': // prevo1 egg move
					if (lastChanged) buf += '<li class="resultheader"><h3>Egg from '+BattlePokedex[prevo1].species+'</h3></li>';
					desc = '<span class="pokemonicon" style="margin-top:-3px;'+Tools.getIcon('egg')+'"></span>';
					break;
				case 'h': // prevo2 egg move
					if (lastChanged) buf += '<li class="resultheader"><h3>Egg from '+BattlePokedex[prevo2].species+'</h3></li>';
					desc = '<span class="pokemonicon" style="margin-top:-3px;'+Tools.getIcon('egg')+'"></span>';
					break;
				case 'i': // event
					if (lastChanged) buf += '<li class="resultheader"><h3>Event</h3></li>';
					desc = '!';
					break;
				case 'j': // pastgen
					if (lastChanged) buf += '<li class="resultheader"><h3>Past generation only</h3></li>';
					desc = '...';
					break;
				}
				buf += BattleSearch.renderTaggedMoveRow(move, desc);
			}
		}
		this.$('.utilichart').html(buf);
	},
	renderDetails: function() {
		var pokemon = Tools.getTemplate(this.id);
		var buf = '';

		// flavor
		buf += '<li class="resultheader"><h3>Flavor</h3></li>';
		buf += '<li><dl><dt>Color:</dt><dd>'+pokemon.color+'</dd></dl></li>';

		// animated gen 6
		buf += '<li class="resultheader"><h3>Animated Gen 6 sprites</h3></li>';

		buf += '<li class="content"><table class="sprites"><tr><td><img src="//play.pokemonshowdown.com/sprites/xyani/'+pokemon.spriteid+'.gif" /></td>';
		buf += '<td><img src="//play.pokemonshowdown.com/sprites/xyani-shiny/'+pokemon.spriteid+'.gif" /></td></table>';
		buf += '<table class="sprites"><tr><td><img src="//play.pokemonshowdown.com/sprites/xyani-back/'+pokemon.spriteid+'.gif" /></td>';
		buf += '<td><img src="//play.pokemonshowdown.com/sprites/xyani-back-shiny/'+pokemon.spriteid+'.gif" /></td></table>';

		buf += '<div style="clear:left"></div></li>';

		// cry
		buf += '<li class="resultheader"><h3>Cry</h3></li>';

		var num = ''+pokemon.num;
		num = (num.length<=2?'0':'')+(num.length<=1?'0':'')+num;
		buf += '<li class="content"><audio src="//play.pokemonshowdown.com/audio/cries/'+num+'.wav" controls="controls"><a href="//play.pokemonshowdown.com/audio/cries/'+num+'.wav">Play</a></audio></li>';

		// still gen 5
		buf += '<li class="resultheader"><h3>Gen 5 Sprites</h3></li>';
		buf += '<li class="content"><table class="sprites"><tr><td><img src="//play.pokemonshowdown.com/sprites/bw/'+pokemon.spriteid+'.png" /></td>';
		buf += '<td><img src="//play.pokemonshowdown.com/sprites/bw-shiny/'+pokemon.spriteid+'.png" /></td></table>';
		buf += '<table class="sprites"><tr><td><img src="//play.pokemonshowdown.com/sprites/bw-back/'+pokemon.spriteid+'.png" /></td>';
		buf += '<td><img src="//play.pokemonshowdown.com/sprites/bw-back-shiny/'+pokemon.spriteid+'.png" /></td></table>';

		buf += '<div style="clear:left"></div></li>';

		// animated gen 5
		if (pokemon.gen < 6) {
			buf += '<li class="resultheader"><h3>Animated Gen 5 sprites</h3></li>';

			buf += '<li class="content"><table class="sprites"><tr><td><img src="//play.pokemonshowdown.com/sprites/bwani/'+pokemon.spriteid+'.gif" /></td>';
			buf += '<td><img src="//play.pokemonshowdown.com/sprites/bwani-shiny/'+pokemon.spriteid+'.gif" /></td></table>';
			buf += '<table class="sprites"><tr><td><img src="//play.pokemonshowdown.com/sprites/bwani-back/'+pokemon.spriteid+'.gif" /></td>';
			buf += '<td><img src="//play.pokemonshowdown.com/sprites/bwani-back-shiny/'+pokemon.spriteid+'.gif" /></td></table>';

			buf += '<div style="clear:left"></div></li>';
		}

		this.$('.utilichart').html(buf);
	},
	getStat: function(baseStat, isHP, level, iv, ev, natureMult) {
		if (isHP) {
			if (baseStat === 1) return 1;
			return Math.floor(Math.floor(2*baseStat+(iv||0)+Math.floor((ev||0)/4)+100)*level / 100 + 10);
		}
		var val = Math.floor(Math.floor(2*baseStat+(iv||0)+Math.floor((ev||0)/4))*level / 100 + 5);
		if (natureMult && !isHP) val *= natureMult;
		return Math.floor(val);
	}
});
var PokedexItemPanel = PokedexResultPanel.extend({
	initialize: function(id) {
		var item = Tools.getItem(id);
		this.shortTitle = item.name;

		var buf = '<div class="pfx-body dexentry">';
		buf += '<a href="/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><span class="itemicon" style="'+Tools.getItemIcon(item)+'"></span> <a href="/items/'+id+'" data-target="push" class="subtle">'+item.name+'</a></h1>';
		buf += '<p>'+Tools.escapeHTML(item.desc||item.shortDesc)+'</p>';
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
var PokedexMovePanel = PokedexResultPanel.extend({
	initialize: function(id) {
		var move = Tools.getMove(id);
		this.id = id;
		this.shortTitle = move.name;

		var buf = '<div class="pfx-body dexentry">';

		buf += '<a href="/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><a href="/moves/'+id+'" data-target="push" class="subtle">'+move.name+'</a></h1>';

		if (move.id === 'magikarpsrevenge') buf += '<div class="warning"><strong>Note:</strong> Made for testing on Pok&eacute;mon Showdown, not a real move.</div>';
		else if (move.isNonstandard) buf += '<div class="warning"><strong>Note:</strong> This is a made-up move by <a href="http://www.smogon.com/cap/" target="_blank">Smogon CAP</a>.</div>';

		buf += '<dl class="movetypeentry">';
		buf += '<dt>Type:</dt> <dd>';
		buf += '<a class="type '+toId(move.type)+'" href="/types/'+toId(move.type)+'" data-target="push">'+move.type+'</a> ';
		buf += '<a class="type '+toId(move.category)+'" href="/categories/'+toId(move.category)+'" data-target="push">'+move.category+'</a>';
		buf += '</dd></dl>';

		if (move.category !== 'Status') {
			buf += '<dl class="powerentry"><dt>Base power:</dt> <dd><strong>'+(move.basePower||'&mdash;')+'</strong></dd></dl>';
		}
		buf += '<dl class="accuracyentry"><dt>Accuracy:</dt> <dd>'+(move.accuracy && move.accuracy!==true?move.accuracy+'%':'&mdash;')+'</dd></dl>';
		buf += '<dl class="ppentry"><dt>PP:</dt> <dd>'+(move.pp)+(move.pp>1 ? ' <small class="minor">(max: '+(8/5*move.pp)+')</small>' : '')+'</dd>';
		buf += '</dl><div style="clear:left;padding-top:1px"></div>';

		if (move.priority > 1) {
			buf += '<p>Nearly always moves first <em>(priority +'+move.priority+')</em>.</p>';
		} else if (move.priority <= -1) {
			buf += '<p>Nearly always moves last <em>(priority &minus;'+(-move.priority)+')</em>.</p>';
		} else if (move.priority == 1) {
			buf += '<p>Usually moves first <em>(priority +'+move.priority+')</em>.</p>';
		}

		buf += '<p>'+Tools.escapeHTML(move.desc||move.shortDesc)+'</p>';

		if ('defrost' in move.flags) {
			buf += '<p><a class="subtle" href="/tags/defrost" data-target="push">The user thaws out</a> if it is frozen.</p>';
		}
		if (!('protect' in move.flags) && move.target !== 'self') {
			buf += '<p class="movetag"><a href="/tags/bypassprotect" data-target="push">Bypasses Protect</a> <small>(bypasses <a class="subtle" href="/moves/protect" data-target="push">Protect</a>, <a class="subtle" href="/moves/detect" data-target="push">Detect</a>, <a class="subtle" href="/moves/kingsshield" data-target="push">King\'s Shield</a>, and <a class="subtle" href="/moves/spikyshield" data-target="push">Spiky Shield</a>)</small></p>';
		}
		if ('authentic' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/bypasssub" data-target="push">Bypasses Substitute</a> <small>(bypasses but does not break a <a class="subtle" href="/moves/substitute" data-target="push">Substitute</a>)</small></p>';
		}
		if (!('protect' in move.flags) && move.target !== 'self' && move.category === 'Status') {
			buf += '<p class="movetag"><a href="/tags/nonreflectable" data-target="push">&#x2713; Nonreflectable</a> <small>(can\'t be bounced by <a class="subtle" href="/moves/magiccoat" data-target="push">Magic Coat</a> or <a class="subtle" href="/abilities/magicbounce" data-target="push">Magic Bounce</a>)</small></p>';
		}
		if (!('mirror' in move.flags) && move.target !== 'self') {
			buf += '<p class="movetag"><a href="/tags/nonmirror" data-target="push">&#x2713; Nonmirror</a> <small>(can\'t be copied by <a class="subtle" href="/moves/mirrormove" data-target="push">Mirror Move</a>)</small></p>';
		}
		if (!('snatch' in move.flags) && (move.target === 'self' || move.target === 'allyTeam' || move.target === 'adjacentAllyOrSelf')) {
			buf += '<p class="movetag"><a href="/tags/nonsnatchable" data-target="push">&#x2713; Nonsnatchable</a> <small>(can\'t be copied by <a class="subtle" href="/moves/snatch" data-target="push">Snatch</a>)</small></p>';
		}

		if ('contact' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/contact" data-target="push">&#x2713; Contact</a> <small>(affected by many abilities like Iron Barbs and moves like Spiky Shield)</small></p>';
		}
		if ('sound' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/sound" data-target="push">&#x2713; Sound</a> <small>(bypasses <a class="subtle" href="/moves/substitute" data-target="push">Substitute</a>, doesn\'t affect <a class="subtle" href="/abilities/soundproof" data-target="push">Soundproof</a> pokemon)</small></p>';
		}
		if ('powder' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/powder" data-target="push">&#x2713; Powder</a> <small>(doesn\'t affect <a class="subtle" href="/types/grass" data-target="push">Grass</a>-types, <a class="subtle" href="/abilities/overcoat" data-target="push">Overcoat</a> pokemon, and <a class="subtle" href="/items/safetygoggles" data-target="push">Safety Goggles</a> holders)</small></p>';
		}
		if ('punch' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/fist" data-target="push">&#x2713; Fist</a> <small>(boosted by <a class="subtle" href="/abilities/ironfist" data-target="push">Iron Fist</a>)</small></p>';
		}
		if ('pulse' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/pulse" data-target="push">&#x2713; Pulse</a> <small>(boosted by <a class="subtle" href="/abilities/megalauncher" data-target="push">Mega Launcher</a>)</small></p>';
		}
		if ('bite' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/bite" data-target="push">&#x2713; Bite</a> <small>(boosted by <a class="subtle" href="/abilities/strongjaw" data-target="push">Strong Jaw</a>)</small></p>';
		}
		if ('bullet' in move.flags) {
			buf += '<p class="movetag"><a href="/tags/ballistic" data-target="push">&#x2713; Ballistic</a> <small>(doesn\'t affect <a class="subtle" href="/abilities/bulletproof" data-target="push">Bulletproof</a> pokemon)</small></p>';
		}

		// distribution
		buf += '<ul class="utilichart metricchart nokbd">';
		buf += '</ul>';

		buf += '</div>';

		this.html(buf);

		var self = this;
		setTimeout(this.renderDistribution.bind(this));
	},
	getDistribution: function() {
		var moveid = this.id;
		if (this.results) return this.results;
		var results = [];
		for (var pokemonid in BattleLearnsets) {
			if (BattlePokedex[pokemonid].isNonstandard) continue;
			var sources = BattleLearnsets[pokemonid].learnset[moveid];
			if (!sources) continue;
			if (typeof sources === 'string') sources = [sources];
			var atLeastOne = false;
			for (var i=0, len=sources.length; i<len; i++) {
				var source = sources[i];
				if (source.substr(0,2) === '6L') {
					results.push('a'+sourcePad(source)+pokemonid);
					atLeastOne = true;
				} else if (source === '6M') {
					results.push('b000 '+pokemonid);
					atLeastOne = true;
				} else if (source === '6T') {
					results.push('c000 '+pokemonid);
					atLeastOne = true;
				} else if (source === '6E') {
					results.push('d000 '+pokemonid);
					atLeastOne = true;
				} else if (source.charAt(1) === 'S' && atLeastOne !== 'S') {
					results.push('e000 '+pokemonid);
					atLeastOne = 'S';
				}
			}
			if (!atLeastOne) {
				results.push('f000 '+pokemonid);
			}
		}
		results.sort();
		var last = '', lastChanged = false, streamLoading = false;
		for (var i=0; i<results.length; i++) {
			if (results[i].charAt(0) !== last) {
				results.splice(i, 0, results[i].charAt(0).toUpperCase());
				i++;
			}
			last = results[i].charAt(0);
		}
		return this.results = results;
	},
	renderDistribution: function() {
		var results = this.getDistribution();
		this.$chart = this.$('.utilichart');

		var streamLoading = false;
		if (results.length > 1600/33) {
			this.streamLoading = streamLoading = true;
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
		var template = BattlePokedex[results[i].substr(5)];
		if (!template) {
			switch (results[i].charAt(0)) {
			case 'A': // level-up move
				return '<h3>Level-up</h3>';
				break;
			case 'B': // tm/hm
				return '<h3>TM/HM</h3>';
				break;
			case 'C': // tutor
				return '<h3>Tutor</h3>';
				break;
			case 'D': // egg move
				return '<h3>Egg</h3>';
				break;
			case 'E': // event
				return '<h3>Event</h3>';
				break;
			case 'F': // past gen
				return '<h3>Past generation only</h3>';
				break;
			}
			return '<pre>error: "'+results[i]+'"</pre>';
		} else if (offscreen) {
			return ''+template.species+' '+template.abilities['0']+' '+(template.abilities['1']||'')+' '+(template.abilities['H']||'')+'';
		} else {
			var desc = '';
			switch (results[i].charAt(0)) {
			case 'a': // level-up move
				desc = results[i].substr(1,3) === '001' ? '&ndash;' : '<small>L</small>'+(Number(results[i].substr(1,3)) || '?');
				break;
			case 'b': // tm/hm
				desc = '<span class="itemicon" style="margin-top:-3px;'+Tools.getItemIcon({spritenum:508})+'"></span>';
				break;
			case 'c': // tutor
				desc = '<img src="//play.pokemonshowdown.com/sprites/tutor.png" style="margin-top:-4px;opacity:.7" width="27" height="26" alt="T" />';
				break;
			case 'd': // egg move
				desc = '<span class="pokemonicon" style="margin-top:-3px;'+Tools.getIcon('egg')+'"></span>';
				break;
			case 'e': // event
				desc = '!';
				break;
			case 'f': // past generation
				desc = '...';
				break;
			}
			return BattleSearch.renderTaggedPokemonRowInner(template, desc);
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

		if (fullUpdate || start < this.start - rowFit-30 || end > this.end + rowFit+30) {
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

		buf += '</dl>'

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
			desc: 'Affected by a variety of moves, abilities, and items.</p><p>Moves affected by contact moves include: Spiky Shield, King\'s Shield. Abilities affected by contact moves include: Iron Barbs, Rough Skin, Gooey, Flame Body, Static, Tough Claws. Items affected by contact moves include: Eject Button, Rocky Helmet.'
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

		var self = this;
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

		var streamLoading = false;
		if (results.length > 1600/33) {
			this.streamLoading = streamLoading = true;
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

		if (fullUpdate || start < this.start - rowFit-30 || end > this.end + rowFit+30) {
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
			buf += '<p>All Pok&eacute;mon in either the '+this.table[ids[0]].name+' or '+this.table[ids[1]].name+' egg group.</p>';
		} else {
			buf += '<p>'+this.table[ids[0]].desc+'</p>';
		}

		// distribution
		buf += '<h3>Basic '+names+' pokemon</h3>';
		buf += '<ul class="utilichart metricchart nokbd">';
		buf += '</ul>';

		buf += '</div>';

		this.html(buf);

		var self = this;
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
			if (!eggGroups || BattlePokedex[pokemonid].forme || BattlePokedex[pokemonid].prevo) continue;
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

		var streamLoading = false;
		if (results.length > 1600/33) {
			this.streamLoading = streamLoading = true;
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
			return BattleSearch.renderTaggedPokemonRowInner(template, '<span class="pokemonicon" style="margin-top:-3px;'+Tools.getIcon('egg')+'"></span>');
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

		if (fullUpdate || start < this.start - rowFit-30 || end > this.end + rowFit+30) {
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
			bl: "BL",
			bl2: "BL2",
			bl3: "BL3",
			bl4: "BL4"
		};
		var name = tierTable[id];
		this.id = id;
		this.shortTitle = name;

		var buf = '<div class="pfx-body dexentry">';
		buf += '<a href="/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Pok&eacute;dex</a>';
		buf += '<h1><a href="/tiers/'+id+'" data-target="push" class="subtle">'+name+'</a></h1>';

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
		var buf = '<div class="pfx-body"><form class="pokedex">';
		buf += '<h1><a href="/">Pok&eacute;dex</a></h1>';
		if (this.fragment !== 'pokemon/' && this.fragment !== 'moves/' && this.fragment !== '') {
			if (this.fragment.slice(-15) !== 'testclient.html') {
				buf += '<p><strong style="color: red">Not found: ' + this.fragment + '</strong></p>';
			}
			this.fragment = '';
		}
		buf += '<ul class="tabbar centered" style="margin-bottom: 18px"><li><button class="button nav-first' + (this.fragment === '' ? ' cur' : '') + '" value="">Search</button></li>';
		buf += '<li><button class="button' + (this.fragment === 'pokemon/' ? ' cur' : '') + '" value="pokemon/">Pok&eacute;mon</button></li>';
		buf += '<li><button class="button nav-last' + (this.fragment === 'moves/' ? ' cur' : '') + '" value="moves/">Moves</button></li></ul>';
		buf += '<div class="searchboxwrapper"><input class="textbox searchbox" type="search" name="q" value="' + Tools.escapeHTML(this.$('.searchbox').val() || '') + '" autocomplete="off" autofocus placeholder="Search Pok&eacute;mon, moves, abilities, items, types, or more" /></div>';
		if (this.fragment === '') {
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
			if (this.fragment === 'pokemon/') {
				search.qType = 'pokemon';
				$searchbox.attr('placeholder', 'Search pokemon OR filter by type, move, ability, egg group');
				this.$('.buttonbar').remove();
			} else if (this.fragment === 'moves/') {
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
		this.$('.searchbox').focus();
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

var App = Panels.App.extend({
	topbarView: Topbar,
	backButtonPrefix: '<i class="fa fa-chevron-left"></i> ',
	states2: {
		'pokemon/:pokemon': PokedexPokemonPanel,
		'moves/:move': PokedexMovePanel,
		'items/:item': PokedexItemPanel,
		'abilities/:ability': PokedexAbilityPanel,
		'types/:type': PokedexTypePanel,
		'categories/:category': PokedexCategoryPanel,
		'tags/:tag': PokedexTagPanel,
		'egggroups/:egggroup': PokedexEggGroupPanel,
		'tiers/:egggroup': PokedexTierPanel,

		'': PokedexSearchPanel,
		'pokemon/': PokedexSearchPanel,
		'moves/': PokedexSearchPanel,
		':q': PokedexSearchPanel
	},
	initialize: function() {
		this.routePanel('*path', PokedexSearchPanel); // catch-all default

		for (var i in this.states2) {
			this.routePanel(i, this.states2[i]);
		}
	}
});
var app = new App();
