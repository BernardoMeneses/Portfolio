import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'

const AdminPage = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
      .then(res => {
        if (!res.ok) throw new Error('Login failed')
        return res.json()
      })
      .then(data => {
        localStorage.setItem('admin_token', data.token)
        navigate('/')
      })
      .catch(err => setError(err.message))
  }

  return (
    <div style={{ paddingTop: '80px' }} className="container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default AdminPage
