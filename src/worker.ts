/**
 * Cloudflare Worker - Water Intelligence API
 * Handles serverless functions and API endpoints
 */

interface Env {
  CACHE: KVNamespace;
  DB: D1Database;
}

export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  submittedAt: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API Routes
    if (path === '/api/contact') {
      return handleContact(request, env, corsHeaders);
    }

    if (path === '/api/assessment') {
      return handleAssessment(request, env, corsHeaders);
    }

    if (path === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};

async function handleContact(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const data: ContactFormData = await request.json();

    // Validate
    if (!data.email || !data.name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store in KV (cache layer)
    const cacheKey = `contact:${Date.now()}:${data.email}`;
    await env.CACHE.put(cacheKey, JSON.stringify(data), { expirationTtl: 86400 });

    // Send notification (integrate with email service)
    console.log('Contact form submitted:', data);

    return new Response(
      JSON.stringify({ success: true, message: 'Thank you for your inquiry' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleAssessment(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const data = await request.json();

    // Process assessment request
    console.log('Assessment request:', data);

    return new Response(
      JSON.stringify({ success: true, message: 'Assessment request received' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Assessment error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
