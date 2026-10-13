const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
function load(file, overrides = {}) {
  file = path.resolve(file)
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText
  new Function('require', 'module', 'exports', code)(name => Object.hasOwn(overrides, name) ? overrides[name] : name === 'server-only' ? {} : name.startsWith('@/') ? load(path.resolve(name.slice(2)) + '.ts', overrides) : name.startsWith('.') ? load(path.resolve(path.dirname(file), name) + '.ts', overrides) : require(name), module, module.exports)
  return module.exports
}
const knowledge = load('lib/ai/koryx-knowledge.ts')
const policy = load('lib/payments/policy.ts')
const catalog = load('lib/project-planner/catalog.ts')
const publicFacts = knowledge.koryxPublicKnowledge()
assert(publicFacts.includes('support@koryx.ca'))
assert(publicFacts.includes(policy.paymentPolicy))
assert(publicFacts.includes(policy.cancellationPolicy))
for (const project of catalog.projectTypes) assert(publicFacts.includes(`${project.title}: from CAD ${project.base}`))
assert(publicFacts.includes('https://koryx.ca/dashboard/renewals'))
assert(publicFacts.includes('manual card entry'))
assert(publicFacts.includes('Domains and diagnostic services are not discountable'))
// A published price change must reach the AI without a second hand-edited price list.
const updated = load('lib/ai/koryx-knowledge.ts', { '@/lib/project-planner/catalog': { ...catalog, projectTypes: catalog.projectTypes.map(p => p.id === 'website' ? { ...p, base: 1777 } : p) } })
assert(updated.koryxPublicKnowledge().includes('Business website: from CAD 1777'))
assert(!updated.koryxPublicKnowledge().includes('Business website: from CAD 1500'))
for (const mode of ['chat', 'brief', 'scope']) {
  const system = knowledge.koryxAiSystem(mode)
  assert(system.includes('support@koryx.ca'))
  assert(system.includes(policy.paymentPolicy))
  assert(system.includes('no tools or access'))
  // No proprietor identity or private address is copied from the legal pages.
  const emails = [...system.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)].map(match => match[0])
  assert(emails.every(email => ['support@koryx.ca', 'reminder@koryx.ca'].includes(email)))
  if (mode === 'brief') assert(system.includes('Return only the improved brief'))
  if (mode === 'scope') assert(system.includes('Do not quote prices'))
}
const previousKey = process.env.AI_GATEWAY_API_KEY
process.env.AI_GATEWAY_API_KEY = 'TEST_SECRET_MUST_NOT_ENTER_PROMPT'
let userNumber = 0, signedIn = true
let captured = []
const overrides = {
  '@/lib/supabase/server': { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: signedIn ? { id: `test-user-${++userNumber}`, email: 'PRIVATE_EMAIL_SENTINEL@example.test', user_metadata: { address: 'PRIVATE_ADDRESS_SENTINEL', notes: 'PRIVATE_NOTE_SENTINEL' } } : null } }) } }) },
  ai: { generateText: async options => { captured.push(options); return { text: 'Mock reply', output: { summary: 'A scoped website.', complexity: 'standard', questions: [], recommendedFeatures: [], deferred: [] } } }, Output: { object: options => options } },
  '@/lib/project-planner/signature': { signEstimate: () => 'test-estimate-token' },
}
const chat = load('app/api/chat/route.ts', overrides)
const estimate = load('app/api/estimate/route.ts', overrides)
const request = (body, url = '/api/chat') => new Request('https://koryx.ca' + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
;(async () => {
  for (const mode of ['chat', 'brief']) {
    const response = await chat.POST(request({ mode, messages: [{ role: 'user', content: 'How do Koryx payments work?' }] }))
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
    assert.equal(captured.at(-1).system, knowledge.koryxAiSystem(mode))
  }
  const response = await estimate.POST(request({ type: 'website', budget: 2000, pages: 5, features: [], brief: 'A website for a local repair business with clear services.' }, '/api/estimate'))
  assert.equal(response.status, 200)
  assert.equal(captured.at(-1).system, knowledge.koryxAiSystem('scope'))
  for (const options of captured) {
    const payload = JSON.stringify(options)
    assert(!/PRIVATE_EMAIL_SENTINEL|PRIVATE_ADDRESS_SENTINEL|PRIVATE_NOTE_SENTINEL|TEST_SECRET_MUST_NOT_ENTER_PROMPT|test-user-/.test(payload))
  }
  const before = captured.length
  signedIn = false
  assert.equal((await chat.POST(request({ messages: [{ role: 'user', content: 'Hello' }] }))).status, 401)
  assert.equal(captured.length, before)
  console.log('AI knowledge checks passed: shared payment/refund policies, current public pricing, contact and navigation, all three AI modes, authenticated access and no account metadata or secrets sent to the provider. No live AI calls.')
})().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => { if (previousKey === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = previousKey })
