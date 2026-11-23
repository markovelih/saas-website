const assert = require('node:assert/strict')
const loader = require('./helpers/load-typescript.cjs')

async function main() {
  const { authDestination } = loader()('lib/auth/destination.ts')
  for (const value of [null, {}, 'https://evil.test', '//evil.test', '/\\evil.test', '/login', '/dashboard/admin', '/dashboard/../login', '/dashboard\n']) assert.equal(authDestination(value), '/dashboard')
  assert.equal(authDestination('/dashboard/new-order?type=business'), '/dashboard/new-order?type=business')
  assert.equal(authDestination('/pay/3791df4a-ce09-418a-95f9-aab6548c3e5e'), '/pay/3791df4a-ce09-418a-95f9-aab6548c3e5e')

  let enabled = { google: true }, started = [], exchanged = [], fail = false
  let user = { id: 'client-id', user_metadata: { role: 'admin' } }
  let profileName = '', profileWrites = []
  const client = { auth: {
    signInWithOAuth: async input => { started.push(input); return fail ? { data: {}, error: {} } : { data: { url: 'https://project.supabase.co/auth/v1/authorize?provider=' + input.provider } } },
    exchangeCodeForSession: async code => { exchanged.push(code); return fail ? { data: {}, error: {} } : { data: { user } } },
  }, from: table => {
    assert.equal(table, 'profiles')
    return {
      select: columns => { assert.equal(columns, 'full_name'); return { eq: (column,id) => { assert.equal(column,'id'); assert.equal(id,user.id); return { maybeSingle: async () => ({data:{full_name:profileName},error:null}) } } } },
      update: values => ({ eq: async (column,id) => { assert.equal(column,'id'); assert.equal(id,user.id); profileWrites.push(values); profileName=values.full_name; return {error:null} } }),
    }
  } }
  const load = loader({
    '@/lib/supabase/server': { createClient: async () => client },
    '@/lib/auth/social-providers': { socialProviders: async () => enabled },
    'next/navigation': { redirect: url => { throw Object.assign(new Error('redirect'), { destination: url }) } },
  })
  const { startSocialSignIn } = load('app/(auth)/social-actions.ts')
  const form = provider => { const data = new FormData(); data.set('provider', provider); data.set('redirect', '/dashboard/new-order?type=business'); return data }
  assert.match((await startSocialSignIn({}, form('github'))).error, /choose/)
  assert.match((await startSocialSignIn({}, form('apple'))).error, /choose/)
  enabled.google = false
  assert.match((await startSocialSignIn({}, form('google'))).error, /not available/)
  assert.equal(started.length, 0)
  enabled.google = true
  for (const provider of ['google']) {
    await assert.rejects(startSocialSignIn({}, form(provider)), error => error.destination.includes('provider=' + provider))
    const request = started.at(-1)
    assert.equal(request.options.skipBrowserRedirect, true)
    const callback = new URL(request.options.redirectTo)
    assert.equal(callback.origin + callback.pathname, 'https://koryx.ca/auth/callback')
    assert.equal(callback.searchParams.get('next'), '/dashboard/new-order?type=business')
  }
  fail = true
  assert.match((await startSocialSignIn({}, form('google'))).error, /could not connect/)
  fail = false

  const { GET } = load('app/auth/callback/route.ts')
  const callback = query => GET(new Request('https://untrusted-host.test/auth/callback?' + query))
  for (const query of ['', 'error=access_denied&error_description=private-details', 'error=denied&code=ignored']) {
    const response = await callback(query)
    assert.equal(response.status, 303)
    assert.equal(new URL(response.headers.get('location')).origin, 'https://koryx.ca')
    assert.match(response.headers.get('location'), /auth_error=oauth/)
    assert.ok(!response.headers.get('location').includes('private-details'))
    assert.match(response.headers.get('cache-control'), /no-store/)
    assert.match(response.headers.get('x-robots-tag'), /noindex/)
  }
  assert.equal(exchanged.length, 0)
  let response = await callback('code=one-time-code&next=' + encodeURIComponent('/dashboard/new-order?type=business'))
  assert.equal(response.headers.get('location'), 'https://koryx.ca/dashboard/new-order?type=business')
  assert.deepEqual(exchanged, ['one-time-code'])
  response = await callback('code=valid&next=' + encodeURIComponent('https://evil.test'))
  assert.equal(response.headers.get('location'), 'https://koryx.ca/dashboard')
  user = { id: '2f0a1860-cb7a-4104-967d-86ccc9166cdc' }
  response = await callback('code=founder')
  assert.equal(response.headers.get('location'), 'https://koryx.ca/dashboard/admin')
  const { googleRegistrationName } = load('lib/auth/google-registration-name.ts')
  const googleUser = identity => ({id:'google-new-client',app_metadata:{provider:'google'},identities:[{provider:'google',identity_data:identity}]})
  assert.equal(googleRegistrationName(googleUser({full_name:'  Олена   Коваль  ',name:'Ignored'})), 'Олена Коваль')
  assert.equal(googleRegistrationName(googleUser({name:'Jane Smith'})), 'Jane Smith')
  assert.equal(googleRegistrationName(googleUser({given_name:'Jane',family_name:'Smith'})), 'Jane Smith')
  assert.equal(googleRegistrationName(googleUser({email:'invented.name@example.invalid'})), null)
  assert.equal(googleRegistrationName({...googleUser({name:'From linked Google'}),app_metadata:{provider:'email'}}), null)
  user=googleUser({name:'Олена Коваль',email:'completely.different@example.invalid'})
  response=await callback('code=new-google-signup')
  assert.equal(response.headers.get('location'),'https://koryx.ca/dashboard')
  assert.deepEqual(profileWrites,[{full_name:'Олена Коваль'}])
  profileName='Name edited in account settings'
  await callback('code=returning-google-user')
  assert.equal(profileWrites.length,1)
  user={...googleUser({name:'Linked Google name'}),app_metadata:{provider:'email'}}
  profileName=''
  await callback('code=existing-email-account')
  assert.equal(profileWrites.length,1)
  fail = true
  response = await callback('code=expired-secret')
  assert.match(response.headers.get('location'), /auth_error=oauth/)
  assert.ok(!response.headers.get('location').includes('expired-secret'))

  const originalFetch = global.fetch, oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL, oldKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://public-project.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key'
    const { socialProviders } = loader()('lib/auth/social-providers.ts')
    global.fetch = async (url, options) => {
      assert.equal(url, 'https://public-project.supabase.co/auth/v1/settings')
      assert.deepEqual(options.headers, { apikey: 'public-anon-key' })
      return { ok: true, json: async () => ({ external: { google: true, apple: 'true', github: true }, private: 'never-return' }) }
    }
    assert.deepEqual(await socialProviders(), { google: true })
    global.fetch = async () => { throw new Error('network unavailable') }
    assert.deepEqual(await socialProviders(), { google: false })
  } finally {
    global.fetch = originalFetch
    if (oldUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl
    if (oldKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = oldKey
  }
  console.log('Social auth: provider validation, safe redirects, callback success/failure, founder access, Google registration names, and public availability passed.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
