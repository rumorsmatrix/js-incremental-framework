import {getPurchaseCosts} from './partials/purchasing.js';

export class TickerUpgrade
{
	constructor(internal_name) {
		this.internal_name = internal_name;
		this.purchase_costs = [];
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

}