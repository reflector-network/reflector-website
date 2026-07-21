import React, {useCallback, useEffect, useRef, useState} from 'react'
import {AssetLink, Button, UtcTimestamp} from '@stellar-expert/ui-framework'
import {fromStroops, shortenString} from '@stellar-expert/formatter'
import {finishAction, tryStartAction} from '../action-guard'
import {getOwnSubscriptions, removeOwnSubscription} from './subscriptions-storage'
import {cancelSubscription, loadSubscription} from './subscription-actions'

export default function SubscriptionsView() {
    const [_, forceUpdate] = useState(0)
    const ids = getOwnSubscriptions()
    const onSubscriptionCancelled = useCallback(() => forceUpdate(new Date().getTime()), [forceUpdate])
    return <div>
        <div className="row">
            <div className="column column-60">
                <h2>/ Flare</h2>
            </div>
            <div className="column column-40">
                <Button href="/flare/add" block className="space">Create new subscription</Button>
            </div>
        </div>
        <hr className="flare"/>
        {!ids.length ? <div className="dimmed text-center text-small double-space">
            (you don&apos;t have active subscriptions so far)
        </div> : <div>
            {ids.map(id => <SubscriptionView id={id} key={id} onCancel={onSubscriptionCancelled}/>)}
        </div>}
    </div>
}

function SubscriptionView({id, onCancel}) {
    const [subscription, setSubscription] = useState()
    const [loadError, setLoadError] = useState()
    const [processingCancellation, setProcessingCancellation] = useState(false)
    const cancellationStarted = useRef(false)
    useEffect(() => {
        let cancelled = false
        setSubscription(null)
        setLoadError(null)
        loadSubscription(id)
            .then(nextSubscription => {
                if (!cancelled)
                    setSubscription(nextSubscription)
            })
            .catch(error => {
                console.error(error)
                if (!cancelled)
                    setLoadError('Unable to load this subscription.')
            })
        return () => {
            cancelled = true
        }
    }, [id])
    const cancel = useCallback(event => {
        event.preventDefault()
        if (!tryStartAction(cancellationStarted))
            return
        if (!confirm('Do you really want to cancel this subscription?')) {
            finishAction(cancellationStarted)
            return
        }
        setProcessingCancellation(true)
        cancelSubscription(id)
            .then(() => {
                notify({
                    type: 'success',
                    message: 'Subscription has been cancelled and the remaining tokens balance has been refunded to the owner\'s account'
                })
                onCancel()
            })
            .catch(e => {
                notify({type: 'error', message: 'Failed to cancel subscription'})
                console.error(e)
            })
            .finally(() => {
                finishAction(cancellationStarted)
                setProcessingCancellation(false)
            })
    }, [id, onCancel])
    if (loadError)
        return <div className="dimmed text-small space" role="alert">Unable to load this subscription.</div>
    if (!subscription)
        return null
    if (subscription.status === 'suspended') {
        removeOwnSubscription(id)
        return null
    }
    return <div className="space" style={processingCancellation ? {opacity: 0.4, cursor: 'wait'} : undefined}>
        <div className="dual-layout">
            <div>
                <h3>Subscription {id.toString()} <span className="text-small">({subscription.status})</span></h3>
            </div>
            <div className="micro-space">
                <a href="#" title="Cancel subscription" aria-disabled={processingCancellation}
                   className="icon-delete-circle" onClick={cancel}/>
            </div>
        </div>
        <div className="row">
            <SubscriptionTicker ticker={subscription.base} prefix="Base"/>
            <SubscriptionTicker ticker={subscription.quote} prefix="Quote"/>
        </div>
        <div className="row">
            <div className="column column-50">
                <span className="dimmed">Threshold: </span>{subscription.threshold / 10}%
            </div>
            <div className="column column-50">
                <span className="dimmed">Heartbeat: </span>{subscription.heartbeat} <span className="dimmed">minutes</span>
            </div>
        </div>
        <div className="row">
            <div className="column column-50">
                <span className="dimmed">Remaining balance: </span>{fromStroops(subscription.balance)} XRF
            </div>
            <div className="column column-50">
                <span className="dimmed">Last update: </span><UtcTimestamp date={subscription.updated}/>
            </div>
        </div>
        <hr className="flare"/>
    </div>
}

function SubscriptionTicker({ticker, prefix}) {
    return <div className="column column-50">
        <div>
            <span className="dimmed">{prefix} ticker: </span>
            {ticker.source === 'pubnet' ? <AssetLink asset={ticker.asset}/> : <>
                {ticker.source.toUpperCase()}:{shortenString(ticker.asset, 12)}
            </>}
        </div>
    </div>
}
