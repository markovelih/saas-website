import { ImageResponse } from 'next/og'

export const alt = 'Koryx — custom websites, apps and software for Canada and the United States'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: '64px 76px', background: '#000', color: '#fff', fontFamily: 'sans-serif', border: '1px solid #333' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 34 }}><svg width="48" height="48" viewBox="0 0 128 128" fill="white"><path d="M27 83V104L98 27H77ZM63 84L79 101H99L76 73Z" /></svg>KORYX</div>
    <div style={{ display: 'flex', flexDirection: 'column', fontSize: 72, lineHeight: 1.12, letterSpacing: '-3px' }}><span>Websites. Apps.</span><span>Custom software.</span><span style={{ color: '#999' }}>Built for your business.</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 21, color: '#aaa' }}><span>Canada &amp; United States</span><span>koryx.ca</span></div>
  </div>, size)
}
