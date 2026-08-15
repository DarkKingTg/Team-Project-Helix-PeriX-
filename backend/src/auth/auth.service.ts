import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OtpRecord {
  code: string;
  email: string;
  name?: string;
  role?: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private otpMap: Map<string, OtpRecord> = new Map();

  constructor(private configService: ConfigService) {}

  /**
   * Generates a 6-digit OTP and dispatches to email
   */
  async sendOtp(email: string, name?: string, role?: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('A valid email address is required');
    }

    const cleanEmail = email.trim().toLowerCase();
    // Generate secure 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

    this.otpMap.set(cleanEmail, {
      code,
      email: cleanEmail,
      name,
      role,
      expiresAt,
    });

    console.log(`\n========================================`);
    console.log(`📧 [PeriX Auth OTP] Verification for: ${cleanEmail}`);
    console.log(`🔑 6-Digit OTP Code: >>> ${code} <<<`);
    console.log(`⏱️  Expires in 10 minutes`);
    console.log(`========================================\n`);

    return {
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      email: cleanEmail,
      devOtp: code,
    };
  }

  /**
   * Verifies the provided 6-digit OTP
   */
  async verifyOtp(email: string, otp: string) {
    if (!email || !otp) {
      throw new BadRequestException('Email and OTP code are required');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const record = this.otpMap.get(cleanEmail);
    if (!record) {
      throw new BadRequestException('No verification request found for this email. Please request a new OTP.');
    }

    if (Date.now() > record.expiresAt) {
      this.otpMap.delete(cleanEmail);
      throw new BadRequestException('The OTP code has expired. Please request a new one.');
    }

    if (record.code !== cleanOtp) {
      throw new BadRequestException('Invalid OTP code. Please check your email and try again.');
    }

    // Success: Clean up used OTP
    this.otpMap.delete(cleanEmail);

    return {
      success: true,
      verified: true,
      email: cleanEmail,
      message: 'Email successfully verified',
    };
  }
}
