/**
 * Atomically claim a mutable action flag before React can render updated state.
 *
 * @param {{current: boolean}} flag - Mutable flag, normally created with useRef
 * @return {boolean} Whether this caller acquired the action
 */
export function tryStartAction(flag) {
    if (flag.current)
        return false
    flag.current = true
    return true
}

/**
 * @param {{current: boolean}} flag - Mutable action flag
 */
export function finishAction(flag) {
    flag.current = false
}
