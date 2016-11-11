var Pokedex = Panels.App.extend({
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
		'tiers/:tier': PokedexTierPanel,
		'articles/:article': PokedexArticlePanel,

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
var pokedex = new Pokedex();
