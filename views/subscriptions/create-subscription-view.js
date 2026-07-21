import React, {useCallback, useEffect, useRef, useState} from 'react'
import {AssetLink, Button, Dropdown} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
import {navigation} from '@stellar-expert/navigation'
import {finishAction, tryStartAction} from '../action-guard'
import AuthStateView from '../auth/auth-state-view'
import {getSubscriptionDataSources} from './oracles'
import {createSubscription} from './subscription-actions'

export default function CreateSubscriptionView() {
    const [oracleInfo, setOracleInfo] = useState()
    const [base, setBase] = useState()
    const [quote, setQuote] = useState()
    const [heartbeat, setHeartbeat] = useState(30)
    const [threshold, setThreshold] = useState(1)
    const [balance, setBalance] = useState('30')
    const [webhook, setWebhook] = useState('')
    const [inProgress, setInProgress] = useState(false)
    const [loadError, setLoadError] = useState()
    const [loadAttempt, setLoadAttempt] = useState(0)
    const submissionStarted = useRef(false)

    const network = 'public'
    const retryLoad = useCallback(() => setLoadAttempt(attempt => attempt + 1), [])

    useEffect(() => {
        let cancelled = false
        setOracleInfo(null)
        setLoadError(null)
        getSubscriptionDataSources(network)
            .then(res => {
                if (!cancelled)
                    setOracleInfo(res)
            })
            .catch(error => {
                console.error(error)
                if (!cancelled)
                    setLoadError('Flare feed metadata is temporarily unavailable.')
            })
        return () => {
            cancelled = true
        }
    }, [loadAttempt, network])

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
        const v = parseInt(e.target.value, 10)
        setHeartbeat(v || 0)
    }, [setHeartbeat])

    const changeBalance = useCallback(e => setBalance(e.target.value.trim()), [setBalance])
    const changeWebhook = useCallback(e => setWebhook(e.target.value.trim()), [setWebhook])
    const canProceed = Boolean(base && quote && webhook && threshold && balance && !inProgress)

    const create = useCallback(() => {
        if (!canProceed || !tryStartAction(submissionStarted))
            return
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
            .finally(() => {
                finishAction(submissionStarted)
                setInProgress(false)
            })
    }, [balance, base, canProceed, heartbeat, quote, threshold, webhook])

    if (loadError)
        return <div className="segment warning" role="alert">
            <div>{loadError}</div>
            <div className="row space">
                <div className="column column-50"><Button block onClick={retryLoad}>Retry</Button></div>
                <div className="column column-50"><Button block outline href="/flare">Back to Flare</Button></div>
            </div>
        </div>
    if (!oracleInfo)
        return <div className="loader" role="status" aria-label="Loading Flare feed metadata"/>

    return <div>
        <h2>
            / Create subscription
            {Boolean(inProgress) && <span className="loader inline" role="status"
                                          aria-label="Creating subscription"
                                          style={{margin: '0 1em', verticalAlign: 'middle'}}/>}
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
            The reference price is calculated as <b><code>quote/base</code></b> price ratio
        </div>
        <div className="row">
            <div className="column column-50">
                <div className="space">
                    <label htmlFor="flare-threshold">Trigger threshold: </label>
                    <div className="mobile-only"/>
                    <input id="flare-threshold" type="number" min={0.1} max={1000} step={0.1}
                           style={{width: '8em'}} value={threshold} onChange={changeThreshold}/>
                    <span className="dimmed"> %</span>
                    <div className="dimmed text-tiny">
                        Relative price deviation that will trigger the notification, compared to the previous reported price
                    </div>
                </div>
            </div>
            <div className="column column-50">
                <div className="space">
                    <label htmlFor="flare-heartbeat">Heartbeat interval: </label>
                    <div className="mobile-only"/>
                    <input id="flare-heartbeat" type="number" min={5} max={240} style={{width: '8em'}}
                           value={heartbeat} onChange={changeHeartbeat}/>
                    <span className="dimmed"> minutes</span>
                    <div className="dimmed text-tiny">
                        Interval of periodic notifications that will be delivered even without the price change
                    </div>
                </div>
            </div>
        </div>
        <div className="space">
            <label htmlFor="flare-deposit">Initial balance:</label>
            <div className="mobile-only"/>
            <input id="flare-deposit" type="text" inputMode="decimal" className="text-right"
                   style={{width: '7em'}} value={balance}
                   onChange={changeBalance}/> XRF
            <div className="text-tiny dimmed">
                The amount of XRF to deposit into the contract. Tokens are charged from the balance on a daily basis, and
                the subscription remains active while its remaining balance stays positive.
            </div>
        </div>
        <div className="space">
            <label htmlFor="flare-webhook">Webhook URL:</label>
            <textarea id="flare-webhook" style={{width: '100%'}} value={webhook}
                      onChange={changeWebhook}/>
            <div className="text-tiny dimmed">
                Once the subscription is triggered, cluster nodes will send a POST HTTP request to the provided webhook URL.
            </div>
        </div>
        <div className="space">
            <AuthStateView/>
        </div>
        <div className="double-space row">
            <div className="column column-50">
                <Button block disabled={!canProceed} onClick={create}>{inProgress ? 'Creating…' : 'Create'}</Button>
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
    }, [oracleInfo, onChange])

    const selectAsset = useCallback(asset => {
        onChange({
            asset,
            source: dataSource
        })
    }, [dataSource, onChange])

    if (!oracleInfo)
        return <div className="loader" role="status" aria-label={`Loading ${title} options`}/>

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
        <Dropdown options={symbolOptions} value={value?.asset} onChange={selectAsset}/>

    return <div className="space" role="group" aria-label={title}>
        <div role="group" aria-label={`${title} data source`}>
            <span>Data source: </span>
            <Dropdown options={oracleOptions} value={dataSource}
                      title={dataSource ? selectedOracle.title : `Choose ${title.toLowerCase()} price feed`}
                      onChange={selectOracle}/>
        </div>
        <div className="micro-space" role="group" aria-label={`${title} symbol`}>
            <span>{title}: </span> {selector}
        </div>
    </div>
}
