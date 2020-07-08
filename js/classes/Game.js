import config from '../config/game.js';
import data from '../config/save-data.js';
import tickers from '../config/tickers.js';
import resources from '../config/resources.js';

export class Game
{
	constructor()
	{
		Object.keys(config).forEach((key) => this[key] = config[key]);
		this.data = data;
		this.resources = resources;
		this.tickers = tickers;

		Object.keys(resources).forEach((resource) => {
			this.data.resource_maximums[resource] = this.resources[resource].max;
		})
	}

	purchaseTicker(type)
	{
		let ticker = game.tickers[type];
		let purchase_costs = ticker.getPurchaseCosts(this.data);
		let can_afford = true;

		Object.keys(purchase_costs).forEach((cost) => {
			if (this.data.resources[cost] === undefined || this.data.resources[cost] < purchase_costs[cost]) {
				can_afford = false;
			}
		});

		if (!can_afford) return false;

		game.addTicker(type);
		Object.keys(purchase_costs).forEach((cost) => {
			this.data.resources[cost] = this.data.resources[cost] - purchase_costs[cost];
		});

		return true;
	}

	addTicker(type)
	{
		if (this.data.tickers[type] === undefined) this.data.tickers[type] = 0;
		this.data.tickers[type] = this.data.tickers[type] + 1;
		this.updateTickers();
		return this;
	}

	getResourcesPerTick()
	{
		let resources_per_tick = {};

		Object.keys(this.data.tickers).forEach((ticker_type) => {
			let new_resources_per_tick = this.tickers[ticker_type].getResourcesPerTick();

			Object.keys(new_resources_per_tick).forEach((resource) => {
				if (resources_per_tick[resource] === undefined) resources_per_tick[resource] = 0;
				resources_per_tick[resource] = resources_per_tick[resource] + (new_resources_per_tick[resource] * this.data.tickers[ticker_type]);
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
			if (elem_amount) elem_amount.innerHTML = this.data.resources[resource].toFixed(0);

			let elem_per_tick = document.getElementById('resources_'+ resource + '_per_tick');
			if (elem_per_tick) {
				if (resources_per_tick[resources_per_tick] === undefined) resources_per_tick[resources_per_tick] = 0;
				let rpt = (resources_per_tick[resource] * (1000 / this.tick_interval));
				if (isNaN(rpt)) rpt = 0;
				elem_per_tick.innerHTML = rpt.toFixed() + '/s';
			}

			if (this.data.resource_maximums[resource] !== undefined) {
				let elem_per_tick = document.getElementById('resources_'+ resource + '_max');
				if (elem_per_tick) elem_per_tick.innerHTML = this.data.resource_maximums[resource];
			}

			// update percentages and progress bars
			let total = this.data.resource_maximums[resource];
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
		Object.keys(this.tickers).forEach((ticker) => {

			// update amount owned
			let elem = document.getElementById('tickers_' + ticker + '_amount');
			if (elem) {
				elem.innerHTML = ((this.data.tickers[ticker] !== undefined)
					? this.data.tickers[ticker]
					: 0);
			}

			// update things based on purchase cost
			let costs = this.tickers[ticker].getPurchaseCosts(this.data);
			let can_purchase = true;

			Object.keys(costs).forEach((resource) => {
				if (!(this.data.resources[resource] !== undefined && this.data.resources[resource] >= costs[resource])) {
					can_purchase = false;
				}
			});

			elem = document.getElementById('tickers_' + ticker + '_cost');
			if (elem) {
				let str = '<ul>';
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

			elem = document.getElementById('tickers_' + ticker + '_purchase_btn');
			if (elem) elem.disabled = !can_purchase;
		});
	}

}