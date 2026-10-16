// Minimal client for the Upstash Redis REST API (what Vercel's "Upstash for Redis"
// storage integration provisions). Uses the built-in fetch, so no extra dependency.
//
// Env vars (either naming works):
//   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
//   KV_REST_API_URL        / KV_REST_API_TOKEN        (older Vercel KV names)
//
// Read lazily: dotenv runs after route modules are imported.
const getConfig = () => ({
  url: (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').replace(/\/+$/, ''),
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || ''
});

export const isRedisConfigured = () => {
  const { url, token } = getConfig();
  return Boolean(url && token);
};

/**
 * Run several Redis commands in one HTTP round trip.
 * @param {Array<Array<string|number>>} commands e.g. [['LPUSH', 'key', 'value'], ['LTRIM', 'key', 0, 99]]
 * @returns {Promise<any[]>} one result per command
 */
export async function redisPipeline(commands) {
  const { url, token } = getConfig();
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commands)
  });

  if (!res.ok) {
    throw new Error(`Redis request failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.map((item) => {
    if (item.error) throw new Error(`Redis error: ${item.error}`);
    return item.result;
  });
}

export const redis = async (...command) => (await redisPipeline([command]))[0];

export default { isRedisConfigured, redisPipeline, redis };
