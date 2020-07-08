export function getPurchaseCosts(thing, number_owned)
{
	let purchase_costs = {};
	//let number_owned = (data.tickers[this.internal_name] !== undefined) ? data.tickers[this.internal_name] : 0;

	thing.purchase_costs.forEach((cost) => {
		if (purchase_costs[cost.resource] === undefined) purchase_costs[cost.resource] = 0;
		let incremental_cost = Math.floor(cost.base_cost * Math.pow(cost.multiplier, number_owned));
		purchase_costs[cost.resource] = purchase_costs[cost.resource] + incremental_cost;
	});

	return purchase_costs;
}
