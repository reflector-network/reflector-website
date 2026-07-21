import {toStroops} from '@stellar-expert/formatter'
import SubscriptionClient from '@reflector/subscription-client'
import {connectWalletsKit} from '../auth/wallet'
import {addOwnSubscription, normalizeSubscriptionId, removeOwnSubscription} from './subscriptions-storage'
import {createFlareClientOptions} from './flare-client-options'

export async function createSubscription({base, quote, heartbeat, threshold, balance, webhook}) {
    if (!base?.asset || !base?.source || !quote?.asset || !quote?.source)
        return notify({type: 'warning', message: 'Please select base/quote price feeds'})
    balance = toStroops(balance)
    if (balance < 300_000_000n)
        return notify({type: 'warning', message: 'Initial XRF deposit is too low — a subscription needs at least 30 XRF'})
    if (balance > 100_000_000_000n)
        return notify({type: 'warning', message: 'This site limits a single initial deposit to 10,000 XRF'})
    if (!Number.isFinite(heartbeat) || heartbeat < 5)
        return notify({type: 'warning', message: 'Heartbeat interval can\'t be smaller than 5 minutes'})
    if (heartbeat > 240)
        return notify({type: 'warning', message: 'Heartbeat interval can\'t be larger than 240 minutes'})
    if (!Number.isFinite(threshold) || threshold < 1 || threshold > 10_000)
        return notify({type: 'warning', message: 'Price-change threshold must be between 0.1% and 1,000%'})
    if (!isValidFlareWebhookUrl(webhook))
        return notify({type: 'warning', message: 'Please provide a valid HTTP or HTTPS webhook URL'})
    const client = await createClient()
    const subscription = await client.createSubscription({
        webhook,
        base,
        quote,
        heartbeat,
        threshold,
        initialBalance: balance
    })
    addOwnSubscription(subscription.id)
    return true
}

export async function loadSubscription(id) {
    id = requireSubscriptionId(id)
    const client = await createClient(true)
    return client.getSubscription(id)
}

export async function cancelSubscription(id) {
    id = requireSubscriptionId(id)
    const client = await createClient()
    await client.cancel(id)
    removeOwnSubscription(id)
}

export async function depositToSubscription(id, amount) {
    const client = await createClient()
    return await client.deposit(id, amount)
}

export function isValidFlareWebhookUrl(value) {
    if (typeof value !== 'string' || value.length > 2000 || hasControlCharacters(value))
        return false
    let url
    try {
        url = new URL(value)
    } catch {
        return false
    }
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname)
}

function hasControlCharacters(value) {
    for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i)
        if (code <= 31 || code === 127)
            return true
    }
    return false
}

function requireSubscriptionId(value) {
    const id = normalizeSubscriptionId(value)
    if (id === null)
        throw new Error('Invalid subscription ID')
    return id
}

/**
 * @param {boolean} [readonly] - Create a simulation-only client without opening the wallet modal
 * @return {Promise<SubscriptionClient>}
 */
async function createClient(readonly = false) {
    const {address, kit} = await connectWalletsKit(readonly ? 'readonly' : 'default')
    if (!address)
        throw new Error('Authentication required. Please log in.')
    return new SubscriptionClient(createFlareClientOptions({address, kit}))
}
