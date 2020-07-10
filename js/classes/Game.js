import config from '../config/game.js';
import data from '../config/save-data.js';
import tickers from '../config/tickers.js';
import resources from '../config/resources.js';

export class Game
{
	constructor()
	{
		// defaults, then overridden by config/game.js
		this.tick_interval = 1000;
		this.animation_interval = 1000;
		Object.keys(config).forEach((key) => this[key] = config[key]);

		// assign values from config data
		this.data = data;
		this.resources = resources;
		this.tickers = tickers;

		Object.keys(resources).forEach((resource) => {
			this.data.resource_maximums[resource] = this.resources[resource].max;
		})
	}

	tick()
	{
		Object.keys(this.data.tickers).forEach((tickers_type) => {
			for (let i = 0; i < this.data.tickers[tickers_type]; i++) {
				this.tickers[tickers_type].tick(this.data, this);
			}
		});
	}

	canAffordThing(thing)
	{
		let purchase_costs = thing.getPurchaseCosts(this.data);
		let can_afford = true;

		Object.keys(purchase_costs).forEach((cost) => {
			if (this.data.resources[cost] === undefined || this.data.resources[cost] < purchase_costs[cost]) {
				can_afford = false;
			}
		});

		return can_afford;
	}

	purchaseTicker(type)
	{
		let ticker = this.tickers[type];
		if (!this.canAffordThing(ticker)) return false;
		let purchase_costs = ticker.getPurchaseCosts(this.data);

		Object.keys(purchase_costs).forEach((cost) => {
			this.data.resources[cost] = this.data.resources[cost] - purchase_costs[cost];
		});

		this.addTicker(type);
		return true;
	}

	purchaseTickerUpgrade(ticker_type, upgrade_type)
	{
		let ticker = this.tickers[ticker_type];
		let upgrade = ticker.upgrades[upgrade_type];

		// must have at least one of the parent ticker to upgrade
		if (this.data.tickers[ticker_type] === undefined || this.data.tickers[ticker_type] === 0) return false;

		// make sure we don't allow buying too many
		let number_owned = (this.data.ticker_upgrades[upgrade_type] !== undefined) ? this.data.ticker_upgrades[upgrade_type] : 0;
		if (number_owned >= upgrade.getMaximumPurchases()) return false;

		if (!this.canAffordThing(upgrade)) return false;
		let purchase_costs = upgrade.getPurchaseCosts(this.data);

		Object.keys(purchase_costs).forEach((cost) => {
			this.data.resources[cost] = this.data.resources[cost] - purchase_costs[cost];
		});

		game.addTickerUpgrade(upgrade_type);
		return true;
	}


	addTicker(type)
	{
		if (this.data.tickers[type] === undefined) this.data.tickers[type] = 0;
		this.data.tickers[type] = this.data.tickers[type] + 1;
		this.updateTickers();
		return this;
	}

	removeTicker(type)
	{
		if (this.data.tickers[type] === undefined) return this;
        this.data.tickers[type] = this.data.tickers[type] - 1;
		if (this.data.tickers[type] < 0) this.data.tickers[type] = 0;
        this.updateTickers();
        return this;
	}

	addTickerUpgrade(type)
	{
		if (this.data.ticker_upgrades[type] === undefined) this.data.ticker_upgrades[type] = 0;
		this.data.ticker_upgrades[type] = this.data.ticker_upgrades[type] + 1;
		this.updateTickers();
		return this;
	}

	getResourceMaximum(resource_index)
	{
		let maximum = (data.resource_maximums[resource_index] !== undefined) ? data.resource_maximums[resource_index] : 0;

		Object.keys(this.data.tickers).forEach((ticker_index) => {
			if (this.data.tickers[ticker_index] === 0) return;

			let ticker = this.tickers[ticker_index];
			let number_of_tickers = this.data.tickers[ticker_index];

			Object.keys(ticker.upgrades).forEach((upgrade_index) => {
				let upgrade = ticker.upgrades[upgrade_index];
				let number_of_upgrades = ((this.data.ticker_upgrades[upgrade_index] !== undefined)
					? this.data.ticker_upgrades[upgrade_index]
					: 0
				);

				if (upgrade.getResource() !== resource_index) return;
				let bonus = ((upgrade.getMaximumFlatBonus() !== undefined) ? upgrade.getMaximumFlatBonus() : 0);
				bonus = bonus * number_of_upgrades;

				//console.log(resource_index + ':' + bonus);
				maximum = maximum + bonus * number_of_tickers;
			});
		});

		return maximum;
	}



	getResourcesPerTick()
	{
		let resources_per_tick = {};

		Object.keys(this.data.tickers).forEach((ticker_type) => {
			let new_resources_per_tick = this.tickers[ticker_type].getResourcesPerTick(this.data, this);

			Object.keys(new_resources_per_tick).forEach((resource) => {
				if (resources_per_tick[resource] === undefined) resources_per_tick[resource] = 0;

				resources_per_tick[resource] = resources_per_tick[resource] + (new_resources_per_tick[resource] * this.data.tickers[ticker_type]);

				// move this maximums check out to the _game_ level, Tickers shouldn't care
				if (data.resources[resource] === this.getResourceMaximum(resource)) {
					resources_per_tick[resource] = 0;
				}

			});
		});

		return resources_per_tick;
	};


	getResourcePerTick(resource)
	{
		let resources_per_tick = this.getResourcesPerTick();
		return (resources_per_tick[resource] !== undefined) ? resources_per_tick[resource] : 0;
	}


