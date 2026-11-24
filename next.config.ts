import type { NextConfig } from "next";

const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https: wss:",
  "frame-src https:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: contentSecurityPolicyReportOnly,
  },
];

const noIndexHeader = {
  key: "X-Robots-Tag",
  value: "noindex, nofollow, noarchive, nosnippet",
};

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    const platform = "/junta11/platform.html";
    return [
      { source: "/", destination: "/junta11/index.html" },
      ...["login", "registro", "crear-liga", "recuperar", "mis-ligas", "demo"].map(
        (route) => ({ source: `/${route}`, destination: platform }),
      ),
      { source: "/panel/:id([0-9a-fA-F-]{36})", destination: platform },
      { source: "/:prefix(liga|l)/:slug", destination: platform },
      ...["/:prefix(liga|l)/:slug", "/demo"].map((prefix) => ({
        source: `${prefix}/:kind(equipos|jugadores|partidos|noticias)/:id`,
        destination: platform,
      })),
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/admin/:path*",
        headers: [noIndexHeader],
      },
      {
        source: "/api/:path*",
        headers: [noIndexHeader],
      },
      {
        source: "/login",
        headers: [noIndexHeader],
      },
      {
        source: "/registro",
        headers: [noIndexHeader],
      },
      {
        source: "/:privateRoute(crear-liga|recuperar|mis-ligas|panel)/:path*",
        headers: [noIndexHeader],
      },
    ];
  },
};

export default nextConfig;
