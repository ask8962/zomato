import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface RateLimitData {
  attempts: number;
  lastAttempt: Timestamp;
  blockedUntil?: Timestamp;
}

export class RateLimiter {
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

  static async checkRateLimit(userId: string, action: string): Promise<{ allowed: boolean; remainingAttempts?: number; blockedUntil?: Date }> {
    try {
      const rateLimitId = `${userId}_${action}`;
      const rateLimitDoc = await getDoc(doc(db, 'rateLimits', rateLimitId));
      
      const now = new Date();
      
      if (!rateLimitDoc.exists()) {
        // First attempt
        await setDoc(doc(db, 'rateLimits', rateLimitId), {
          attempts: 1,
          lastAttempt: Timestamp.fromDate(now)
        });
        return { allowed: true, remainingAttempts: this.MAX_ATTEMPTS - 1 };
      }

      const data = rateLimitDoc.data() as RateLimitData;
      
      // Check if user is currently blocked
      if (data.blockedUntil && now < data.blockedUntil.toDate()) {
        return { allowed: false, blockedUntil: data.blockedUntil.toDate() };
      }

      // Check if window has expired
      const windowStart = new Date(now.getTime() - this.WINDOW_MS);
      if (data.lastAttempt.toDate() < windowStart) {
        // Reset counter
        await updateDoc(doc(db, 'rateLimits', rateLimitId), {
          attempts: 1,
          lastAttempt: Timestamp.fromDate(now),
          blockedUntil: null
        });
        return { allowed: true, remainingAttempts: this.MAX_ATTEMPTS - 1 };
      }

      // Increment attempts
      const newAttempts = data.attempts + 1;
      
      if (newAttempts > this.MAX_ATTEMPTS) {
        // Block user
        const blockedUntil = new Date(now.getTime() + this.BLOCK_DURATION_MS);
        await updateDoc(doc(db, 'rateLimits', rateLimitId), {
          attempts: newAttempts,
          lastAttempt: Timestamp.fromDate(now),
          blockedUntil: Timestamp.fromDate(blockedUntil)
        });
        return { allowed: false, blockedUntil };
      }

      // Update attempts
      await updateDoc(doc(db, 'rateLimits', rateLimitId), {
        attempts: newAttempts,
        lastAttempt: Timestamp.fromDate(now)
      });

      return { allowed: true, remainingAttempts: this.MAX_ATTEMPTS - newAttempts };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Allow on error to prevent blocking legitimate users
      return { allowed: true };
    }
  }

  static async recordSuccess(userId: string, action: string): Promise<void> {
    try {
      const rateLimitId = `${userId}_${action}`;
      await updateDoc(doc(db, 'rateLimits', rateLimitId), {
        attempts: 0,
        blockedUntil: null
      });
    } catch (error) {
      console.error('Failed to record success:', error);
    }
  }
} 