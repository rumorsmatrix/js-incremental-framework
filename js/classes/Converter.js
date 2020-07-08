import {Ticker} from './Ticker.js';

export class Converter extends Ticker {

	tick()
	{
		if (!this.canProduce()) return;
		this.resource_adjusters.forEach((adjuster) => adjuster.apply());
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
			if (!this.canProduce()) amount = 0;

			resources_per_tick[adjuster.resource] = resources_per_tick[adjuster.resource] + amount;
		});

		return resources_per_tick;
	}

	canProduce()
	{

		let can_produce = true;
		this.resource_adjusters.forEach((adjuster) => {
			if (adjuster.amount_per_tick < 0
				&& (game.data.resources[adjuster.resource] === undefined
					|| game.data.resources[adjuster.resource] < (adjuster.amount_per_tick *-1))
			) {
				can_produce =  false;
			}

			if (adjuster.amount_per_tick > 0
				&& (game.data.resources[adjuster.resource] === undefined
					|| game.data.resources[adjuster.resource] === game.data.resource_maximums[adjuster.resource])
			) {
				can_produce = false;
			}
		});

		return can_produce;
	}

}