import {Ticker, ResourceAdjuster, PurchaseCost} from '../classes/Ticker.js';
import {Converter} from '../classes/Converter.js';

export default
{
	'baker': new Ticker('baker')
		.addPurchaseCost( new PurchaseCost('cookies', 10, 1.15))
		.addResourceAdjuster( new ResourceAdjuster('cookies', 1)),

	'goblin': new Ticker('goblin')
		.addResourceAdjuster( new ResourceAdjuster('goblin_snot', 1)),

	'unicorn': new Converter('unicorn')
		.addPurchaseCost( new PurchaseCost('cookies', 10, 1.15))
		.addPurchaseCost( new PurchaseCost('goblin_snot', 10, 1.15))
		.addResourceAdjuster(new ResourceAdjuster('cookies', -1))
		.addResourceAdjuster(new ResourceAdjuster('unicorn_shit', 1)),
}
