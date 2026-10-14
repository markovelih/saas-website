const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
let pathname = '/dashboard/admin'
let panelMounted = true
let historyCalls = []
global.document = {querySelector: () => panelMounted ? {} : null}
global.window = {
  location: {pathname, search: ''},
  history: {pushState: (_state, _title, href) => {
    historyCalls.push(href)
    const url = new URL(href, 'http://localhost')
    window.location.pathname = url.pathname
    window.location.search = url.search
  }}
}
function load(file) {
  const module = {exports: {}}
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true
  }}).outputText
  new Function('require', 'module', 'exports', compiled)(name => {
    if (name === 'next/navigation') return {usePathname: () => pathname}
    if (name === 'next/link') return {__esModule: true, default: 'a', useLinkStatus: () => ({pending: false})}
    if (name.startsWith('@/')) return load(path.resolve(name.slice(2) + '.ts'))
    return require(name)
  }, module, module.exports)
  return module.exports
}
const {studioView, studioHref, isStudioViewHref} = load('lib/workspace-navigation.ts')
const {WorkspaceNavigationLink} = load('components/workspace/navigation-link.tsx')
for (const view of ['board', 'list', 'clients', 'billing']) {
  const href = studioHref(view)
  assert(isStudioViewHref(href))
  assert.equal(studioView(new URL(href, 'http://localhost').searchParams.get('view')), view)
}
assert.equal(studioView('unknown'), 'board')
assert(!isStudioViewHref('/dashboard/admin?project=private-project'))
assert(!isStudioViewHref('/dashboard/admin?view=list&project=private-project'))
assert(!isStudioViewHref('https://other.example/dashboard/admin'))
function click(href, localStudioViews = true) {
  let prevented = false, closes = 0
  const link = WorkspaceNavigationLink({href, localStudioViews, children: 'Navigation', onNavigate: () => closes++})
  link.props.onNavigate({preventDefault: () => {prevented = true}})
  return {link, prevented, closes}
}
// One ordinary click changes the already-loaded studio view without a router request.
for (const href of ['/dashboard/admin?view=list', '/dashboard/admin?view=clients', '/dashboard/admin?view=billing', '/dashboard/admin']) {
  const before = historyCalls.length
  const result = click(href)
  assert.equal(result.prevented, true)
  assert.equal(result.closes, 1)
  assert.equal(historyCalls.length, before + 1)
  assert.equal(historyCalls.at(-1), href)
  click(href)
  assert.equal(historyCalls.length, before + 1, 'Repeated active clicks must not fill browser history')
}
// A not-yet-loaded panel and every real page still use Next's authenticated navigation.
panelMounted = false
assert.equal(click('/dashboard/admin?view=list').prevented, false)
panelMounted = true
assert.equal(click('/dashboard/orders').prevented, false)
assert.equal(click('/dashboard/admin?view=list', false).prevented, false)
pathname = '/dashboard/settings'
const page = click('/dashboard/admin?view=list')
assert.equal(page.prevented, false)
assert.equal(page.link.props.prefetch, true)
assert.equal(page.closes, 1)
assert.equal(click('/dashboard/orders', false).link.props.prefetch, true)
console.log('Workspace navigation passed: one-click view switching, repeated clicks, URL views, real-page prefetching, unloaded-panel fallback and menu close.')
