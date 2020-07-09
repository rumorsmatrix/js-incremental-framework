import {getPurchaseCosts} from './partials/purchasing.js';

export class Ticker
{
	constructor(internal_name) {
		this.internal_name = internal_name;
		this.purchase_costs = [];
		this.maximum_purchases = false;
		this.resource_adjusters = [];
		this.upgrades = {};
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

	addUpgrade(upgrade)
	{
		this.upgrades[upgrade.internal_name] = upgrade;
		return this;
	}

	setMaximumPurchases(value)
	{
		this.maximum_purchases = value;
		return this;
	}

	getMaximumPurchases()
	{
		return this.maximum_purchases;
	}

	getResourcesPerTick(data)
	{
		let resources_per_tick = {};
		this.resource_adjusters.forEach((adjuster) => {
			if (resources_per_tick[adjuster.resource] === undefined) {
				resources_per_tick[adjuster.resource] = 0;
			}

			let amount = adjuster.getAmountPerTick(this.upgrades, data);
			resources_per_tick[adjuster.resource] = resources_per_tick[adjuster.resource] + amount;
		});

		return resources_per_tick;
	}

	getPurchaseCosts(data)
	{
		return getPurchaseCosts(this, ((data.tickers[this.internal_name] !== undefined) ? data.tickers[this.internal_name] : 0));
	}

	tick(data, game)
	{
		let diff = 0;
		this.resource_adjusters.forEach((adjuster) => diff += adjuster.apply(this.upgrades, data, game));
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

	getAmountPerTick(upgrades, data)
	{
		// start with the base amount this ResourceAdjuster provides
		let amount = this.amount_per_tick;

		// look for suitable upgrades
		Object.keys(data.ticker_upgrades).forEach((purchased_upgrade) => {
			if (data.ticker_upgrades[purchased_upgrade] > 0 && upgrades[purchased_upgrade] !== undefined) {

				// apply bonus from this matching upgrade
				let upgrade = upgrades[purchased_upgrade];
				let number_purchased = data.ticker_upgrades[purchased_upgrade];
				if (upgrade.resource === this.resource) {
					amount = amount + (upgrade.getFlatBonus() * number_purchased);
					if (upgrade.getMultiplier()) amount = amount * (upgrade.getMultiplier() * number_purchased);
				}
			}
		});

		return amount;
	}

	apply(upgrades, data, game)
	{
		if (data.resources[this.resource] === undefined) data.resources[this.resource] = 0;
		let amount = this.getAmountPerTick(upgrades, data);

		if (data.resource_maximums[this.resource] !== undefined) {
			let max = game.getResourceMaximum(this.resource);
			if ((data.resources[this.resource] + amount) >= max) {
				amount = max - data.resources[this.resource];
			}
		}

		data.resources[this.resource] = data.resources[this.resource] + amount;
		return amount;
	}
}


export class PurchaseCost
{
	constructor(resource, base_cost, multiplier)
	{
		this.resource = resource;
		this.base_cost = base_cost;
		// noinspection JSUnusedGlobalSymbols
		this.multiplier = multiplier;
	}
}
