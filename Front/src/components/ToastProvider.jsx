import React, { createContext, useContext, useState, useCallback } from 'react'
import './Styles/ToastProvider.scss'

const ToastContext = createContext(null)

export const useToast = () => useContext(ToastContext)

let idCounter = 1

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState({ open: false, message: '', resolve: null, title: '' })

  const showToast = useCallback((message, opts = {}) => {
    const id = idCounter++
    const toast = { id, message, type: opts.type || 'info' }
    setToasts(t => [...t, toast])
    const timeout = opts.timeout || 4000
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), timeout)
  }, [])

  const showConfirm = useCallback((message, title = 'Confirm') => {
    return new Promise((resolve) => {
      setConfirmState({ open: true, message, resolve, title })
    })
  }, [])

  const handleConfirm = (value) => {
    if (confirmState.resolve) confirmState.resolve(value)
    setConfirmState({ open: false, message: '', resolve: null, title: '' })
  }

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
        ))}
      </div>

      {confirmState.open && (
        <div className="toast-confirm-overlay">
          <div className="toast-confirm">
            <h4>{confirmState.title}</h4>
            <p>{confirmState.message}</p>
            <div className="confirm-actions">
              <button className="btn-outline" onClick={() => handleConfirm(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => handleConfirm(true)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export default ToastProvider
