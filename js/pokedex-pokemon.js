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
							} else if (template.evoLevel >= 3) {
								buf += '</td><td class="arrow"><span><abbr title="level ' + template.evoLevel + '">&rarr;</abbr></span></td><td>';
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
			if (pokemon.evoLevel && pokemon.evoLevel >= 3) {
				buf += '<div><small>Evolves from ' + Tools.getTemplate(pokemon.prevo).species + ' at level ' + pokemon.evoLevel + '</small></div>';
			}
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
			if (pokemon.requiredItem) {
				buf += '<div><small>Must hold <a href="/items/' + toId(pokemon.requiredItem) + '" data-target="push">' + pokemon.requiredItem + '</a></small></div>';
			}
		}
		buf += '</dd></dl>';

		if (pokemon.eggGroups) {
			buf += '<dl class="colentry"><dt>Egg groups:</dt><dd><span class="picon" style="margin-top:-12px;'+Tools.getPokemonIcon('egg')+'"></span><a href="/egggroups/'+pokemon.eggGroups.map(toId).join('+')+'" data-target="push">'+pokemon.eggGroups.join(', ')+'</a></dd></dl>';
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
		if (window.BattleFormatsData && BattleFormatsData[id] && BattleFormatsData[id].eventPokemon) {
			buf += '<ul class="tabbar"><li><button class="button nav-first cur" value="move">Moves</button></li><li><button class="button" value="details">Flavor</button></li><li><button class="button nav-last" value="events">Events</button></li></ul>';
		} else {
			buf += '<ul class="tabbar"><li><button class="button nav-first cur" value="move">Moves</button></li><li><button class="button nav-last" value="details">Flavor</button></li></ul>';
		}
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
		case 'events':
			this.renderEvents();
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
					desc = '<span class="picon" style="margin-top:-12px;'+Tools.getPokemonIcon('egg')+'"></span>';
					break;
				case 'g': // prevo1 egg move
					if (lastChanged) buf += '<li class="resultheader"><h3>Egg from '+BattlePokedex[prevo1].species+'</h3></li>';
					desc = '<span class="picon" style="margin-top:-12px;'+Tools.getPokemonIcon('egg')+'"></span>';
					break;
				case 'h': // prevo2 egg move
					if (lastChanged) buf += '<li class="resultheader"><h3>Egg from '+BattlePokedex[prevo2].species+'</h3></li>';
					desc = '<span class="picon" style="margin-top:-12px;'+Tools.getPokemonIcon('egg')+'"></span>';
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
	renderEvents: function() {
		var pokemon = Tools.getTemplate(this.id);
		var events = BattleFormatsData[this.id].eventPokemon;
		var buf = '';

		buf += '<li class="resultheader"><h3>Events</h3></li>';
		for (var i = 0; i < events.length; i++) {
			var event = events[i];
			buf += '<li><dl><dt>Gen ' + event.generation + ' event:</dt><dd><small>';
			buf += pokemon.species;
			if (event.gender) buf += ' (' + event.gender + ')';
			buf += '<br />';
			if (event.abilities) {
				buf += 'Ability: ' + event.abilities.map(function (ability) {
					return '<a href="/abilities/' + ability + '" class="subtle" data-target="push">' + Tools.getAbility(ability).name + '</a>';
				}).join(' or ') + '<br />';
			} else if (event.isHidden && pokemon.abilities['H']) {
				buf += 'Ability: <a href="/abilities/' + toId(pokemon.abilities['H']) + '" class="subtle" data-target="push">' + pokemon.abilities['H'] + '</a><br />';
			}
			if (event.level) buf += 'Level: ' + event.level + '<br />';
			if (event.shiny) buf += 'Shiny: Yes<br />';
			if (event.nature) buf += event.nature + ' Nature<br />';
			if (event.ivs) {
				buf += 'IVs: ';
				var firstIV = true;
				for (var iv in event.ivs) {
					if (!firstIV) buf += ' / ';
					buf += '' + event.ivs[iv] + ' ' + BattleStatNames[iv];
					firstIV = false;
				}
				buf += '<br />';
			}
			if (event.moves) {
				for (var j = 0; j < event.moves.length; j++) {
					var move = Tools.getMove(event.moves[j]);
					buf += '- <a href="/moves/' + move.id + '" class="subtle" data-target="push">' + move.name + '</a><br />';
				}
			}
			if (event.perfectIVs) {
				buf += '(at least ' + event.perfectIVs + ' perfect IVs)<br />';
			}
			buf += '</small></dd></dl></li>';
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
