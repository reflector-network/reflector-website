const units = [
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000]
]

/**
 * Format a time span as a human-readable duration, e.g. "12 days 4 hours"
 * @param {bigint|number} milliseconds
 * @return {string}
 */
export function formatDuration(milliseconds) {
    let left = Number(milliseconds)
    if (!(left > 0))
        return 'less than a minute'
    const res = []
    for (const [name, size] of units) {
        const value = Math.floor(left / size)
        if (value > 0) {
            res.push(value + ' ' + name + (value > 1 ? 's' : ''))
            left -= value * size
        }
        if (res.length === 2)
            break
    }
    if (!res.length)
        return 'less than a minute'
    return res.join(' ')
}
