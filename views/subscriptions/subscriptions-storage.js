const storageKey = 'ownSubscriptions'
const maxSubscriptionId = 18_446_744_073_709_551_615n

export function getOwnSubscriptions() {
    const raw = localStorage.getItem(storageKey)
    if (!raw)
        return []
    const subscriptions = []
    const seen = new Set()
    for (const value of raw.split(',')) {
        const id = normalizeSubscriptionId(value)
        if (id !== null && !seen.has(id.toString())) {
            subscriptions.push(id)
            seen.add(id.toString())
        }
    }
    return subscriptions
}

export function normalizeSubscriptionId(value) {
    try {
        const id = BigInt(value)
        return id > 0n && id <= maxSubscriptionId ? id : null
    } catch {
        return null
    }
}

/**
 * @param {bigint} id - subscription identifier
 */
export function addOwnSubscription(id) {
    id = normalizeSubscriptionId(id)
    if (id === null)
        throw new Error('Invalid subscription ID')
    const ownSubscriptions = getOwnSubscriptions()
    if (!ownSubscriptions.includes(id)) {
        ownSubscriptions.push(id)
        storeOwnSubscriptions(ownSubscriptions)
    }
}

/**
 * @param {bigint} id - subscription identifier
 */
export function removeOwnSubscription(id) {
    id = normalizeSubscriptionId(id)
    if (id === null)
        return
    const ownSubscriptions = getOwnSubscriptions()
    const idx = ownSubscriptions.indexOf(id)
    if (idx < 0)
        return
    ownSubscriptions.splice(idx, 1)
    storeOwnSubscriptions(ownSubscriptions)
}

function storeOwnSubscriptions(subscriptionIds) {
    localStorage.setItem(storageKey, subscriptionIds.join())
}
