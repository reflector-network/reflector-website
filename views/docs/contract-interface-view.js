import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router'
import {CodeBlock, CopyToClipboard, Dropdown} from '@stellar-expert/ui-framework'
import {generateReflectorClient, generateReflectorClientInvocation} from '../contract/oracle-public-feed-codegen'
import {fetchOracleConfig} from '../contract/oracle-contract-data'
import {resolveOracleMeta} from '../contract/oracle-source'
import OracleNetworkSelector from '../live/oracle-network-selector'
import {parseQuery} from '@stellar-expert/navigation'

export default function ContractInterfaceView() {
    const params = parseQuery()
    const [config, setConfig] = useState()
    const [network, setNetwork] = useState(params.network || 'public')
    const [oracle, setOracle] = useState(params.contract || null)
    useEffect(() => {
        fetchOracleConfig(network).then(config => {
            setConfig(config)
            if (!params.contract) {
                setOracle(Object.values(config.contracts).find(contract => contract.type === 'oracle').contractId)
            }
        })
        if (!params.contract) {
            setOracle(null)
        }
    }, [network])

    let oracleOptions = []
    if (config) {
        for (let contract of Object.values(config.contracts)) {
            if (contract.type !== 'oracle')
                continue
            oracleOptions.push({
                value: contract.contractId,
                title: resolveOracleMeta(contract).title
            })
        }
        if (!oracle) {
            setTimeout(() => setOracle(oracleOptions[0].value), 100)
        }
    }
    const clientCode = generateReflectorClient()
    const invocation = generateReflectorClientInvocation(oracle, config && oracle && config.contracts[oracle]?.dataSource || 'exchanges', network)

    return <div>
        <h1 className="desktop-right" style={{marginBottom: 0}}>/ Use public feed</h1>
        <div className="dimmed text-small desktop-right">Integrate oracle in your code</div>
        <p>
            Public Reflector price feeds are readily available for all Stellar smart contracts. Just add the contract
            interface to your codebase — and it's ready to go.
        </p>
        <p>
            Our contracts
            implement <a href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0040.md">SEP-40</a> standard
            trait (so they are compatible with most Stellar ecosystem protocols), extending it with additional utility functions like
            cross-price calculation and TWAP approximation.
        </p>
        <div className="row space">
            <div className="column column-50">
                <h3>/ Invocation from consumer contract</h3>
            </div>
            <div className="column column-50 text-small desktop-right" style={{paddingTop: '1em'}}>
                Network: <OracleNetworkSelector value={network} onChange={setNetwork}/>&emsp;
                {config ? <>Oracle: <Dropdown options={oracleOptions} value={oracle} onChange={setOracle}/></>
                    : <div className="loader"/>}
            </div>
        </div>
        <div className="dimmed text-small micro-space">
            Utilize this example to invoke oracles from your contract code.
        </div>
        <CodeBlock lang="rust">{invocation}</CodeBlock>
        <h3 className="space">/ Interface for Reflector public price feed</h3>
        <div className="dimmed text-small">
            <CopyToClipboard text={clientCode}/> Copy and save it in your smart contract project
            as "reflector.rs" file. This is the oracle client.
        </div>
        <CodeBlock lang="rust">{clientCode}</CodeBlock>
    </div>
}