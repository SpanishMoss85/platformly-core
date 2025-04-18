/**
 * Client-side logging utility.
 *
 * This utility sends log data to the /api/logs/ingest endpoint using the fetch API.
 * If the API request fails, it falls back to console logging.
 */
class Logger {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Logs a message to the server and falls back to console if the server fails.
   * @param level - The log level (e.g., 'info', 'warn', 'error').
   * @param message - The message to log.
   * @param data - Optional data to include with the log.
   */
  log(level: string, message: string, data?: any): void {
    const logEntry = {
      level: level,
      message: message,
      data: data,
      timestamp: new Date().toISOString(),
    };

    this.sendToServer(logEntry);
  }

  private sendToServer(logEntry: any): void {
    fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logEntry),
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Failed to send log to server:', response.status, response.statusText);
          this.consoleFallback(logEntry);
        }
      })
      .catch((error) => {
        console.error('Failed to send log to server:', error);
        this.consoleFallback(logEntry);
      });
  }

  private consoleFallback(logEntry: any): void {
    console.log(`[${logEntry.level}] ${logEntry.message}`, logEntry.data || '');
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }
}

// Instantiate the logger with the API endpoint.
const logger = new Logger('/api/logs/ingest');

export default logger;