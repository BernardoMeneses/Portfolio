import crypto from 'crypto';

// Store for OAuth states (in production, use Redis or similar)
const oauthStates = new Map();

// Generate random state for OAuth security
export function generateState() {
  const state = crypto.randomBytes(32).toString('hex');
  oauthStates.set(state, true);
  
  // Auto-cleanup after 10 minutes
  setTimeout(() => {
    oauthStates.delete(state);
  }, 10 * 60 * 1000);
  
  return state;
}

// Validate state
export function validateState(state) {
  return oauthStates.has(state);
}

// Remove state after use
export function removeState(state) {
  oauthStates.delete(state);
}
