import React from 'react'
import {Button} from '@stellar-expert/ui-framework'
import './dao-blueprint.scss'
import DaoTokenStats from './dao-token-stats'
import DaoDistributionScheduleView from './dao-distribution-schedule-view'
import DaoInitialDistributionChartView from './dao-initial-distribution-chart-view'

export default function DaoBlueprintView() {
    return <div className="row">
        <div className="column column-67">
            <div className="segment dao-blueprint">
                <div className="row">
                    <div className="column column-66">
                        <h2>/ Reflector DAO and XRF token</h2>
                    </div>
                    <div className="column column-33 desktop-right space">
                        <Button block outline href="/dao/submit-proposal">Submit DAO proposal</Button>
                    </div>
                </div>
                <h3 id="definitions">Definitions</h3>
                <p>
                    Reflector is a decentralized system and data exchange protocol that provides a reliable tamper-proof oracle price
                    feed service for smart contracts and other applications by aggregating price information from multiple on-chain and
                    off-chain data sources.
                </p>
                <p>
                    XRF token is a utility cryptocurrency token for Reflector oracles network issued by the decentralized autonomous
                    organization ("DAO") consisting of organizations and individuals that maintain Reflector server nodes, participate in
                    the cluster consensus, and control Reflector governance.
                </p>
                <p>
                    Cluster operators receive tokens for participating in the consensus mechanism and providing their computational
                    resources to aggregate, validate, certify, and publish token price information. Correspondingly, accrued tokens
                    represent the equivalent of computational resources contributed by each party. These tokens can be used for Reflector
                    cluster governance voting and subscription services.
                </p>
                <p>
                    Reflector subscriptions provide advanced automation functionality and observability for price feeds, offering a
                    framework for customizable developer-defined reactions on price changes.
                </p>

                <h3 id="reflector-dao">Reflector DAO</h3>
                <p>
                    Each of DAO members have an equal voting power, and Reflector governance decisions are enacted by a simple majority
                    of votes (a ballot requirement of more than half of all members). A member of the DAO can be expelled from the
                    organization and the Reflector cluster only by the DAO decision. Inclusion of new members (only those who run a
                    Reflector node and participate in the consensus are eligible) follows the same rule.
                </p>
                <p>
                    Reflector DAO contract coordinates operators’ voting on cluster configuration changes suggestions. The account that
                    controls the DAO contract is protected by the multisig consisting of current DAO members. It holds all issued but
                    unallocated XRF tokens which are gradually distributed over time between DAO members for their time and resources
                    contribution in governance and transaction validation.
                </p>

                <h3 id="price-feed-subscriptions">Price Feed Subscriptions</h3>
                <p>
                    Oracle contracts controlled by the Reflector cluster periodically publish price feed updates in the form of
                    blockchain transactions, which is suitable for the wide range of smart contracts. However, in many cases applications
                    need to receive updates more frequently, with finer granularity, and ideally almost immediately after the significant
                    underlying price movements in order to react faster on such changes.
                </p>
                <p>
                    Price Feed Subscriptions service provides advanced capabilities for such demanding usage scenarios. DeFi protocol
                    developers can create a Reflector subscription for a certain trading pair with a predefined threshold (the relative size
                    of the price movement that triggers an update). Once it is triggered, cluster nodes will validate preconditions and send
                    HTTP requests to the webhook defined in the subscription, allowing Stellar DeFi applications to react immediately on the
                    price change – perform computation, invoke some contract, take any other actions. Webhook is essentially a URL endpoint
                    that listens for HTTP POST requests, allowing an application to receive data without the need for continuous polling.
                    Such design offers ready to use DeFi contracts automation framework, while maintaining a maximum level of flexibility.
                </p>

                <h4>Usage</h4>
                <p>
                    Internal logic and decentralized mechanics utilized in Reflector oracles make it potentially vulnerable to resource
                    exhaustion attacks from malicious actors. Due to the fact that computation complexity grows exponentially with every
                    newly added price feed and every new subscription, the distributed oracle governance system needs to protect cluster
                    operators from such assault attempts while still providing an open and equitable access to legitimate users without
                    pre-authorization or security clearance. Using some medium of exchange to facilitate the wider public participation in
                    the collective governance of the decentralized organization is the only time-proven technique that maintains a balance
                    between reliability, security, and accessibility.
                </p>
                <p>
                    Reflector DAO employs XRF tokens in key governance areas. All such interactions are carried out through the
                    governance smart contract (DAO contract) or price feed subscription contract (Subscription contract). XRF tokens spent
                    in the process are permanently taken out of circulation without the possibility to recover them in the future
                    ("burned"), representing spent computational resources equivalent.
                </p>

                <h4>DAO contract</h4>
                <p>
                    When someone submits a DAO proposal, a certain amount of XRF tokens ("deposit") get transferred from the initiator
                    account and locked in the contract. Specifically, inviting new cluster operator nodes to the DAO, adding new data feeds,
                    and adding new tokens to one of the oracle price feeds require the deposit from the initiator. After that DAO members
                    have 14 days to vote on this proposal.
                </p>
                <p>
                    Any DAO decision requires a simple majority to agree on it. If neither option ("accept" or "reject") collects the
                    majority of current cluster operator votes during the nomination period, it results in the "abstain" outcome. Once the
                    ballot is concluded, all operators (including those who abstained or rejected the nomination) and Reflector developers
                    team must comply with the outcome, commit to executing the DAO decision, and make all reasonable efforts to fulfill this
                    obligation. Failure to do so initiates the procedure of voting for expelling a misbehaving party from the Reflector
                    cluster and the DAO.
                </p>
                <p>
                    In case of the positive voting decision, the whole XRF deposit amount gets burned which signifies the commitment of
                    Reflector cluster operators to spend computational resources in the future to comply with the accepted DAO proposal.
                </p>
                <p>
                    If the proposal is rejected, the initiator receives back 75% of the deposit, the remaining 25% of XRF tokens are burned.
                </p>
                <p>
                    In the event of a failed ballot with the "abstain" outcome, the initiator receives a 100% refund of deposited
                    tokens, plus 25% extra to the original deposit amount from the DAO fund as a compensation.
                </p>

                <h4>Default deposit amount for DAO decisions</h4>

                <table className="table" style={{width: 'auto', margin: '0 auto'}}>
                    <thead>
                    <tr>
                        <th style={{border: 0}}>&nbsp;</th>
                        <th className="text-right">Proposal deposit</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Inviting new operator</td>
                        <td className="text-right">50,000 XRF</td>
                    </tr>
                    <tr>
                        <td>Adding new price feed</td>
                        <td className="text-right"> 100,000 XRF</td>
                    </tr>
                    <tr>
                        <td>Adding new token to the price feed</td>
                        <td className="text-right">5,000 XRF</td>
                    </tr>
                    <tr>
                        <td>General DAO decision</td>
                        <td className="text-right">10,000 XRF</td>
                    </tr>
                    </tbody>
                </table>

                <h4>Subscriptions contract</h4>
                <p>
                    The process of subscription creation and maintenance involves XRF token deposit (required to keep it active) supplied by
                    the creator of the subscription. The first charge is performed upon the subscription creation, with subsequent charges
                    conducted on a daily basis by the automated service. Each upkeep charge extends the lifetime of the subscription for 24
                    hours. When the remaining XRF deposit for a given subscription falls under the upkeep amount, the subscription becomes
                    inactive. After that, anyone can renew it by depositing more XRF tokens to this subscription. All tokens charged for the
                    upkeep, get immediately burned.
                </p>
                <p>
                    Default subscription daily upkeep rate is 10 XRF for the subscription with 1 hour heartbeat interval. The rate for a
                    particular subscription is calculated based on the following formula:
                </p>
                <div className="text-center">
                    <img src="/images/dao/subscription-formula.svg"/>
                </div>

                <p>where:
                    <div className="block-indent">
                        <ul className="list" style={{textIndent: 0, margin: 0}}>
                            <li><i>base</i> is the default upkeep rate, 10 XRF</li>
                            <li><i>heartbeat</i> represent the interval between forced updates, in minutes (reduced heartbeat interval
                                proportionally increases the upkeep amount)
                            </li>
                            <li><i>complexity</i> refers to the number of hops need to calculate the price – cross-price calculation gives
                                the
                                complexity factor of 2, while standard quotes without cross-prices have the complexity of 1
                            </li>
                        </ul>
                    </div>
                </p>
                <h4>Settings adjustment</h4>
                <p>
                    Default settings, like the deposit amount requirements for each voting category, are defined in the DAO contract and can
                    be adjusted in the future by cluster operators which can vote to modify those parameters.
                </p>

                <h3 id="initial-distribution">Initial XRF Token Distribution</h3>
                <p>
                    Reflector node operators unanimously agreed to create XRF tokens issued on Stellar Network and disburse them between
                    the initial distribution recipients in a form of claimable balances. Subsequently, the token issuance account is locked,
                    no tokens will be created in the future.
                </p>
                <div>
                    Initial allocation - <b>120,000,000</b> XRF tokens:
                    <div className="block-indent">
                        Reflector DAO fund smart contract - <b>102,500,000</b> tokens <span className="dimmed">(85.42%)</span><br/>
                        Reflector protocol developers - <b>12,600,000 tokens</b> <span className="dimmed">(10.5%)</span><br/>
                        Current cluster node operators - <b>4,000,000 tokens</b> <span className="dimmed">(3.33%)</span><br/>
                        Early protocol adopters - <b>900,000 tokens</b> <span className="dimmed">(0.75%)</span>
                    </div>
                    <DaoInitialDistributionChartView/>
                </div>

                <h3 id="disbursements">On-going Tokens Disbursements</h3>
                <p>
                    The DAO fund smart contract allocates rewards to oracle node operators for the participation in the cluster consensus
                    and to the Reflector developers team on a weekly basis. Invocation of the "unlock()" function on the DAO smart contract
                    initiates the process of the XRF tokens unlocking for addresses of oracle nodes that currently participate in the DAO
                    and to the Reflector developer organization address, configured in the contract itself. Allocated tokens later can be
                    claimed from the fund by operators.
                </p>
                <p>
                    If in the future DAO members decide that another organization can better take care of the Reflector project development
                    and maintenance, they can use the standard voting mechanism to appoint this organization to the corresponding role by
                    voting for changing the developer token recipient address.
                </p>
                <p>
                    Every week DAO members receive 0.12% of the remaining DAO fund balance, distributed evenly between all members.
                    Additionally, Reflector developers receive 0.03% of XRF tokens remaining in the DAO fund.
                </p>
                <DaoDistributionScheduleView/>
                <p>
                    Since the quantity of XRF tokens stored in the fund diminishes over time, the distribution amounts also get smaller,
                    never reaching zero nevertheless. This way the on-going token distributions will last as long as the Reflector cluster
                    is functioning.
                </p>

                <h3 id="commitment">Commitment</h3>
                <p>
                    This document outlines the vision of Reflector governance and its future expansion. Our primary goal is to provide a
                    truly decentralized, and at the same time flexible service for developers which need an extremely reliable price feed
                    oracle data for their applications. We will adhere to these principles and ideas while working on further Reflector
                    protocol development.
                </p>
                <div className="double-space"></div>
                <hr className="flare"/>
                <h3 id="q&a" className="double-space">Q&A</h3>
                <QA question="Why is token supply limited?">
                    Token distribution represents the amount of computational resources spent by each operator for participating in the
                    consensus mechanism over time. Since the computational power of the hardware is limited, the supply of the XRF token is
                    also limited.
                </QA>
                <QA question="Why do deposited tokens get burned instead of redistribution between operators?">
                    Most of the governance decisions, like creating new price feed contracts or adding tokens to the oracle, increase
                    aggregation time and require additional computational resources. Token burns alongside the depletion of weekly token
                    release amounts over time represent a self-regulating mechanism ensuring that the compound computational complexity of
                    algorithms and data processing circuits carried out by Reflector nodes does not exceed the capacity of underlying
                    bare-metal servers, while still providing a room for a steady future growth in line with Moore's law.
                </QA>
                <QA question="When changes approved by the DAO decision come in force?">
                    If the execution of the governance decision can be executed by the DAO contract itself, the changes come in force
                    immediately after the vote is concluded. For more complex situations, when the implementation requires modifications in
                    the source code of smart contracts or Reflector node software, the timeline depends on the development process, but it
                    should not exceed 4 calendar months.
                </QA>
                <QA question="Is there a public airdrop?">
                    Initially tokens get distributed directly to Reflector operators, developers team, and early adopters – protocols that
                    started using Reflector before the token launch announcement. After that, no third party will receive direct transfers
                    from the DAO except the cases specified in this document.
                </QA>
                <QA question="Does the protocol allow some kind of staking?">
                    No, there is no token staking functionality in the protocol and there’s no plans to implement it. But if community and
                    DAO members decide that staking is required for some new protocol features, such extension can be implemented in the
                    future.
                </QA>
                <QA question="Do you sell XRF tokens? Can I buy them?">
                    DAO doesn’t sell or distribute XRF tokens to any third parties. The primary goal of the token distribution is to empower
                    members backing the Reflector existence with universal instruments for the Reflector governance. Token recipients can do
                    whatever they want with their tokens – utilize them for governance, pay for their subscriptions, endorse other projects
                    by donating tokens to these projects, sell tokens on the open market, or burn them. Once tokens leave the DAO contract,
                    Reflector DAO does not control them anymore.
                </QA>
            </div>
        </div>
        <div className="space mobile-only"/>
        <div className="column column-33">
            <DaoTokenStats/>
        </div>
    </div>
}

function QA({question, children}) {
    const anchor = question.toLowerCase().replaceAll(' ', '-').replaceAll(/\W+/g, '')
    return <>
        <h4 id={anchor}>{question}</h4>
        <p>{children}</p>
    </>
}