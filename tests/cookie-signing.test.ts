import { describe, it, expect, beforeEach } from 'vitest';
import { signValue, verifyValue, resetKeyCache } from '../src/lib/cookie-signing';

describe('cookie-signing', () => {
  const SECRET = 'test-secret-for-unit-tests';

  beforeEach(() => {
    process.env.AUTH_COOKIE_SECRET = SECRET;
    resetKeyCache();
  });

  // ── signValue ─────────────────────────────────────────

  describe('signValue', () => {
    it('returns a string containing a dot separator', async () => {
      const signed = await signValue('hello');
      expect(signed).toContain('.');
      expect(signed.startsWith('hello.')).toBe(true);
    });

    it('produces a deterministic signature for the same input', async () => {
      const a = await signValue('same-input');
      const b = await signValue('same-input');
      expect(a).toBe(b);
    });

    it('produces different signatures for different inputs', async () => {
      const a = await signValue('value-a');
      const b = await signValue('value-b');
      expect(a).not.toBe(b);
    });

    it('signature is a valid hex string', async () => {
      const signed = await signValue('test');
      const sig = signed.split('.').slice(1).join('.');
      expect(sig).toMatch(/^[0-9a-f]{64}$/); // SHA-256 = 64 hex chars
    });

    it('preserves the original value before the dot', async () => {
      const original = 'user-123|admin';
      const signed = await signValue(original);
      const recovered = signed.substring(0, signed.lastIndexOf('.'));
      expect(recovered).toBe(original);
    });
  });

  // ── verifyValue ───────────────────────────────────────

  describe('verifyValue', () => {
    it('returns the original value for a valid signature', async () => {
      const original = 'my-cookie-value';
      const signed = await signValue(original);
      const verified = await verifyValue(signed);
      expect(verified).toBe(original);
    });

    it('returns null for a tampered value', async () => {
      const signed = await signValue('original');
      // Tamper: change the value part but keep a fake signature
      const tampered = 'tampered.' + signed.split('.')[1];
      const verified = await verifyValue(tampered);
      expect(verified).toBeNull();
    });

    it('returns null for a tampered signature', async () => {
      const signed = await signValue('original');
      const parts = signed.split('.');
      const tampered = parts[0] + '.0000' + parts[1].slice(4);
      const verified = await verifyValue(tampered);
      expect(verified).toBeNull();
    });

    it('returns null when no dot is present', async () => {
      const verified = await verifyValue('nodothere');
      expect(verified).toBeNull();
    });

    it('returns null for an empty string', async () => {
      const verified = await verifyValue('');
      expect(verified).toBeNull();
    });

    it('returns null for a completely random string', async () => {
      const verified = await verifyValue('abc.def1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab');
      expect(verified).toBeNull();
    });

    it('handles values with special characters', async () => {
      const original = '{"id":"u-1","email":"test@example.com","role":"admin"}';
      const signed = await signValue(original);
      const verified = await verifyValue(signed);
      expect(verified).toBe(original);
    });

    it('handles values with unicode', async () => {
      const original = 'Ünïcödé-Ñamé-日本語';
      const signed = await signValue(original);
      const verified = await verifyValue(signed);
      expect(verified).toBe(original);
    });
  });

  // ── Round-trip & security ─────────────────────────────

  describe('round-trip', () => {
    it('sign → verify → returns original for various inputs', async () => {
      const values = [
        'simple',
        '',
        'a'.repeat(1000),
        JSON.stringify({ role: 'admin' }),
        'line1\nline2',
        'spaces and\ttabs',
      ];

      for (const value of values) {
        const signed = await signValue(value);
        const verified = await verifyValue(signed);
        expect(verified).toBe(value);
      }
    });

    it('different secrets produce different signatures', async () => {
      const original = 'secret-value';

      process.env.AUTH_COOKIE_SECRET = 'secret-a';
      resetKeyCache();
      const signedA = await signValue(original);

      process.env.AUTH_COOKIE_SECRET = 'secret-b';
      resetKeyCache();
      const signedB = await signValue(original);

      expect(signedA).not.toBe(signedB);

      // Neither verifies with the other's secret
      // (They use the same module-level key, so we test indirectly)
      expect(signedA.split('.')[1]).not.toBe(signedB.split('.')[1]);
    });
  });
});
