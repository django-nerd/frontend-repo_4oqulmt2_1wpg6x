import Translator from './components/Translator'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>
      <div className="relative min-h-screen p-8">
        <header className="max-w-5xl mx-auto text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/flame-icon.svg" alt="Flames" className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">English ↔ Arabic RAG Translator</h1>
          <p className="text-blue-200 mt-2">Upload your Excel glossary and translate with semantic search + LLM guidance.</p>
        </header>
        <Translator />
      </div>
    </div>
  )
}

export default App
