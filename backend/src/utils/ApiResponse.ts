/**
 * Standard API response envelope — Approach 1 (single shape).
 *
 * Every endpoint returns:
 *   { success, statusCode, data, message }
 *
 * Success  → success: true,  data: <result>
 * Error    → success: false, data: null,   message: <reason>
 */

export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly data: T | null;
  public readonly message: string;

  constructor(statusCode: number, data: T | null, message: string = "") {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.data = data;
    this.message = message;
  }
}
