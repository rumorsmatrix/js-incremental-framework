import {getPurchaseCosts} from './partials/purchasing.js';

export class Ticker
{

	constructor(internal_name) {
		this.internal_name = internal_name;
		this.purchase_costs = [];
		this.resource_adjusters = [];
	}

	addPurchaseCost(adjuster)
	{
		this.purchase_costs.push(adjuster);
		return this;
	}

	addResourceAdjuster(adjuster)
	{
		this.resource_adjusters.push(adjuster);
		return this;
	}

	getResourcesPerTick()
	{
		let resources_per_tick = {};
		this.resource_adjusters.forEach((adjuster) => {
			if (resources_per_tick[adjuster.resource] === undefined) {
				resources_per_tick[adjuster.resource] = 0;
			}

			let amount = adjuster.amount_per_tick;
			if (game.data.resources[adjuster.resource] === game.data.resource_maximums[adjuster.resource]) amount = 0;
			resources_per_tick[adjuster.resource] = resources_per_tick[adjuster.resource] + amount;
		});

		return resources_per_tick;
	}

	getPurchaseCosts(data)
	{
		return getPurchaseCosts(this, ((data.tickers[this.internal_name] !== undefined) ? data.tickers[this.internal_name] : 0));
	}

	tick(data)
	{
		let diff = 0;
		this.resource_adjusters.forEach((adjuster) => diff += adjuster.apply(data));
		return diff;
	}

}


export class ResourceAdjuster
{
	constructor(resource, amount_per_tick)
	{
		this.resource = resource;
		this.amount_per_tick = amount_per_tick;
	}

	apply()
	{
		if (game.data.resources[this.resource] === undefined) game.data.resources[this.resource] = 0;
		let amount = this.amount_per_tick;
		if (game.data.resource_maximums[this.resource] !== undefined) {
			let max = game.data.resource_maximums[this.resource];

			if ((game.data.resources[this.resource] + this.amount_per_tick) >= max) {
				amount = max - game.data.resources[this.resource];
			}
		}

		game.data.resources[this.resource] = game.data.resources[this.resource] + amount;
		return amount;
	}
}


export class PurchaseCost
{
	constructor(resource, base_cost, multiplier)
	{
		this.resource = resource;
		this.base_cost = base_cost;
		this.multiplier = multiplier;
	}
}