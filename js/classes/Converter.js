import {Ticker} from './Ticker.js';

export class Converter extends Ticker {

	tick(data, game)
	{
		if (!this.canProduce(data, game)) return;
		this.resource_adjusters.forEach((adjuster) => adjuster.apply(this.upgrades, data));
	}

	getResourcesPerTick(data, game)
	{
		let resources_per_tick = {};
		this.resource_adjusters.forEach((adjuster) => {
			if (resources_per_tick[adjuster.resource] === undefined) {
				resources_per_tick[adjuster.resource] = 0;
			}

			let amount = adjuster.getAmountPerTick(this.upgrades, data);
			if (data.resources[adjuster.resource] === game.getResourceMaximum(adjuster.resource)) amount = 0;
			if (!this.canProduce(data, game)) amount = 0;

			resources_per_tick[adjuster.resource] = resources_per_tick[adjuster.resource] + amount;
		});

		return resources_per_tick;
	}

	canProduce(data, game)
	{
		let can_produce = true;
		this.resource_adjusters.forEach((adjuster) => {
			if (adjuster.amount_per_tick < 0
				&& (data.resources[adjuster.resource] === undefined
					|| data.resources[adjuster.resource] < (adjuster.getAmountPerTick(this.upgrades, data) *-1))
			) {
				can_produce =  false;
			}

			// this is awkward. We might have to move this code up a level, or pass in the maximum, or try not caring about it here...
			if (adjuster.amount_per_tick > 0
				&& (data.resources[adjuster.resource] === undefined
					|| data.resources[adjuster.resource] === game.getResourceMaximum([adjuster.resource]))
			) {
				can_produce = false;
			}
		});

		return can_produce;
	}

}
