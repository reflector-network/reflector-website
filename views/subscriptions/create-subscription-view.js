import React, {useCallback, useEffect, useState} from 'react'
import {AssetLink, Button, Dropdown} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
import {navigation} from '@stellar-expert/navigation'
import AuthStateView from '../auth/auth-state-view'
import {getSubscriptionDataSources} from './oracles'
import {createSubscription} from './subscription-actions'

export default function CreateSubscriptionView() {
    const [oracleInfo, setOracleInfo] = useState()
    const [base, setBase] = useState()
    const [quote, setQuote] = useState()
    const [heartbeat, setHeartbeat] = useState(30)
    const [threshold, setThreshold] = useState(1)
    const [balance, setBalance] = useState('10')
    const [webhook, setWebhook] = useState('')
    const [inProgress, setInProgress] = useState(false)

    const network = 'tesntet'

    useEffect(() => {
        getSubscriptionDataSources(network)
            .then(res => setOracleInfo(res))
    }, [network])

    const changeThreshold = useCallback(e => {
        let v = parseFloat(e.target.value)
        if (!(v > 0)) {
            v = 0.1
        } else if (v > 1_000) {
            v = 1_000
        }
        v = Math.floor(v * 10) / 10
        setThreshold(v)
    }, [setThreshold])

    const changeHeartbeat = useCallback(e => {
        try {
            let v = parseInt(e.target.value)
            setHeartbeat(v || 0)
        } catch (e) {
        }
    }, [setHeartbeat])

    if (!oracleInfo)
        return <div className="loader"/>


    function create() {
        setInProgress(true)
        createSubscription({
            quote,
            base,
            balance,
            heartbeat,
            threshold: Math.floor(threshold * 10),
            webhook
        })
            .then(created => {
                if (created) {
                    notify({type: 'success', message: 'Subscription created successfully'})
                    navigation.navigate('/flare')
                }
            })
            .catch(e => {
                notify({type: 'error', message: e.message ? 'Execution error: ' + e.message : e})
                console.error(e)
            })
            .finally(() => setInProgress(false))
    }

    const canProceed = base && quote && webhook && threshold && balance

    return <div>
        <h2>
            / Create subscription
            {inProgress && <div className="loader inline" style={{margin: '0 1em', verticalAlign: 'middle'}}/>}
        </h2>
        <hr className="flare"/>

        <div className="row">
            <div className="column column-50">
                <AssetSelector title="Quote ticker" oracleInfo={oracleInfo} value={quote} onChange={setQuote}/>
            </div>
            <div className="column column-50">
                <AssetSelector title="Base ticker" oracleInfo={oracleInfo} value={base} onChange={setBase}/>
            </div>
        </div>
        <div className="text-tiny dimmed micro-space">
            <>The reference price is calculated as <b><code>quote/base</code></b> price ratio</>
        </div>
        <div className="row">
            <div className="column column-50">
                <div className="space">
                    <span>Trigger threshold: </span>
                    <div className="mobile-only"/>
                    <input type="number" min={0.1} max={1000} step={0.1} style={{width: '8em'}} value={threshold} onChange={changeThreshold}/>
                    <span className="dimmed"> %</span>
                    <div className="dimmed text-tiny">
                        Relative price deviation that will trigger the notification, compared to the previous reported price
                    </div>
                </div>
            </div>
            <div className="column column-50">
                <div className="space">
                    <span>Heartbeat interval: </span>
                    <div className="mobile-only"/>
                    <input type="number" min={0} max={240} style={{width: '8em'}} value={heartbeat} onChange={changeHeartbeat}/>
                    <span className="dimmed"> minutes</span>
                    <div className="dimmed text-tiny">
                        Interval of periodic notifications that will be delivered even without the price change
                    </div>
                </div>
            </div>
        </div>
        <div className="space">
            <div>Initial balance:</div>
            <div className="mobile-only"/>
            <input type="text" className="text-right" style={{width: '7em'}} value={balance}
                   onChange={e => setBalance(e.target.value.trim())}/>XRF
            <div className="text-tiny dimmed">
                The amount of subscription tokens to deposit into the contract — the tokens will be charged from the subscription balance on
                the daily basis, and the subscription will remain active while the subscription has positive remaining balance
            </div>
        </div>
        <div className="space">
            <div>Webhook URL:</div>
            <textarea style={{width: '100%'}} value={webhook} onChange={(e) => setWebhook(e.target.value.trim())}/>
            <div className="text-tiny dimmed">
                Once the subscription is triggered, cluster nodes will send POST HTTP request to the provided webhook URL
            </div>
        </div>
        <div className="space">
            <AuthStateView/>
        </div>
        <div className="double-space row">
            <div className="column column-50">
                <Button block disabled={!canProceed} onClick={create}>Create</Button>
            </div>
            <div className="column column-50">
                <Button href="/flare" block>Cancel</Button>
            </div>
        </div>
    </div>
}

function AssetSelector({oracleInfo, title, value, onChange}) {
    const [dataSource, setDataSource] = useState()

    const oracleOptions = Object.values(oracleInfo.oracles)
        .map(props => ({
            value: props.dataSource,
            title: props.title
        }))

    const selectOracle = useCallback(dataSource => {
        setDataSource(dataSource)
        const selectedOracle = oracleInfo.oracles[dataSource]
        onChange({
            asset: selectedOracle.baseAsset.code,
            source: dataSource
        })
    }, [setDataSource, oracleInfo])

    const selectAsset = useCallback(asset => {
        onChange({
            asset,
            source: dataSource
        })
    }, [dataSource])

    if (!oracleInfo)
        return <div className="loader"/>

    const selectedOracle = oracleInfo.oracles[dataSource]
    let symbols = []
    if (selectedOracle) {
        symbols = selectedOracle.assets.map(a => a.code)
        symbols.push(selectedOracle.baseAsset.code)
    }

    const symbolOptions = symbols.map(symbol => ({
        value: symbol,
        title: dataSource === 'pubnet' ?
            <AssetLink asset={symbol} link={false}/> :
            shortenString(symbol, 16)
    }))

    const selector = !symbols?.length ?
        <span className="dimmed">unavailable</span> :
        <Dropdown options={symbolOptions} value={value.asset} onChange={selectAsset}/>

    return <div className="space">
        <span>Data source: </span>
        <Dropdown options={oracleOptions} value={dataSource} title={dataSource ? selectedOracle.title : 'Choose price feed'} onChange={selectOracle}/>
        <div className="micro-space">
            <span>{title}: </span> {selector}
        </div>
    </div>
}