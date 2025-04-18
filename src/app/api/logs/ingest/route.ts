import { NextRequest, NextResponse } from 'next/server';
import { LogEntry } from '@/interfaces/log-entry.interface';

import { getServerSession } from "next-auth/next"
export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body: LogEntry = await req.json();

    // Basic input validation
    if (!body || !body.level || !body.message || !body.timestamp) {
      return NextResponse.json({ message: 'Invalid log entry' }, { status: 400 });
    }

    // Log the received data
    console.log('Received log entry:', body);

    // Append log entry to file
    try {
      const fs = require('fs');
      const logFilePath = 'application.log';
      const logEntry = `[${body.timestamp}] ${body.level}: ${body.message}\n`;

      fs.appendFile(logFilePath, logEntry, (err: any) => {
        if (err) {
          console.error('Error writing to log file:', err);
        }
      });
    } catch (e) {
      console.error("Logging error", e)
    }

    return NextResponse.json({ message: 'Log entry ingested successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error ingesting log:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}