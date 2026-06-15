export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { sessionId, slideId } = await req.json();
  await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/meeting:${sessionId}/${slideId}`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
  });
  return Response.json({ ok: true });
}
