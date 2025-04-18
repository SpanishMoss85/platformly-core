/**
 * @file Defines the LogEntry interface for structured logging.
 */

/**
 * LogLevel enum defining the severity of a log entry.
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * @interface LogEntry
 * @description Defines the structure of a log entry.
 */
export interface LogEntry {
  /**
   * @property timestamp - The timestamp of the log entry.
   * @type {string}
   */
  timestamp: string;

  /**
   * @property level - The severity level of the log entry.
   * @type {LogLevel}
   */
  level: LogLevel;

  /**
   * @property message - The log message.
   * @type {string}
   */
  message: string;

  /**
   * @property service - The name of the service that generated the log entry.
   * @type {string}
   */
  service: string;

  /**
   * @property environment - The environment in which the service is running.
   * @type {string}
   */
  environment: string;

  /**
   * @property context - Additional context information for the log entry.
   * @type {object | null}
   */
  context: object | null;

  /**
   * @property userId - The ID of the user associated with the log entry.
   * @type {string | null}
   */
  userId: string | null;

  /**
   * @property orgId - The ID of the organization associated with the log entry.
   * @type {string | null}
   */
  orgId: string | null;
}