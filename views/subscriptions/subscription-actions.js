import {Asset, Networks} from '@stellar/stellar-sdk'
import {toStroops} from '@stellar-expert/formatter'
import SubscriptionClient from '@reflector/subscription-client'
import {addOwnSubscription, removeOwnSubscription} from './subscriptions-storage'
import {connectWalletsKit, getCurrentAccount} from '../auth/wallet'

export async function createSubscription({base, quote, heartbeat, threshold, balance, webhook}) {
    if (!base || !quote)
        return notify({type: 'warning', message: 'Please select base/quote price feeds'})
    balance = toStroops(balance)
    if (!balance)
        return notify({type: 'warning', message: 'Please specify the initial subscription balance'})
    if (balance < 1000000)
        return notify({type: 'warning', message: 'Initial subscription balance is too low'})
    if (balance > 100000000000)
        return notify({type: 'warning', message: 'Initial subscription balance is too high'})
    if (heartbeat < 5)
        return notify({type: 'warning', message: 'Heartbeat interval can\'t be smaller than 5 minutes'})
    if (heartbeat > 240)
        return notify({type: 'warning', message: 'Heartbeat interval can\'t be larger than 240 minutes'})
    const client = await createClient()
    const subscription = await client.createSubscription({
        webhook,
        base,
        quote,
        owner: getCurrentAccount(),
        heartbeat,
        threshold,
        initialBalance: balance
    })
    console.log(subscription)
    addOwnSubscription(subscription.id)
    return true
}

export async function loadSubscription(id) {
    try {
        const client = await createClient(true)
        return client.getSubscription(id)
    } catch (e) {
        console.error(e)
        return null
    }
}

export async function cancelSubscription(id) {
    const client = await createClient()
    await client.cancel(id)
    removeOwnSubscription(id)
}

export async function depositToSubscription(id, amount) {
    const client = await createClient()
    return await client.deposit(id, amount)
}

function normalizeAsset(symbol) {
    if (symbol.length > 52) {//stellar asset
        const parts = symbol.split(':')
        symbol = (parts.length === 2 ? new Asset(parts[0], parts[1]) : Asset.native()).contractId(Networks.PUBLIC) //TODO: retrieve dynamically
    }
    return symbol
}

/**
 * @return {Promise<SubscriptionClient>}
 */
async function createClient(readonly = false) {
    const {address, kit} = await connectWalletsKit(readonly ? 'readonly' : 'default')
        .catch(e => notify({type: 'error', message: e.message}))
    if (!address)
        throw new Error('Authentication required. Please log in.')
    return new SubscriptionClient({
        publicKey: address,
        defaultFee: '100000',
        callTimeout: 600,
        rpcUrl: 'https://mainnet.sorobanrpc.com',
        signTransaction: (xdr, opts) => kit.signTransaction(xdr, {address, networkPassphrase: opts.networkPassphrase})
            .catch(e => notify({type: 'error', message: e.message}))
    })
}