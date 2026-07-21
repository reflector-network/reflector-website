/* Test doubles intentionally mirror asynchronous client APIs. */
/* eslint-disable require-await, class-methods-use-this */
const assert = require('node:assert/strict')
const {readFileSync} = require('node:fs')
const path = require('node:path')
const {pathToFileURL} = require('node:url')
const test = require('node:test')
const vm = require('node:vm')

const root = path.resolve(__dirname, '..')
const read = relativePath => readFileSync(path.join(root, relativePath), 'utf8')

function loadExports(relativePath, names, context = {}) {
    const filename = path.join(root, relativePath)
    const source = readFileSync(filename, 'utf8')
        .replace(/^import\s+.*$/gm, '')
        .replace(/^export\s+/gm, '')
    vm.runInNewContext(`${source}\nthis.__exports = {${names.join(',')}}`, context, {filename})
    return context.__exports
}

test('Flare client options honor the installed timeout key and wallet API', async () => {
    const calls = []
    const kit = {
        signTransaction: async (...args) => {
            calls.push(args)
            return {signedTxXdr: 'signed'}
        }
    }
    const {createFlareClientOptions, FLARE_TRANSACTION_TIMEOUT_SECONDS} = loadExports(
        'views/subscriptions/flare-client-options.js',
        ['createFlareClientOptions', 'FLARE_TRANSACTION_TIMEOUT_SECONDS']
    )
    const address = 'GCLA2E3LQDPAPJLHYDMB5R65ASGLNXWGJCX4TX7XA75C7VTJ7Y2OTZXA'
    const options = createFlareClientOptions({address, kit})

    assert.equal(FLARE_TRANSACTION_TIMEOUT_SECONDS, 600)
    assert.equal(options.callTimeout, 600)
    assert.equal(options.callTiemout, 600)
    assert.equal(options.publicKey, address)
    assert.equal(options.rpcUrl, 'https://mainnet.sorobanrpc.com')
    assert.equal(createFlareClientOptions({address, kit: null}).signTransaction, undefined)
    assert.deepEqual(
        await options.signTransaction('unsigned-xdr', {networkPassphrase: 'network'}),
        {signedTxXdr: 'signed'}
    )
    assert.equal(calls.length, 1)
    assert.equal(calls[0][0], 'unsigned-xdr')
    assert.equal(calls[0][1].address, address)
    assert.equal(calls[0][1].networkPassphrase, 'network')

    const moduleUrl = pathToFileURL(path.join(root, 'node_modules/@reflector/subscription-client/src/index.js'))
    const {default: SubscriptionClient} = await import(moduleUrl.href)
    const client = new SubscriptionClient(options)
    assert.equal(client.callTimeout, FLARE_TRANSACTION_TIMEOUT_SECONDS)
})

test('Flare creation and cancellation remain active', async () => {
    let walletConnections = 0
    let added
    let removed
    const calls = []
    class FakeSubscriptionClient {
        constructor(options) {
            calls.push({options})
        }

        async createSubscription(params) {
            calls.push({create: params})
            return {id: 19n}
        }

        async cancel(id) {
            calls.push({cancel: id})
        }
    }
    const {cancelSubscription, createSubscription} = loadExports(
        'views/subscriptions/subscription-actions.js',
        ['cancelSubscription', 'createSubscription'],
        {
            SubscriptionClient: FakeSubscriptionClient,
            addOwnSubscription: id => {
                added = id
            },
            connectWalletsKit: async () => {
                walletConnections++
                return {address: 'GCONNECTED', kit: {}}
            },
            createFlareClientOptions: auth => auth,
            normalizeSubscriptionId: value => BigInt(value),
            notify: () => {},
            removeOwnSubscription: id => {
                removed = id
            },
            toStroops: value => BigInt(value),
            URL
        }
    )

    const params = {
        balance: '300000000',
        base: {asset: 'BTC', source: 'exchanges'},
        heartbeat: 30,
        quote: {asset: 'XLM', source: 'pubnet'},
        threshold: 10,
        webhook: 'https://webhook.example.com/flare'
    }
    assert.equal(await createSubscription(params), true)
    await cancelSubscription('19')
    assert.equal(walletConnections, 2)
    assert.equal(added, 19n)
    assert.equal(removed, 19n)
    assert.equal(calls.filter(call => call.create).length, 1)
    assert.equal(calls.filter(call => call.cancel).length, 1)
})

