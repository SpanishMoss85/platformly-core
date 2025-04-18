import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';

// Define log entry schema with Zod for validation
const LogEntrySchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
  message: z.string().min(1).max(10000),
  timestamp: z.string().datetime(),
  source: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
  userId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
});

// Export the type for use elsewhere
export type LogEntry = z.infer<typeof LogEntrySchema>;

// Create rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 logs per minute
  analytics: true,
  prefix: '@upstash/ratelimit-logs',
});

// Get log file path from environment or use default
const LOG_FILE_PATH = process.env.LOG_FILE_PATH || 'logs/application.log';
const LOG_DIR = path.dirname(LOG_FILE_PATH);

/**
 * Formats a log entry for storage
 */
function formatLogEntry(entry: LogEntry): string {
  const metaStr = entry.meta ? ` ${JSON.stringify(entry.meta)}` : '';
  const sourceStr = entry.source ? ` [${entry.source}]` : '';
  const userStr = entry.userId ? ` [user:${entry.userId}]` : '';

  return `[${entry.timestamp}] ${entry.level.toUpperCase()}${sourceStr}${userStr}: ${entry.message}${metaStr}\n`;
}

/**
 * Writes a log entry to the file system
 */
async function writeLogEntry(formattedEntry: string): Promise<void> {
  try {
    // Ensure log directory exists
    await fs.mkdir(LOG_DIR, { recursive: true });

    // Append log to file
    await fs.appendFile(LOG_FILE_PATH, formattedEntry);
  } catch (error) {
    console.error('Failed to write log to file:', error);
    // In production, you might want to use a more robust logging solution
    // that doesn't depend on local file system
  }
}

/**
 * POST handler for log ingestion
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Check authentication
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Apply rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const userId = session.user.id || 'anonymous';
  const identifier = `${userId}:${ip}`;

  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  if (!success) {
    return NextResponse.json(
      { message: 'Too many log entries. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }

  try {
    // Parse and validate the log entry
    const rawBody = await req.json();

    // Add user ID from session if not provided
    if (!rawBody.userId && session.user.id) {
      rawBody.userId = session.user.id;
    }

    // Validate with Zod schema
    const validationResult = LogEntrySchema.safeParse(rawBody);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Invalid log entry format',
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const logEntry = validationResult.data;

    // Format the log entry
    const formattedEntry = formatLogEntry(logEntry);

    // Write to log file
    await writeLogEntry(formattedEntry);

    // Send response with rate limit headers
    return NextResponse.json(
      { message: 'Log entry ingested successfully' },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Error processing log entry:', error);

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
