import cors from 'cors';
import express, { type Request, type RequestHandler } from 'express';
import { z } from 'zod';

import { env } from './config/env.js';
import { getSupabaseClient, supabase } from './lib/supabase.js';

const app = express();
const port = env.port;

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));

interface AuthenticatedRequest extends Request {
  userId: string;
}

const requireUser: RequestHandler = async (req, res, next) => {
  const authorization = req.header('authorization');
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!accessToken) {
    res.status(401).json({ ok: false, message: 'A bearer access token is required' });
    return;
  }

  if (!supabase) {
    res.status(503).json({ ok: false, message: 'Backend Supabase configuration is missing' });
    return;
  }

  try {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      res.status(401).json({ ok: false, message: 'The access token is invalid or expired' });
      return;
    }

    (req as AuthenticatedRequest).userId = data.user.id;
    next();
  } catch {
    res.status(503).json({ ok: false, message: 'Unable to verify the access token' });
  }
};

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'camera-app-backend',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/ready', async (_req, res) => {
  const ready = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);

  if (!ready) {
    return res.status(503).json({
      ok: false,
      message: 'Missing Supabase environment variables',
    });
  }

  try {
    const client = supabase ?? getSupabaseClient();
    const { data, error } = await client.from('profiles').select('id').limit(1);

    if (error) {
      return res.status(503).json({
        ok: false,
        message: 'Supabase connectivity check failed',
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
      message: 'Unexpected backend error',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

const classSchema = z.object({
  name: z.string().min(2).max(80),
  schoolName: z.string().max(120).optional(),
  academicYear: z.number().int().min(2000).max(2100),
});

app.post('/api/classes', requireUser, async (req, res) => {
  const parsed = classSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: 'Invalid class payload',
      errors: parsed.error.flatten(),
    });
  }

  try {
    const { data, error } = await getSupabaseClient().rpc('create_class_with_owner', {
      class_name: parsed.data.name,
      class_school_name: parsed.data.schoolName ?? null,
      class_academic_year: parsed.data.academicYear,
      owner_user_id: (req as AuthenticatedRequest).userId,
    });

    if (error) {
      console.error('Class creation failed:', error.message);
      return res.status(500).json({ ok: false, message: 'Unable to create class' });
    }

    return res.status(201).json({ ok: true, class: data });
  } catch (error) {
    console.error('Class creation failed:', error);
    return res.status(503).json({ ok: false, message: 'Database is not available' });
  }
});

const postSchema = z.object({
  classId: z.string().min(1),
  userId: z.string().min(1),
  prompt: z.string().min(3),
  caption: z.string().max(280).optional(),
});

app.post('/api/posts/validate', (req, res) => {
  const parsed = postSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: 'Invalid post payload',
      errors: parsed.error.flatten(),
    });
  }

  return res.json({
    ok: true,
    message: 'Post payload valid',
    post: parsed.data,
  });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