	getTicksUntilResourceAcquired(resource, goal)
	{
		let gained_per_tick = this.getResourcePerTick(resource);
		if (gained_per_tick <= 0 || game.data.resources[resource] === undefined) return false;

		let left_to_goal = goal - this.data.resources[resource];
		if (left_to_goal <= 0) return 0;

		return left_to_goal / gained_per_tick;
	}


	getSecondsUntilResourceAcquired(resource, goal)
	{
		let ticks = this.getTicksUntilResourceAcquired(resource, goal);
		if (ticks === false) return false;
		return ticks / (1000 / this.tick_interval);
	}

	getResourceName(resource)
	{
		return (this.resources[resource] !== undefined && this.resources[resource].name !== undefined)
			? this.resources[resource].name
			: resource;
	}


	updateResources()
	{
		let resources_per_tick = this.getResourcesPerTick();

		Object.keys(this.data.resources).forEach((resource) => {
			let elem_amount = document.getElementById('resources_'+ resource + '_amount');
			if (elem_amount) elem_amount.innerHTML = this.data.resources[resource].toLocaleString(undefined, {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			});

			let elem_per_tick = document.getElementById('resources_'+ resource + '_per_tick');
			if (elem_per_tick) {
				if (resources_per_tick[resources_per_tick] === undefined) resources_per_tick[resources_per_tick] = 0;
				let rpt = (resources_per_tick[resource] * (1000 / this.tick_interval));
				if (isNaN(rpt)) rpt = 0;

				elem_per_tick.innerHTML = rpt.toLocaleString(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				}) + '/s';
			}

			if (this.data.resource_maximums[resource] !== undefined) {
				let elem_per_tick = document.getElementById('resources_'+ resource + '_max');
				if (elem_per_tick) elem_per_tick.innerHTML = this.getResourceMaximum(resource).toLocaleString(undefined, {
					minimumFractionDigits: 0,
					maximumFractionDigits: 0
				});
			}

			// update percentages and progress bars
			let total = this.getResourceMaximum(resource);
			let width = ((this.data.resources[resource] / total) * 100);
			if (total === undefined) width = 100;

			let elem_percent = document.getElementById('resources_' + resource + '_percent_owned');
			if (elem_percent) elem_percent.innerHTML = width.toFixed(2) + '%';

			let elem_progress = document.getElementById('resources_' + resource + '_bar_inner');
			if (elem_progress) elem_progress.style.width = width.toFixed(2) + '%';

		});
	}


	updateTickers()
	{
		Object.keys(this.tickers).forEach((ticker_index) => {

			let ticker = this.tickers[ticker_index];
			this.updateThingPurchaseElements(ticker, 'tickers', this.data.tickers, false);

			Object.keys(ticker.upgrades).forEach((upgrade_index) => {
				let upgrade = ticker.upgrades[upgrade_index];
				let parents_owned = ((this.data.tickers[ticker_index] !== undefined) ? this.data.tickers[ticker_index] : 0);
				this.updateThingPurchaseElements(upgrade, 'ticker_upgrades', this.data.ticker_upgrades, parents_owned);
			});

		});
	}


	updateThingPurchaseElements(thing, element_prefix, data_storage, parents_owned)
	{
		element_prefix = element_prefix + '_';
		let thing_index = thing.internal_name;

		// update amount owned
		let elem = document.getElementById(element_prefix + thing_index + '_amount');
		if (elem) {
			elem.innerHTML = ((data_storage[thing_index] !== undefined)
				? data_storage[thing_index]
				: 0);
		}

		// update things based on purchase cost
		let costs = thing.getPurchaseCosts(this.data);
		let can_afford_whole_purchase = true;

		Object.keys(costs).forEach((resource) => {
			if (!(this.data.resources[resource] !== undefined && this.data.resources[resource] >= costs[resource])) {
				can_afford_whole_purchase = false;
			}
		});

		elem = document.getElementById(element_prefix + thing_index + '_cost');
		if (elem) {
			let str = ((can_afford_whole_purchase) ? '<ul class="can-afford">' : '<ul class="cannot-afford">');
			Object.keys(costs).forEach((resource) => {
				str += '<li>'
					+ ((this.data.resources[resource] !== undefined && this.data.resources[resource] >= costs[resource])
						? '<span class="can-afford">'
						: '<span class="cannot-afford">')
					+ this.getResourceName(resource) + ' x ' + costs[resource]
					+ '</span>'
					+ '</li>';
			});
			str += '</ul>';
			elem.innerHTML = str;
		}

		elem = document.getElementById(element_prefix + thing_index + '_purchase_btn');
		if (elem) {
			if (!can_afford_whole_purchase) {
				elem.disabled = true;
				elem.classList.add('disabled');
			} else {
				elem.disabled = false;
				elem.classList.remove('disabled');
			}
		}

		let number_owned = (data_storage[thing_index] !== undefined) ? data_storage[thing_index] : 0;
		let maximum_purchases = thing.getMaximumPurchases();
		let can_purchase_another = ((maximum_purchases !== false)
			? (number_owned < thing.getMaximumPurchases())
			: true
		);

		elem = document.getElementById(element_prefix + thing_index + '_container');
		if (elem) {
			if (parents_owned === false || parents_owned >= thing.getParentPurchasesRequired() && can_purchase_another) {
				elem.classList.add('available-for-purchase');
				elem.classList.remove('unavailable-for-purchase');
				elem.style.height = elem.offsetHeight + 'px';

			} else {
				elem.classList.add('unavailable-for-purchase');
				elem.classList.remove('available-for-purchase');
			}
		}

	}

}