test('invalid Flare inputs fail before wallet access', async () => {
    let walletConnections = 0
    const warnings = []
    const {normalizeSubscriptionId} = loadExports(
        'views/subscriptions/subscriptions-storage.js',
        ['normalizeSubscriptionId']
    )
    const {cancelSubscription, createSubscription, isValidFlareWebhookUrl} = loadExports(
        'views/subscriptions/subscription-actions.js',
        ['cancelSubscription', 'createSubscription', 'isValidFlareWebhookUrl'],
        {
            connectWalletsKit: async () => {
                walletConnections++
                return {address: 'GUNEXPECTED'}
            },
            notify: warning => {
                warnings.push(warning)
            },
            normalizeSubscriptionId,
            toStroops: value => BigInt(value),
            URL
        }
    )
    const valid = {
        balance: '30',
        base: {asset: 'BTC', source: 'exchanges'},
        heartbeat: 30,
        quote: {asset: 'XLM', source: 'pubnet'},
        threshold: 1,
        webhook: 'https://webhook.example.com/flare'
    }
    const invalidCases = [
        {...valid, balance: '-1'},
        {...valid, base: {asset: '', source: 'exchanges'}},
        {...valid, heartbeat: Number.NaN},
        {...valid, threshold: 0},
        {...valid, webhook: 'javascript:alert(1)'},
        {...valid, webhook: 'https://'},
        {...valid, webhook: 'https://webhook.example.com/\nflare'}
    ]

    for (const params of invalidCases)
        assert.equal(await createSubscription(params), undefined)
    await assert.rejects(cancelSubscription('bad'), /Invalid subscription ID/)
    await assert.rejects(cancelSubscription('18446744073709551616'), /Invalid subscription ID/)
    assert.equal(walletConnections, 0)
    assert.equal(warnings.length, invalidCases.length)
    assert.equal(isValidFlareWebhookUrl(valid.webhook), true)
    assert.equal(isValidFlareWebhookUrl('http://localhost:3000/flare'), true)
})

test('stored Flare IDs ignore malformed and duplicate values', () => {
    let stored = '1,bad,-2,0,3,1'
    const localStorage = {
        getItem: () => stored,
        setItem: (key, value) => {
            assert.equal(key, 'ownSubscriptions')
            stored = value
        }
    }
    const {addOwnSubscription, getOwnSubscriptions, normalizeSubscriptionId, removeOwnSubscription} = loadExports(
        'views/subscriptions/subscriptions-storage.js',
        ['addOwnSubscription', 'getOwnSubscriptions', 'normalizeSubscriptionId', 'removeOwnSubscription'],
        {localStorage}
    )

    assert.deepEqual(Array.from(getOwnSubscriptions(), String), ['1', '3'])
    assert.equal(normalizeSubscriptionId('4'), 4n)
    assert.equal(normalizeSubscriptionId('18446744073709551615'), 18_446_744_073_709_551_615n)
    assert.equal(normalizeSubscriptionId('18446744073709551616'), null)
    assert.equal(normalizeSubscriptionId('bad'), null)
    assert.throws(() => addOwnSubscription('bad'), /Invalid subscription ID/)
    addOwnSubscription(3n)
    assert.equal(stored, '1,bad,-2,0,3,1')
    addOwnSubscription(4n)
    assert.equal(stored, '1,3,4')
    removeOwnSubscription('bad')
    assert.equal(stored, '1,3,4')
    removeOwnSubscription(3n)
    assert.equal(stored, '1,4')
})

test('failed Flare calls do not mutate locally tracked IDs', async () => {
    let added = 0
    let removed = 0
    const callFailure = new Error('simulation rejected')
    class FailingSubscriptionClient {
        async createSubscription() {
            throw callFailure
        }

        async cancel() {
            throw callFailure
        }
    }
    const {cancelSubscription, createSubscription} = loadExports(
        'views/subscriptions/subscription-actions.js',
        ['cancelSubscription', 'createSubscription'],
        {
            SubscriptionClient: FailingSubscriptionClient,
            addOwnSubscription: () => added++,
            connectWalletsKit: async () => ({address: 'GCONNECTED', kit: {}}),
            createFlareClientOptions: () => ({}),
            notify: () => {},
            normalizeSubscriptionId: value => BigInt(value),
            removeOwnSubscription: () => removed++,
            toStroops: () => 300_000_000n,
            URL
        }
    )
    const valid = {
        balance: '1',
        base: {asset: 'USD', source: 'forex'},
        heartbeat: 30,
        quote: {asset: 'EUR', source: 'forex'},
        threshold: 10,
        webhook: 'https://webhook.site/example-token'
    }

    await assert.rejects(createSubscription(valid), error => error === callFailure)
    await assert.rejects(cancelSubscription(9), error => error === callFailure)
    assert.equal(added, 0)
    assert.equal(removed, 0)
})

test('Flare views use Mainnet metadata, explicit XRF units, and a prefilled deposit default', () => {
    const flareActions = read('views/subscriptions/subscription-actions.js')
    const createFlare = read('views/subscriptions/create-subscription-view.js')
    const flareView = read('views/subscriptions/subscriptions-view.js')

    assert.match(flareActions, /createFlareClientOptions\(\{address, kit\}\)/)
    assert.doesNotMatch(flareActions, /assertExpectedFlareDeployment|FLARE_CREATION_ENABLED|FLARE_CANCELLATION_ENABLED/)
    assert.doesNotMatch(flareActions, /getCurrentAccount|owner:/)
    assert.match(createFlare, /const network = 'public'/)
    assert.match(createFlare, /const \[balance, setBalance\] = useState\('30'\)/)
    assert.match(createFlare, /<Button block disabled={!canProceed} onClick={create}>/)
    assert.match(flareView, /fromStroops\(subscription\.balance\)/)
    assert.doesNotMatch(flareView, /subscription\.balance\.toString\(\)/)
    assert.match(flareView, /subscription\.status === 'suspended'/)
    assert.match(flareView, /event\.preventDefault\(\)/)
})
