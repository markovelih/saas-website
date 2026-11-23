import 'server-only'
import sharp from 'sharp'
import {inflateRawSync} from 'node:zlib'
import {materialExtension, MATERIAL_FORMATS} from './material-policy'

// Inspect Office ZIP metadata without extracting files or following paths.
// This is structural validation, not a malware scanner.
function officeContainer(bytes: Buffer, ext: string) {
  if (bytes.length < 22 || bytes.readUInt32LE(0) !== 0x04034b50) throw Error('Invalid Office document.')
  let end = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (bytes.readUInt32LE(i) === 0x06054b50 && i + 22 + bytes.readUInt16LE(i + 20) === bytes.length) { end = i; break }
  }
  if (end < 0 || bytes.readUInt16LE(end + 4) || bytes.readUInt16LE(end + 6)) throw Error('Invalid Office document.')
  const count = bytes.readUInt16LE(end + 10), start = bytes.readUInt32LE(end + 16), length = bytes.readUInt32LE(end + 12)
  if (!count || count > 1000 || bytes.readUInt16LE(end + 8) !== count || start + length !== end) throw Error('Invalid Office document.')
  const names = new Set<string>()
  let pos = start, expanded = 0, contentTypes = ''
  for (let i = 0; i < count; i++) {
    if (pos + 46 > end || bytes.readUInt32LE(pos) !== 0x02014b50) throw Error('Invalid Office document.')
    const flags = bytes.readUInt16LE(pos + 8), method = bytes.readUInt16LE(pos + 10), packed = bytes.readUInt32LE(pos + 20), unpacked = bytes.readUInt32LE(pos + 24)
    const nameLength = bytes.readUInt16LE(pos + 28), extraLength = bytes.readUInt16LE(pos + 30), commentLength = bytes.readUInt16LE(pos + 32), local = bytes.readUInt32LE(pos + 42)
    const next = pos + 46 + nameLength + extraLength + commentLength
    if (next > end || local + 30 > start || flags & 1 || ![0, 8].includes(method)) throw Error('Encrypted or unsupported Office document.')
    const name = bytes.subarray(pos + 46, pos + 46 + nameLength).toString('utf8')
    if (!name || names.has(name) || /[\\\x00-\x1f]/.test(name) || name.startsWith('/') || name.split('/').some(p => p === '..' || p === '.') || /(?:vbaproject|activex|embeddings\/)|\.(?:exe|dll|js|vbs|bin)$/i.test(name)) throw Error('Active content is not supported. Export this document as a PDF.')
    names.add(name)
    expanded += unpacked
    if (expanded > 40 * 1024 * 1024 || bytes.readUInt32LE(local) !== 0x04034b50) throw Error('Office document exceeds processing limits.')
    const localName = bytes.readUInt16LE(local + 26), localExtra = bytes.readUInt16LE(local + 28), offset = local + 30 + localName + localExtra
    if (offset + packed > start || bytes.subarray(local + 30, local + 30 + localName).toString('utf8') !== name || bytes.readUInt16LE(local + 8) !== method || bytes.readUInt16LE(local + 6) !== flags) throw Error('Invalid Office document.')
    if (name === '[Content_Types].xml') {
      if (unpacked > 65536) throw Error('Invalid Office document.')
      const data = bytes.subarray(offset, offset + packed)
      const xml = method === 8 ? inflateRawSync(data, {maxOutputLength: 65536}) : data
      if (xml.length !== unpacked) throw Error('Invalid Office document.')
      contentTypes = xml.toString('utf8')
    }
    pos = next
  }
  const entry = ext === 'docx' ? 'word/document.xml' : ext === 'xlsx' ? 'xl/workbook.xml' : 'ppt/presentation.xml'
  if (pos !== end || !names.has(entry) || !contentTypes.includes('<Types') || /macroEnabled|vbaProject|<!DOCTYPE|<!ENTITY/i.test(contentTypes)) throw Error('Invalid or macro-enabled Office document. Export it as a PDF.')
}

export async function prepareMaterial(name: string, bytes: Buffer) {
  const ext = materialExtension(name)
  if (!ext) throw Error('This file format is not supported. ' + MATERIAL_FORMATS)
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
    const image = sharp(bytes, {limitInputPixels: 25000000, animated: false, failOn: 'warning'})
    const meta = await image.metadata(), expected = ext === 'jpg' ? 'jpeg' : ext
    if (meta.format !== expected) throw Error('The image contents do not match its file extension.')
    // Strip metadata and embedded payloads; store only a fresh raster image.
    const clean = await image.rotate().resize(2400, 2400, {fit: 'inside', withoutEnlargement: true}).webp({quality: 88}).toBuffer()
    return {bytes: clean, name: name.replace(/\.[^.]+$/, '.webp'), mime: 'image/webp'}
  }
  if (ext === 'pdf') {
    if (!/^%PDF-1\.[0-9]|^%PDF-2\.0/.test(bytes.subarray(0, 9).toString('ascii')) || !bytes.subarray(-2048).includes(Buffer.from('%%EOF'))) throw Error('This is not a valid PDF file.')
  } else if (['docx', 'xlsx', 'pptx'].includes(ext)) {
    officeContainer(bytes, ext)
  } else {
    const text = new TextDecoder('utf-8', {fatal: true}).decode(bytes)
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text)) throw Error('Choose a UTF-8 text file.')
    if (ext === 'json') JSON.parse(text)
    if (ext === 'svg' && !/^\s*(?:<\?xml[^>]*>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(text)) throw Error('This is not an SVG file.')
  }
  // Documents and SVG are always downloads, never executable page content.
  return {bytes, name, mime: 'application/octet-stream'}
}
