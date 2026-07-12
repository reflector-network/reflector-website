import React from 'react'

/**
 * @param {'beam'|'pulse'} type
 * @param {*} children
 * @returns {JSX.Element}
 */
export default function OracleLayout({type, children}) {
    return <div className="container" style={{paddingTop: '6em', maxWidth: '1400px'}}>
        <div className="row">
            <div className="column column-67">
                <div className="segment">{children}</div>
            </div>
            <div className="space mobile-only"/>
            <div className="column column-33">
                <div className="segment">
                    <div className="double-space"></div>
                    {type === 'beam' ? <BeamDescription/> : <PulseDescription/>}
                </div>
            </div>
        </div>
    </div>
}

function BeamDescription() {
    return <div>
        <p>
            Beam oracles offer way faster updates with 1 minute granularity and boast the largest selection of available
            price feeds. Reflector sends on-chain notifications once the price change value for the specified asset
            reaches a certain threshold. Every 2 hours all active feeds receive periodic guaranteed updates (heartbeat)
            to ensure price availability.
        </p>
        <p>
            The end-users have to pay a small price-per-call fee each time they pull data from a Beam oracle, however
            Beam oracles don’t require the upkeep fee.
        </p>
    </div>
}

function PulseDescription() {
    return <div>
        <p>
            <a href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0040.md">SEP40</a>-compatible
            Pulse oracles feature efficient ledger utilization for the storage of large amounts of data with uniform
            five minutes timeframes and straightforward interface for consumer contracts. This ensures a seamless
            integration even for inexperienced developers.
        </p>
        <p>
            Pulse oracles are openly available to use for any smart contract, but require someone to periodically pay
            oracle upkeep fees.
        </p>
    </div>
}