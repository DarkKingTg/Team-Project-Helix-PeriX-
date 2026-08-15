import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { FirebaseService } from '../firebase/firebase.service';

export interface OtpRecord {
  code: string;
  email: string;
  name?: string;
  role?: string;
  createdAt: number;
  expiresAt: number;
  verified?: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private otpMap: Map<string, OtpRecord> = new Map();

  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
    private firebaseService: FirebaseService,
  ) {}

  /**
   * Generates a 6-digit OTP and dispatches a real email to the user
   */
  async sendOtp(email: string, name?: string, role?: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('A valid email address is required');
    }

    const cleanEmail = email.trim().toLowerCase();
    // Generate secure 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes validity

    const otpData: OtpRecord = {
      code,
      email: cleanEmail,
      name: name?.trim(),
      role: role?.trim(),
      createdAt: now,
      expiresAt,
      verified: false,
    };

    // Store in local memory store
    this.otpMap.set(cleanEmail, otpData);

    // Also store in Firebase Firestore for distributed/persistent verification
    try {
      await this.firebaseService.collection('otp_verifications').doc(cleanEmail).set({
        email: cleanEmail,
        code,
        name: name || '',
        role: role || '',
        createdAt: this.firebaseService.serverTimestamp(),
        expiresAt,
        verified: false,
      });
    } catch (err: any) {
      this.logger.warn(`Firebase Firestore OTP sync warning: ${err.message}`);
    }

    this.logger.log(`\n========================================`);
    this.logger.log(`📧 [PeriX Auth OTP] Sending real email verification to: ${cleanEmail}`);
    this.logger.log(`🔑 6-Digit OTP Code Generated: >>> ${code} <<<`);
    this.logger.log(`⏱️  Expires in 10 minutes`);
    this.logger.log(`========================================\n`);

    // Dispatch real email via EmailService
    const emailResult = await this.emailService.sendOtpEmail(cleanEmail, code, name, role);

    return {
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please check your inbox or spam folder.`,
      email: cleanEmail,
      emailSent: emailResult.sent,
    };
  }

  /**
   * Verifies the provided 6-digit OTP against Firestore and in-memory store
   */
  async verifyOtp(email: string, otp: string) {
    if (!email || !otp) {
      throw new BadRequestException('Email and OTP code are required');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    let record = this.otpMap.get(cleanEmail);

    // If not in local memory, check Firebase Firestore
    if (!record) {
      try {
        const docSnap = await this.firebaseService.collection('otp_verifications').doc(cleanEmail).get();
        if (docSnap.exists) {
          const docData = typeof docSnap.data === 'function' ? docSnap.data() : docSnap;
          if (docData) {
            record = {
              code: docData.code,
              email: docData.email,
              name: docData.name,
              role: docData.role,
              createdAt: docData.createdAt || Date.now(),
              expiresAt: docData.expiresAt || Date.now() + 10 * 60 * 1000,
              verified: docData.verified,
            };
          }
        }
      } catch (err: any) {
        this.logger.warn(`Firebase Firestore OTP lookup warning: ${err.message}`);
      }
    }

    if (!record) {
      throw new BadRequestException('No verification request found for this email. Please request a new OTP code.');
    }

    if (Date.now() > record.expiresAt) {
      this.otpMap.delete(cleanEmail);
      try {
        await this.firebaseService.collection('otp_verifications').doc(cleanEmail).delete();
      } catch (e) {}
      throw new BadRequestException('The OTP verification code has expired. Please request a new code.');
    }

    if (record.code !== cleanOtp) {
      throw new BadRequestException('Invalid OTP code. Please check your email and try again.');
    }

    // Success: Mark verified in Firestore and clear active OTP
    this.otpMap.delete(cleanEmail);
    try {
      await this.firebaseService.collection('otp_verifications').doc(cleanEmail).update({
        verified: true,
        verifiedAt: this.firebaseService.serverTimestamp(),
      });
    } catch (e) {}

    this.logger.log(`✅ [PeriX Auth OTP] Email verified successfully for: ${cleanEmail}`);

    return {
      success: true,
      verified: true,
      email: cleanEmail,
      message: 'Email successfully verified.',
    };
  }
}

