import {getPurchaseCosts} from './partials/purchasing.js';

export class TickerUpgrade
{
	constructor(internal_name) {
		this.internal_name = internal_name;
		this.purchase_costs = [];
		this.flat_bonus = 0;
		this.multiplier = 0;
	}

	addPurchaseCost(adjuster)
	{
		this.purchase_costs.push(adjuster);
		return this;
	}

	getPurchaseCosts(data)
	{
		return getPurchaseCosts(this,
			((data.ticker_upgrades[this.internal_name] !== undefined) ? data.ticker_upgrades[this.internal_name] : 0));
	}

	setFlatBonus(bonus)
	{
		this.flat_bonus = bonus;
		return this;
	}

	getFlatBonus(bonus)
	{
		return this.flat_bonus;
	}

	setMultiplier(multiplier)
	{
		this.multiplier = multiplier;
		return this;
	}

	getMultiplier()
	{
		return this.multiplier;
	}

}