const backendApiBase =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000");
const clientSessionCookie = "musicplayer.clientSession";
const adminSessionCookie = "musicplayer.adminSession";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const hopByHopHeaders = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
]);

const publicRoutes = new Set([
  "POST /api/clients/session",
  "POST /api/admin/login",
  "POST /api/auth/signout"
]);

const adminRoutePrefixes = [
  "/api/admin",
  "/api/tools"
];

function cookieValue(request: Request, name: string) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  const match = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function proxiedUrl(request: Request, path: string[]) {
  if (!backendApiBase) {
    throw new Error("Missing BACKEND_API_URL for API proxy");
  }
  const url = new URL(request.url);
  const target = new URL(`/api/${path.join("/")}${url.search}`, backendApiBase);
  return target.toString();
}

function forwardedHeaders(request: Request) {
  const headers = new Headers(request.headers);
  for (const header of hopByHopHeaders) {
    headers.delete(header);
  }
  const clientSession = headers.get("x-client-session") || cookieValue(request, clientSessionCookie);
  const adminSession = headers.get("x-admin-session") || cookieValue(request, adminSessionCookie);
  if (clientSession) headers.set("x-client-session", clientSession);
  if (adminSession) headers.set("x-admin-session", adminSession);
  return headers;
}

function responseHeaders(upstreamHeaders: Headers) {
  const headers = new Headers(upstreamHeaders);
  for (const header of hopByHopHeaders) {
    headers.delete(header);
  }
  return headers;
}

function authError(request: Request, path: string[]) {
  const apiPath = `/api/${path.join("/")}`;
  if (publicRoutes.has(`${request.method.toUpperCase()} ${apiPath}`)) return null;

  const clientSession = request.headers.get("x-client-session") || cookieValue(request, clientSessionCookie);
  const adminSession = request.headers.get("x-admin-session") || cookieValue(request, adminSessionCookie);
  const needsAdmin = adminRoutePrefixes.some((prefix) => apiPath === prefix || apiPath.startsWith(`${prefix}/`));
  if (needsAdmin && !adminSession) {
    return Response.json({ error: "Admin session required" }, { status: 401 });
  }
  if (!needsAdmin && !clientSession) {
    return Response.json({ error: "Client session required" }, { status: 401 });
  }
  return null;
}

function sessionCookie(name: string, token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}`;
}

function expiredSessionCookie(name: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

async function sessionResponse(upstream: Response, cookieName: string) {
  const payload = await upstream.json().catch(() => null) as { token?: string } | null;
  const response = Response.json(payload, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders(upstream.headers)
  });
  if (upstream.ok && payload?.token) {
    response.headers.append("Set-Cookie", sessionCookie(cookieName, payload.token));
  }
  return response;
}

function signOutResponse() {
  const response = Response.json({ ok: true });
  response.headers.append("Set-Cookie", expiredSessionCookie(clientSessionCookie));
  response.headers.append("Set-Cookie", expiredSessionCookie(adminSessionCookie));
  return response;
}

async function proxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const apiPath = `/api/${path.join("/")}`;
  if (request.method.toUpperCase() === "POST" && apiPath === "/api/auth/signout") {
    return signOutResponse();
  }

  const unauthorized = authError(request, path);
  if (unauthorized) return unauthorized;

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  let upstream: Response;
  try {
    upstream = await fetch(proxiedUrl(request, path), {
      method,
      headers: forwardedHeaders(request),
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach backend API";
    return Response.json(
      { error: "Backend API unavailable", details: message },
      { status: 503 }
    );
  }
  if (method === "POST" && apiPath === "/api/clients/session") {
    return sessionResponse(upstream, clientSessionCookie);
  }
  if (method === "POST" && apiPath === "/api/admin/login") {
    return sessionResponse(upstream, adminSessionCookie);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders(upstream.headers)
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
