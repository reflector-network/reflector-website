import React from 'react'
import LivePriceUpdates from '../live/live-price-updates'

export default function GettingStartedView() {
    return <div>
        <h1 className="text-right">/ Getting started</h1>
        <p>
            Reflector oracle protocol is a combination of specialized smart contracts and peer-to-peer consensus of data provider nodes
            maintained by trusted Stellar ecosystem organizations that serve as intermediaries between Stellar smart contracts and
            external price feed data sources.
            Particularly, on-chain and off-chain asset prices, CEX & DEX exchange rates, foreign exchange rates, stock indices,
            financial market APIs, etc. Reflector nodes process, normalize, aggregate, and store trades information from
            Stellar Classic DEX, Soroban DEX protocols, as well as external sources.
        </p>
        <p>
            Such price feeds are crucial for a variety of decentralized financial applications, as they enable these applications to have
            reliable access to external data, making them more versatile and capable of handling a wide range of financial transactions and
            operations.
        </p>
        <p>
            Trustworthiness of the oracle and the security of the data source are critical factors to consider when using oracles in
            decentralized applications.
            The quotation mechanism can be exposed to various manipulations depending on the price reporting approach.
            Therefore, some kind of consensus system is required to ensure that quoted prices are accurate and consistent.
            Check how <a href="/docs/how-it-works">Reflector system design</a> helps to counter those risks, what approaches we utilized to
            guarantee the integrity, and why Reflector oracles can be considered trusted entities for exchange rates quotation.
        </p>
        <p>
            Reflector nodes report price feeds for all assets denominated in the base asset of the contract using the unified precision
            specified in <code>decimals()</code>. Prices get encoded as <code>i128</code> numbers where last N digits designate
            the fractional part of the given oracle feed. So the actual price can be calculated as <code>price/10^decimals</code>.
        </p>
        <p>
            An oracle feed receives regular updates with a pre-defined resolution. Reflector oracle contracts have a 5 minutes resolution set by
            default. Timestamps from trades and other price sources are normalized as <code>floor(unix_now()/resolution)*resolution</code>{' '}
            during the aggregation phase. It is important for consumer contracts to check the timestamp field of the returned values against
            the current ledger timestamp to make sure that reported quotes are not stale.
        </p>
        <p>
            Validated data periodically produced by the distributed consensus is stored in the smart contract and is readily available to
            consumer smart contracts in a format that these contracts can understand and use.
            Public <a href="/docs/interface">consumption interface</a> for Reflector contracts
            matches <a href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0040.md">SEP-40</a> Stellar standard.
        </p>

        <h2 className="double-space">Integrate oracles into your smart contract</h2>
        <div className="row">
            <div className="column column-50">
                <p>
                    Choose what kind of a price feed you need — the one that reports Stellar Classic DEX asset prices on Soroban, or a
                    token price feed from external centralized and decentralized exchanges. Copy a corresponding contract address and
                    use it in your project.
                </p>
                <p>
                    Check <a href="/docs/examples">usage examples</a> to discover how basic oracle usage scenarios can be implemented
                    on top of our infrastructure. Have questions? Do not hesitate to reach us or ask other developers
                    on <a href="https://discord.gg/v2ggfDty2d" target="_blank">Reflector Discord</a>.
                </p>
                <p>
                    Reflector oracles are deployed on both Stellar Testnet and Public networks. Play around with them, test your code and
                    then seamlessly switch to Pubnet once ready — just update the contract address, and that's it.
                </p>
                <p>
                    Our price feeds receive updates every 5 minutes. Since Reflector oracles operate non-stop, price data is written
                    to the temporary storage and can be evicted over time.
                    Calling the <code>period()</code> function on the oracle contract will return a guaranteed contract history retention
                    period, usually 24 hours.
                </p>
                <p>
                    Reflector public price feed is free for everyone, without limitations.
                    Don't see the token or a price source you are interested in? Let's talk on Discord or via email, we'll try to help you.
                </p>
            </div>
            <div className="column column-50">
                <div className="segment blank">
                    <LivePriceUpdates/>
                </div>
            </div>
        </div>

        <h2 className="double-space">Best Practices for contract developers</h2>
        <ul className="list" style={{textWrap: 'pretty', textAlign: 'justify'}}>
            <li>Always check retrieved price data for staleness by comparing the quoted timestamp with current date.</li>
            <li>In mission-critical use-cases consider using several independent oracle providers to mitigate the risks of service denial.
            </li>
            <li>Consuming data without averaging may expose a contract to risks of high asset volatility, so utilize TWAP or other
                averaging algorithm whenever possible.
            </li>
            <li>Consumer protocols can set up additional safeguards for noticeable anomalies in the consumed oracles feed values (e.g.
                sudden deviations of stablecoin prices).
            </li>
            <li>Pay additional attention when fetching oracle prices for assets with shallow liquidity.</li>
            <li>If you plan to change the oracle provider in the future or apply some custom price aggregation logic, it might be a good
                idea to set up a proxy oracle contract that can act as an intermediary between a consumer and a Reflector price feed
                contract. Later on it can be modified to point to another oracle feed (or to change internal aggregation logic) transparently
                without updating the consumer protocol contract.
            </li>
        </ul>

    </div>
}