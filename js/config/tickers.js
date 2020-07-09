import {Ticker, ResourceAdjuster, PurchaseCost} from '../classes/Ticker.js';
import {Converter} from '../classes/Converter.js';
import {TickerUpgrade} from "../classes/TickerUpgrade.js";

export default
{
	'baker': new Ticker('baker')
		.addPurchaseCost( new PurchaseCost('cookies', 10, 1.17))
		.addResourceAdjuster( new ResourceAdjuster('cookies', 1))
		.addUpgrade(
			new TickerUpgrade('super_oven')
				.setParentPurchasesRequired(2)
				.addPurchaseCost( new PurchaseCost('cookies',  30, 1.17))
				.applyToResource('cookies')
				.setFlatBonus(1)
				.setMultiplier(0),
		)
		.addUpgrade(
			new TickerUpgrade('baking_tray')
				.setParentPurchasesRequired(3)
				.setMaximumPurchases(1)
				.addPurchaseCost( new PurchaseCost('cookies',  50, 1))
				.applyToResource('cookies')
				.setMaximumFlatBonus(50),
		),

	'goblin': new Ticker('goblin')
		.addResourceAdjuster( new ResourceAdjuster('goblin_snot', 1)),

	'unicorn': new Converter('unicorn')
		.addPurchaseCost( new PurchaseCost('cookies', 30, 1.17))
		.addPurchaseCost( new PurchaseCost('goblin_snot', 10, 1.15))
		.addResourceAdjuster(new ResourceAdjuster('cookies', -1))
		.addResourceAdjuster(new ResourceAdjuster('unicorn_shit', 1)),
}
