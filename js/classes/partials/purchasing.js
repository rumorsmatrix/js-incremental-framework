export function getPurchaseCosts(thing, number_owned)
{
	let purchase_costs = {};

	thing.purchase_costs.forEach((cost) => {
		if (purchase_costs[cost.resource] === undefined) purchase_costs[cost.resource] = 0;
		let incremental_cost = Math.floor(cost.base_cost * Math.pow(cost.multiplier, number_owned));
		purchase_costs[cost.resource] = purchase_costs[cost.resource] + incremental_cost;
	});

	return purchase_costs;
}
