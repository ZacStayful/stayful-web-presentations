export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const session = searchParams.get('session');
  const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/meeting:${session}`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
  });
  const { result } = await res.json();
  return Response.json({ slideId: result });
}
