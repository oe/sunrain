import jwt from 'jsonwebtoken';
import { logger } from '../logger.js';

export interface AppleMusicJWTConfig {
  teamId: string;
  keyId: string;
  privateKey: string;
}

export class AppleMusicJWTService {
  private config: AppleMusicJWTConfig;
  private currentToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private readonly TOKEN_DURATION = 3600; // 1 hour in seconds as per Apple spec

  constructor(config: AppleMusicJWTConfig) {
    this.config = config;
  }

  /**
   * Generate a new JWT token for Apple Music API
   */
  async generateToken(): Promise<string> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const expiry = now + this.TOKEN_DURATION;

      const payload = {
        iss: this.config.teamId,
        iat: now,
        exp: expiry
      };

      const header = {
        alg: 'ES256',
        kid: this.config.keyId
      };

      const token = jwt.sign(payload, this.config.privateKey, {
        algorithm: 'ES256',
        header
      });

      this.currentToken = token;
      this.tokenExpiry = new Date(expiry * 1000);

      logger.debug('Generated new Apple Music JWT token', {
        expiry: this.tokenExpiry.toISOString()
      });

      return token;
    } catch (error) {
      logger.error('Failed to generate Apple Music JWT token', { error });
      throw new Error(`JWT token generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a valid token, refreshing if necessary
   */
  async getValidToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.currentToken!;
    }

    return await this.refreshToken();
  }

  /**
   * Refresh the current token
   */
  async refreshToken(): Promise<string> {
    logger.debug('Refreshing Apple Music JWT token');
    return await this.generateToken();
  }

  /**
   * Check if the current token is valid and not expired
   */
  validateToken(token?: string): boolean {
    const tokenToValidate = token || this.currentToken;

    if (!tokenToValidate || !this.tokenExpiry) {
      return false;
    }

    // Check if token expires within the next 5 minutes (buffer time)
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const now = new Date();

    return this.tokenExpiry.getTime() > (now.getTime() + bufferTime);
  }

  /**
   * Check if the current token is valid
   */
  private isTokenValid(): boolean {
    return this.validateToken();
  }

  /**
   * Clear the current token (useful for testing or forced refresh)
   */
  clearToken(): void {
    this.currentToken = null;
    this.tokenExpiry = null;
    logger.debug('Cleared Apple Music JWT token');
  }

  /**
   * Get token expiry information
   */
  getTokenInfo(): { token: string | null; expiry: Date | null; isValid: boolean } {
    return {
      token: this.currentToken,
      expiry: this.tokenExpiry,
      isValid: this.isTokenValid()
    };
  }
}
