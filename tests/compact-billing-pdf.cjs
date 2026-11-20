const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const {PDFDocument} = require('pdf-lib')

function load(file) {
  file = path.resolve(file)
  const module = {exports: {}}
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true},
  }).outputText
  new Function('require', 'module', 'exports', code)(name =>
    name.startsWith('@/') ? load(path.resolve(name.slice(2)) + '.ts') :
    name.startsWith('.') ? load(path.resolve(path.dirname(file), name) + '.ts') : require(name),
  module, module.exports)
  return module.exports
}

const {billingPdf} = load('lib/billing/pdf.ts')
const {estimatePdf} = load('lib/billing/estimate-pdf.ts')
const {defaultBilling} = load('lib/billing/types.ts')
const {itemTotals, totals, discountBreakdown} = load('lib/billing/pricing.ts')
const services = [
  ['Website pages', 4, 75, 30], ['Catalog', 1, 150, 30],
  ['Design & animation', 1, 500, 70], ['Admin panel', 1, 600, 70],
  ['Payment integration // MonoPay', 1, 400, 70],
  ['SEO & performance', 1, 250, 0], ['Email integration', 1, 150, 0],
].map(([description, quantity, unit_price, percent]) => {
  const item = {description, quantity, unit_price, ...(percent ? {discount: {type: 'percent', value: percent}} : {})}
  return {...item, ...itemTotals(item)}
})
const snapshot = {
  version: 1, invoice_number: 'KX-2026-PDF-PREVIEW', receipt_number: 'RC-PDF-PREVIEW',
  issued_at: '2026-10-25T12:00:00Z', paid_at: '2026-05-13T12:00:00Z', currency: 'CAD',
  seller: defaultBilling, customer: {name: 'Preview customer', email: 'preview@example.com', address: ''},
  project: {id: 'preview', name: 'Website project'}, items: services,
  ...totals(services), ...discountBreakdown(services), tax: 0, settled: true, test: true,
  method: 'usdt_trc20', reference: '', crypto_amount: '',
}
const output = process.env.KORYX_PDF_TEST_OUTPUT || 'output/pdf/compact'
fs.mkdirSync(output, {recursive: true})
async function verify(name, snapshot, kind, expectedPages = 1) {
  const generate = () => kind === 'estimate' ? estimatePdf(snapshot) : billingPdf(snapshot, kind)
  const bytes = await generate()
  const doc = await PDFDocument.load(bytes)
  fs.writeFileSync(path.join(output, name + '.pdf'), bytes)
  assert.equal(doc.getPageCount(), expectedPages, name + ': page count')
  assert.deepEqual(bytes, await generate(), name + ': deterministic attachment')
  for (const page of doc.getPages()) {
    assert.equal(page.getWidth(), 595.28)
    assert.equal(page.getHeight(), 841.89)
  }
}

;(async () => {
  // The seven services in the reported receipt, including five service discounts.
  for (const kind of ['invoice', 'receipt', 'estimate']) {
    await verify('seven-services-' + kind, snapshot, kind)
  }
  await verify('unpaid-invoice', {...snapshot, settled: false}, 'invoice')
  for (const installment of ['deposit', 'balance', 'full']) {
    const staged = {...snapshot, installment, project_total: snapshot.total, total: 349.5,
      previous_paid: 0, remaining_balance: snapshot.total - 349.5, request_id: '00000000-0000-4000-8000-000000000002'}
    await verify(installment + '-invoice', {...staged, settled: false}, 'invoice')
    await verify(installment + '-receipt', staged, 'receipt')
  }
  const ten = Array.from({length: 10}, (_, i) => ({description: 'Website service ' + (i + 1), quantity: 1, unit_price: 50, amount: 50}))
  for (const kind of ['invoice', 'receipt', 'estimate']) {
    await verify('ten-services-' + kind, {...snapshot, items: ten, ...totals(ten), ...discountBreakdown(ten)}, kind)
  }
  const twelve=Array.from({length:12},(_,i)=>({...services[0],description:'Custom website service '+(i+1)}))
  const dense={...snapshot,items:twelve,...totals(twelve),...discountBreakdown(twelve)}
  for(const kind of ['invoice','receipt','estimate'])await verify('twelve-discounted-'+kind,dense,kind)
  for(const installment of ['deposit','balance','full']){
    const staged={...dense,installment,project_total:dense.total,total:dense.total/2,previous_paid:0,remaining_balance:dense.total/2,request_id:'00000000-0000-4000-8000-000000000002'}
    await verify('twelve-'+installment+'-invoice',{...staged,settled:false},'invoice')
    await verify('twelve-'+installment+'-receipt',staged,'receipt')
  }
  const sixteen=Array.from({length:16},(_,i)=>({...ten[0],description:'Website service '+(i+1)}))
  for(const kind of ['invoice','receipt','estimate'])await verify('sixteen-services-'+kind,{...snapshot,items:sixteen,...totals(sixteen),...discountBreakdown(sixteen)},kind)
  // Wrapped descriptions, payment references and Unicode must keep their own space.
  const wrapped = {...snapshot, customer: {...snapshot.customer, name: 'Іван Петренко', address: '123 Example Street\nVancouver, BC'},
    items: services.slice(0, 3).map(item => ({...item, description: item.description + ' — custom implementation with a longer description and Unicode Іван Петренко'})),
    reference: 'payment-reference-'.repeat(12), crypto_amount: '349.50'}
  for (const kind of ['invoice', 'receipt', 'estimate']) await verify('wrapped-' + kind, wrapped, kind)
  // Oversized documents still paginate instead of clipping content into the footer.
  const long = {...snapshot, items: Array.from({length: 30}, (_, i) => ({...services[0],
    description: 'Custom service ' + (i + 1) + ' — ' + 'Long Unicode description Іван '.repeat(4)}))}
  for (const kind of ['invoice', 'receipt', 'estimate']) {
    const bytes = kind === 'estimate' ? await estimatePdf(long) : await billingPdf(long, kind)
    assert((await PDFDocument.load(bytes)).getPageCount() > 1, kind + ': long document paginates')
    fs.writeFileSync(path.join(output, 'long-' + kind + '.pdf'), bytes)
  }
  console.log('Compact PDF checks passed: twelve discounted services, sixteen standard services, all payment stages, Unicode, wrapping, pagination and deterministic attachments.')
})().catch(error => {console.error(error); process.exitCode = 1})
