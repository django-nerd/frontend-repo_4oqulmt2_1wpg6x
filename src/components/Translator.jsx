import { useEffect, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || ''

export default function Translator() {
  const [status, setStatus] = useState(null)
  const [file, setFile] = useState(null)
  const [sheet, setSheet] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [direction, setDirection] = useState('en2ar')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [retrieved, setRetrieved] = useState([])

  useEffect(() => {
    fetch(`${BACKEND}/rag/status`).then(r=>r.json()).then(setStatus).catch(()=>{})
  }, [])

  const upload = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      if (sheet) form.append('sheet_name', sheet)
      if (apiKey) form.append('api_key', apiKey)
      const r = await fetch(`${BACKEND}/rag/upload`, { method: 'POST', body: form })
      const data = await r.json()
      if (!r.ok) throw new Error(data.detail || 'Upload failed')
      setStatus(prev => ({...(prev||{}), indexed: data.rows_indexed, vector_dim: data.vector_dim}))
      alert('Uploaded and indexed!')
    } catch(err){
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const translate = async (e) => {
    e?.preventDefault()
    if (!query) return
    setLoading(true)
    setResult(null)
    try {
      const r = await fetch(`${BACKEND}/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, direction, api_key: apiKey })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.detail || 'Query failed')
      setResult(data.translation)
      setRetrieved(data.retrieved || [])
    } catch(err){
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
        <h2 className="text-2xl font-semibold text-white mb-2">RAG Translator</h2>
        <p className="text-blue-200/80 text-sm mb-6">Upload your glossary Excel, then translate with semantic search + LLM.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={upload} className="space-y-3">
            <div>
              <label className="block text-sm text-blue-200/80 mb-1">OpenAI API Key</label>
              <input value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="sk-..." className="w-full px-3 py-2 bg-slate-900/70 border border-white/10 rounded text-white placeholder:text-blue-200/40" />
            </div>
            <div>
              <label className="block text-sm text-blue-200/80 mb-1">Excel File (.xlsx)</label>
              <input type="file" accept=".xlsx,.xls" onChange={e=>setFile(e.target.files?.[0])} className="w-full text-blue-200" />
            </div>
            <div>
              <label className="block text-sm text-blue-200/80 mb-1">Sheet Name (optional)</label>
              <input value={sheet} onChange={e=>setSheet(e.target.value)} placeholder="e.g., Glossary" className="w-full px-3 py-2 bg-slate-900/70 border border-white/10 rounded text-white placeholder:text-blue-200/40" />
            </div>
            <button disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white disabled:opacity-50">{loading? 'Working...':'Upload & Build Index'}</button>
          </form>

          <form onSubmit={translate} className="space-y-3">
            <div>
              <label className="block text-sm text-blue-200/80 mb-1">Direction</label>
              <select value={direction} onChange={e=>setDirection(e.target.value)} className="w-full px-3 py-2 bg-slate-900/70 border border-white/10 rounded text-white">
                <option value="en2ar">English → Arabic</option>
                <option value="ar2en">Arabic → English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-blue-200/80 mb-1">Text</label>
              <textarea value={query} onChange={e=>setQuery(e.target.value)} rows={4} className="w-full px-3 py-2 bg-slate-900/70 border border-white/10 rounded text-white placeholder:text-blue-200/40" placeholder="Type text to translate..." />
            </div>
            <button disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white disabled:opacity-50">{loading? 'Translating...':'Translate'}</button>
          </form>
        </div>

        <div className="mt-8">
          {status && (
            <div className="text-blue-200/70 text-sm">Indexed rows: {status.indexed || 0} • Vector dim: {status.vector_dim || '—'}</div>
          )}
        </div>

        {result && (
          <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-400/20 rounded-lg">
            <div className="text-sm text-emerald-300 mb-1">Translation</div>
            <div className="text-white text-lg">{result}</div>
          </div>
        )}

        {retrieved?.length>0 && (
          <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-sm text-blue-200/70 mb-2">Top matches from your glossary</div>
            <ul className="space-y-2">
              {retrieved.map((r, i) => (
                <li key={i} className="text-blue-100/90 text-sm">
                  <span className="text-blue-300">EN:</span> {r.english} <span className="text-blue-300 ml-4">AR:</span> {r.arabic}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
