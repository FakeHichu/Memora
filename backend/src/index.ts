import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { getSupabaseClient, supabase } from "./lib/supabase.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { apiRoutes } from "./routes/index.js";

const app = express();
const port = env.port;

app.use(
  cors({
    origin: env.frontendUrl,
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

// Mount modular API routes
app.use("/api", apiRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Memora backend running on http://localhost:${port}`);
});
