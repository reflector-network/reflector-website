const storageKey = 'ownSubscriptions'

export function getOwnSubscriptions() {
    const raw = localStorage.getItem(storageKey)
    if (!raw)
        return []
    return raw.split(',').map(v => BigInt(v))
}

/**
 * @param {bigint} id
 */
export function addOwnSubscription(id) {
    const ownSubscriptions = getOwnSubscriptions()
    ownSubscriptions.push(id)
    storeOwnSubscriptions(ownSubscriptions)
}

/**
 * @param {bigint} id
 */
export function removeOwnSubscription(id) {
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