import { useState } from 'react'

const tabs = [
  ['versioning', '1. REST & Versioning'],
  ['success', '2. Success Codes'],
  ['errors', '3. Client Errors'],
  ['auth', '4. Authentication'],
  ['server', '5. Server Errors'],
]

async function request(url, options = {}) {
  const response = await fetch(url, options)
  const text = await response.text()
  let body = text ? JSON.parse(text) : null
  return { status: response.status, ok: response.ok, body }
}

function Status({ result }) {
  if (!result) return null
  return (
    <div className={`response ${result.ok ? 'ok' : 'bad'}`}>
      <span className="status">
        {result.status}  
        {result.status === 200 ? 'OK' : result.status === 201 ? 'Created' : result.status === 204 ? 'No Content' : ''}</span>
      {result.body && <pre>{JSON.stringify(result.body, null, 2)}</pre>}
    </div>
  )
}

function Versioning() {
  const [result, setResult] = useState(null)
  const load = () => request('http://localhost:3001/api/v1/products')
    .then(setResult)
    
    .catch(e => setResult({ status: 'Network', ok: false, body: { message: e.message } }))
  return <section>
        <h2>REST principles & API versioning</h2>
        <p>Resource URL: <code>GET /api/v1/products</code></p>
        <button onClick={load}>Fetch products</button>
        <Status result={result} />
    </section>
}

function SuccessCodes() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('Mouse')
  const [result, setResult] = useState(null)

  const load = async () => {
    const res = await request('http://localhost:3002/api/v1/items'); 
    setResult(res)
    if (res.ok) setItems(res.body.data)
  }
  const create = async () => {
    const res = await request('http://localhost:3002/api/v1/items', 
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ name }) }); setResult(res)
    if (res.ok) setItems(v => [...v, res.body.data])
  }
  const remove = async (id) => {
    const res = await request(`http://localhost:3002/api/v1/items/${id}`, 
      { method: 'DELETE' }); 
      setResult(res)
    if (res.ok) setItems(v => v.filter(item => item.id !== id))
  }
  return <section>
    <h2>Success status codes</h2>
      <div className="actions">
        <button onClick={load}>GET · 200</button>
        <input value={name} onChange={e => setName(e.target.value)} />
        <button onClick={create}>POST · 201</button>
      </div>
      <ul className="item-list">
        {items.map(item => (
          <li key={item.id}>
            <span>{item.name}</span>
            <button className="danger" onClick={() => remove(item.id)}>
              DELETE · 204
            </button>
          </li>
        ))}
      </ul>
  <Status result={result} />
</section>
}

function ClientErrors() {
  const [email, setEmail] = useState('alex@example.com')
  const [name, setName] = useState('Alex')
  const [id, setId] = useState('999')
  const [result, setResult] = useState(null)

  const create = () => request('http://localhost:3003/api/v1/users', 
    {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ email, name }) 
    } )
     .then(setResult)
     
  const find = () => request(`http://localhost:3003/api/v1/users/${id}`)
  .then(setResult)

  const missingFields = () => { setEmail(''); setName(''); setTimeout(create, 0) }


  return <section>
    <h2>Client error status codes</h2>
    <div className="form-grid">
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
    <button onClick={create}>POST · User</button>
    <button onClick={missingFields}>400 · Missing fields</button>
    </div>
    <div className="actions">
      <input value={id} onChange={e => setId(e.target.value)} placeholder="User ID" />
      <button onClick={find}>GET · 404</button></div>
      <Status result={result} />
  </section>
}

function Authentication() {
  const [token, setToken] = useState('')
  const [result, setResult] = useState(null)

  const load = () => request('http://localhost:3004/api/v1/admin/dashboard', 
    { headers: token ? { Authorization: token } : {} })
    .then(setResult)
    
  return <section>
    <h2>401 vs 403</h2>
    <p>Try no token (401), a user token (403), or an admin token (200).</p>
    <div className="actions">
      <button onClick={() => setToken('')}>No token</button>
      <button onClick={() => setToken('Bearer user-token')}>User token</button>
      <button onClick={() => setToken('Bearer admin-token')}>Admin token</button>
    </div>
    <button onClick={load}>GET admin dashboard</button>
    <Status result={result} />
  </section>
}

function ServerErrors() {
  const [result, setResult] = useState(null)

  const load = () => request('http://localhost:3005/api/v1/crash-test')
  .then(setResult)
  .catch(e => setResult({ status: 'Network', ok: false, body: { message: e.message } }))
  
  return <section>
    <h2>Server error & standard format</h2>
    <p>The Express server catches an unexpected error and returns a safe 500 response.</p>
    <button onClick={load}>Trigger 500 error</button>
    <Status result={result} />
  </section>
}

export default function App() {
  const [active, setActive] = useState('versioning')
  return (
    <main><header><div>
      <span className="eyebrow">DAY 32 · LEARNING LAB</span><h1>REST API Console</h1>
    </div></header>
    <nav>
      {
        tabs.map(([id, label]) => 
        <button key={id} className={active === id ? 'active' : ''} onClick={() => setActive(id)}>{label}</button>)
      }
      </nav>
    <div className="workspace">
      {active === 'versioning' && <Versioning />}
      {active === 'success' && <SuccessCodes />}
      {active === 'errors' && <ClientErrors />}
      {active === 'auth' && <Authentication />}
      {active === 'server' && <ServerErrors />}
    </div>
  </main>
  )
}
