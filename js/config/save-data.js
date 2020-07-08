/**
 * This data object contains all the save game data; it must be a simple object with no
 * methods, as it is serialised to and from LocalStorage.
 *
 * The values defined here are the defaults for a new game.
 */

export default
{
	'resources': {
		'cookies': 0,
		'goblin_snot': 0,
		'unicorn_shit': 0,
	},

	// you can (and should) leave this empty, as the defaults are populated from config/resources.js
	'resource_maximums': {},

	// which tickers and upgrades the player has purchased
	'tickers': {},
	'ticker_upgrades': {},
}
