import {TickerUpgrade} from '../classes/TickerUpgrade.js';
import {PurchaseCost} from "../classes/Ticker.js";

export default
{
	'super_oven': new TickerUpgrade('super_oven')
		.addPurchaseCost( new PurchaseCost('cookies', 10, 1.15))

}
