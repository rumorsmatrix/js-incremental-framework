import {getPurchaseCosts} from './partials/purchasing.js';

export class TickerUpgrade
{
	constructor(internal_name) {
		this.internal_name = internal_name;
		this.purchase_costs = [];
		this.maximum_purchases = 1;
		this.parents_required = 1;
		this.flat_bonus = 0;
		this.multiplier = 0;
		this.maximum_flat_bonus = 0;
		this.resource = '';
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

	setMaximumPurchases(value)
	{
		this.maximum_purchases = value;
		return this;
	}

	getMaximumPurchases()
	{
		return this.maximum_purchases;
	}

	setParentPurchasesRequired(value)
	{
		this.parents_required = value;
		return this;
	}

	getParentPurchasesRequired()
	{
		return this.parents_required;
	}

	applyToResource(resource)
	{
		this.resource = resource;
		return this;
	}

	getResource()
	{
		return this.resource;
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

	setMaximumFlatBonus(bonus)
	{
		this.maximum_flat_bonus = bonus;
		return this;
	}

	getMaximumFlatBonus(bonus)
	{
		return this.maximum_flat_bonus;
	}

}
