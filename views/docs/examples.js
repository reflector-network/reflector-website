export const examples = {
    'forced-liquidation': {
        title: 'Forced position liquidation',
        description: `Forced position liquidation is a mechanism utilized in DeFi platforms to manage and mitigate the risk of undercollateralized or risky positions. It is commonly used in lending/borrowing protocols, decentralized exchanges, and other DeFi applications to ensure the stability and security of the system.
The primary goal of forced position liquidation is to protect the lender's interests and maintain the overall stability of the DeFi platform. It ensures that borrowers maintain an adequate level of collateral to cover their debt, reducing the risk of insolvency and potential losses for other users.`,
        code: `pub fn check_liquidation(env: Env, reflector_contract_id: Address, loan: Loan, liquidation_threshold: i128) {
    // loan position example
    // {
    //    collateral_asset: Asset::Other(Symbol::new(&env, "BTC")),
    //    collateral_amount: 10753533963_i128,
    //    borrowed_asset: Asset::Other(Symbol::new(&env, "ETH")),
    //    borrowed_amount: 154850889072_i128
    // }

    // create the price oracle client instance
    let reflector_contract = PriceOracleClient::new(&env, &reflector_contract_id);

    // get oracle prcie precision
    let decimals = reflector_contract.decimals();

    // get the price and calculate the value of the collateral
    let collateral_asset_price = reflector_contract.lastprice(&loan.collateral_asset).unwrap();
    let collateral_value = collateral_asset_.price * loan.collateral_amount;

    // get the price and calculate the value of the borrowed asset
    let asset_price = reflector_contract.lastprice(&loan.borrowed_asset).unwrap();
    let borrowed_value = asset_price.price * loan.borrowed_amount;

    // calculate the current loan to value ratio, SAC contracts 
    let collateralization_ratio = collateral_value * 10000000_i128 / borrowed_value;

    if collateralization_ratio <= liquidation_threshold {
        // collateralization ratio is too small – liquidate the loan
    }
}`,
        extraInfo: `Collateralization: in DeFi lending and borrowing platforms, users typically deposit a certain amount of cryptocurrency as collateral to borrow other assets. The value of the collateral is typically higher than the value of the borrowed assets, creating a collateralization ratio. This ratio represents how well the position is collateralized.
DeFi platform continuously monitor the collateralization ratio of each user's position. If this ratio falls below a certain threshold (often referred to as the liquidation threshold or maintenance margin), the system automatically liquidates part or all of their collateral to cover the outstanding debt and bring the position back to a safe collateralization level. 
A liquidation typically occurs through an on-chain auction mechanism or through other automated processes. Depending on the platform's rules, the system may choose to partially liquidate the undercollateralized position (liquidate a portion of the collateral) or fully liquidate it (liquidate all the collateral).
Properly functioning liquidation mechanisms are essential for the long-term viability of a platform and user funds protection.
`
    }
    ,
    'algo-stablecoin': {
        title: 'Algorithmic stablecoin',
        description: 'Pegged algorithmic stablecoins represent a subclass of cryptocurrencies designed to maintain the value by algorithmically managing supply and demand in relation to the value of a specific reference asset. Unlike traditional fiat-backed stablecoins, which are directly backed by reserve assets like US dollars, algorithmic stablecoins rely on complex algorithms and mechanisms to achieve price stability.',
        code: `pub fn maintain_stable_coin_peg(env: Env, reflector_contract_id: Address, current_price: i128) {
    // create oracle client instance
    let reflector_contract = PriceOracleClient::new(&env, &reflector_contract_id);

    // fetch recent price records for the reference ticker and average them (consumer-side TWAP)
    let coin = Asset::Other(Symbol::new(&env, "CHF"));
    let recent = reflector_contract.prices(&coin, &5).unwrap();
    let mut sum = 0_i128;
    for record in recent.iter() {
        sum += record.price;
    }
    let reference_price = sum / (recent.len() as i128);

    // take action if the price diverts more than 0.1% from the reference price
    let threshold = reference_price / 1000_i128;
    if current_price > reference_price + threshold {
        // mint and sell coin
    }
    if current_price < reference_price - threshold {
        // buy and burn coin
    }
}`,
        extraInfo: `Algo-stablecoins can be pegged to a specific real-world asset, such as a commodity (gold, oil, wheat), a basket of assets, or any other financial instrument (equity indexes, derivatives). The value of the stablecoin is intended to reflect the value of the reference asset.
A set of smart contracts or algorithms control the stablecoin's supply and demand. These algorithms monitor the price of the real-world asset and make adjustments as needed to maintain price stability.
To keep the stablecoin's price in line with the value of the underlying asset, the algorithm can adjust the stablecoin's supply. This may involve issuing new stablecoins when the price is above the peg or burning (destroying) stablecoins when the price is below the peg.
Price oracles provide the smart contracts with reliable information about the current price of the reference asset.`
    }
    ,
    'portfolio-rebalancing':
        {
            title: 'Portfolio rebalancing',
            description: 'Contract-based portfolios provide the ability to automate the process of adjusting the composition of account\'s digital asset portfolio to maintain desired investment objectives, risk profiles, or allocations. Algorithmically-controlled rebalancing leverages smart contracts to make all adjustments, eliminating the need for manual intervention and reducing the risk of human error.',
            code: `pub fn rebalance_portfolio(env: Env, reflector_contract_id: Address, portfolio: Vec<PortfolioPosition>) {
    // portfolio example
    // [{
    //    asset: Asset::Stellar(Address::from_str(&env, "CD8H6KNN9...")),
    //    amount: 45675353821010_i128,
    // },
    // {
    //    asset: Asset::Stellar(Symbol::new(&env, "BTC")),
    //    amount: 10753533963_i128,
    // }]

    // create the price oracle client instance
    let reflector_contract = PriceOracleClient::new(&env, &reflector_contract_id);

    // storage for portfolio position values
    let mut values: [i128; 3] = [0; 3];
    // calculate total value of the portfolio
    let mut total_value = 0_i128;
    let total_positions = portfolio.len()
    for i in 0..total_positions {
        let position = &portfolio[i];
        // get price of an asset
        let asset_price = reflector_contract.lastprice(&position.asset).unwrap();
        // calculate position USD value
        let asset_value = asset_price.price * position.amount;
        total_value += asset_value;
        values[i] = asset_value;
    }

    // calculate average value per position
    let average_position_value = total_value / (total_positions as i128);

    // calculate the difference between the target value and the actual value for each position
    for i in 0..total_positions {
        let value: i128 = values[i];
        if value > average_position_value {
            // sell some tokens to decrease share in the portfolio
        } else if value < average_position_value {
            // buy tokens to increase position size
        }
    }
}`,
            extraInfo: `Smart contract portfolio rebalancing offers several advantages, including automation, reduced transaction costs compared to manual trading, and the ability to maintain a disciplined investment strategy. It is particularly useful for passive or index-style investing strategies where maintaining a specific asset allocation is crucial.
Initially, the user specifies their desired portfolio allocation. This allocation typically includes the percentage of their portfolio to be invested in various assets. For example, a user might want 50% Bitcoin, 30% Ethereum, and 20% in a stablecoin.
Smart contracts continually monitor the current composition of the user's portfolio. This is done by tracking the balances of the various assets in the user's wallet and their relative value.
Rebalancing can be triggered by specific conditions set by the user or based on predefined rules. Common trigger conditions might include a specified time interval (e.g. rebalance every week), a significant price deviation (when an asset's value deviates from its target allocation by a certain percentage), or any other criteria defined in the smart contract.
When the trigger conditions are met, the smart contract evaluates the current portfolio composition and calculates the necessary adjustments to bring it back in line with the target allocation. This process may involve selling over-allocated assets, buying under-allocated assets, or a combination of both.
The smart contract rebalances portoflio via decentralized exchanges or through direct interactions with other smart contracts. This can involve swaps or trades of assets to achieve the desired allocation.
After executing the orders, the smart contract provides confirmation of the rebalancing action, including details on the trades made and the updated portfolio composition.
The protfolio contract continues to monitor the allocations after rebalancing and triggers the process again when the next set of conditions are met.`
        }
}