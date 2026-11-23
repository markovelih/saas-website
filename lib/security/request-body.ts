import 'server-only'

export class BodyError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}

// Enforce the actual stream size; Content-Length is optional and untrusted.
export async function readBoundedBody(request: Request, max: number, timeoutMs = 15000) {
  if (Number(request.headers.get('content-length')) > max) throw new BodyError('Upload is too large.', 413)
  const encoding = request.headers.get('content-encoding')
  if (encoding && encoding !== 'identity') throw new BodyError('Compressed request bodies are not supported.', 415)
  const reader = request.body?.getReader()
  if (!reader) throw new BodyError('Missing request body.')
  let timedOut = false, size = 0
  const chunks: Uint8Array[] = []
  const timer = setTimeout(() => { timedOut = true; void reader.cancel().catch(() => {}) }, timeoutMs)
  try {
    while (true) {
      const {done, value} = await reader.read()
      if (timedOut) throw new BodyError('Upload timed out. Please retry.', 408)
      if (done) break
      size += value.length
      if (size > max) { await reader.cancel(); throw new BodyError('Upload is too large.', 413) }
      chunks.push(value)
    }
    return Buffer.concat(chunks, size)
  } finally { clearTimeout(timer); reader.releaseLock() }
}

export async function boundedFormData(request: Request, max: number) {
  const type = request.headers.get('content-type') || ''
  if (!/^multipart\/form-data\s*;/i.test(type) || type.length > 250) throw new BodyError('Choose files using the upload form.')
  const bytes = await readBoundedBody(request, max)
  try { return await new Response(new Uint8Array(bytes), {headers: {'Content-Type': type}}).formData() }
  catch { throw new BodyError('The upload form could not be read.') }
}
