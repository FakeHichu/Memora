import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { getSupabaseClient, supabase } from "./lib/supabase.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { apiRoutes } from "./routes/index.js";
const app = express();
const port = env.port;
// CORS configuration - allow frontend from various sources
// Supports: localhost (web), 10.0.2.2 (Android emulator), LAN IPs
const allowedOrigins = [
  env.frontendUrl,
  'http://localhost:8081',
  'http://localhost:19006',
  'http://10.0.2.2:8081',
  'http://10.0.2.2:19006',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Allow any localhost port for development
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      
      // Allow Android emulator on any port
      if (origin.startsWith('http://10.0.2.2:')) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "memora-backend",
    timestamp: new Date().toISOString(),
  });
});
app.get("/api/ready", async (_req, res) => {
  const ready = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
  if (!ready) {
    return res.status(503).json({
      ok: false,
      message: "Missing Supabase environment variables",
    });
  }
  try {
    const client = supabase ?? getSupabaseClient();
    const { data, error } = await client.from("profiles").select("id").limit(1);
    if (error) {
      return res.status(503).json({
        ok: false,
        message: "Supabase connectivity check failed",
        details: error.message,
      });
    }
    return res.json({
      ok: true,
      supabaseConnected: true,
      sampleProfilesCount: data?.length ?? 0,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Unexpected backend error",
      details: error instanceof Error ? error.message : "unknown error",
    });
  }
});
app.use("/api", apiRoutes);
app.use(errorHandler);
// Bind to 0.0.0.0 to allow connections from Android emulator (10.0.2.2)
// and other devices on the network
app.listen(port, '0.0.0.0', () => {
  console.log(`Memora backend running on:`);
  console.log(`  - Local:    http://localhost:${port}`);
  console.log(`  - Network:  http://0.0.0.0:${port}`);
  console.log(`  - Android:  http://10.0.2.2:${port}`);
});