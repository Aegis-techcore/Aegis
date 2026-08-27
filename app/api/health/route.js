export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({
    status: 'ok',
    service: 'aegis',
    timestamp: new Date().toISOString()
  });
}
