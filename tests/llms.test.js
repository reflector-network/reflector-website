const assert = require('node:assert/strict')
const {readFileSync} = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const root = path.resolve(__dirname, '..')
const importGen = () => import(path.join(root, 'scripts/build-llms.mjs'))

test('every site navigation route has an llms.txt description (drift guard)', async () => {
    const {navRoutes, DESCRIPTIONS, buildIndex} = await importGen()
    const missing = navRoutes().filter(r => !(r in DESCRIPTIONS))
    assert.deepEqual(missing, [], `navigation routes missing an llms.txt description: ${missing.join(', ')}`)
    assert.doesNotThrow(buildIndex)
})

test('committed static/llms.txt matches the generator output (regenerate with node scripts/build-llms.mjs)', async () => {
    const {buildIndex} = await importGen()
    const committed = readFileSync(path.join(root, 'static/llms.txt'), 'utf8')
    assert.equal(committed, buildIndex(), 'static/llms.txt is stale — run: node scripts/build-llms.mjs')
})

test('static/llms-full.txt exists and covers the three oracles', () => {
    const full = readFileSync(path.join(root, 'static/llms-full.txt'), 'utf8')
    assert.ok(full.length > 1500, 'llms-full.txt looks too short')
    for (const heading of ['Pulse oracle', 'Beam oracle', 'Flare oracle'])
        assert.match(full, new RegExp(heading), `llms-full.txt missing "${heading}"`)
    // never reintroduce a smashed compound product name
    assert.doesNotMatch(full, /ReflectorPulse|ReflectorFlare|ReflectorBeam/)
})
