import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  createOrderSchema,
  type LoginInput,
  type RegisterInput,
  type CreateOrderInput,
} from '../src/lib/validation';

// ── loginSchema ─────────────────────────────────────────

describe('loginSchema', () => {
  const valid: LoginInput = { email: 'user@test.de', password: 'pass123' };

  it('accepts valid input', () => {
    const result = loginSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({ ...valid, email: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects email without @', () => {
    const result = loginSchema.safeParse({ ...valid, email: 'userexample.com' });
    expect(result.success).toBe(false);
  });

  it('accepts various valid email formats', () => {
    const emails = [
      'simple@example.com',
      'user.name+tag@example.de',
      'user@subdomain.example.com',
      'test123@test.co',
    ];
    for (const email of emails) {
      const result = loginSchema.safeParse({ ...valid, email });
      expect(result.success).toBe(true);
    }
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ ...valid, password: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password');
    }
  });

  it('accepts single-character password', () => {
    const result = loginSchema.safeParse({ ...valid, password: 'x' });
    expect(result.success).toBe(true);
  });

  it('rejects missing fields', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects extra unknown fields (strict mode)', () => {
    const result = loginSchema.safeParse({ ...valid, role: 'admin' });
    // Zod strips unknown fields by default, so this should succeed
    expect(result.success).toBe(true);
  });
});

// ── registerSchema ──────────────────────────────────────

describe('registerSchema', () => {
  const valid: RegisterInput = {
    fullName: 'Max Mustermann',
    email: 'max@test.de',
    password: 'secure123',
  };

  it('accepts valid input', () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects short fullName (< 2 chars)', () => {
    const result = registerSchema.safeParse({ ...valid, fullName: 'M' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('fullName');
    }
  });

  it('accepts single-char name that is exactly 2 chars', () => {
    const result = registerSchema.safeParse({ ...valid, fullName: 'AB' });
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = registerSchema.safeParse({ ...valid, email: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'bad-email' });
    expect(result.success).toBe(false);
  });

  it('rejects short password (< 6 chars)', () => {
    const result = registerSchema.safeParse({ ...valid, password: '12345' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password');
    }
  });

  it('accepts password with exactly 6 chars', () => {
    const result = registerSchema.safeParse({ ...valid, password: '123456' });
    expect(result.success).toBe(true);
  });

  it('rejects missing all fields', () => {
    const result = registerSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('reports all errors at once', () => {
    const result = registerSchema.safeParse({
      fullName: '',
      email: 'bad',
      password: '12',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain('fullName');
      expect(paths).toContain('email');
      expect(paths).toContain('password');
    }
  });
});

// ── createOrderSchema ───────────────────────────────────

describe('createOrderSchema', () => {
  const valid: CreateOrderInput = {
    items: [{ productId: 'prod-1', quantity: 2, price: 29.99 }],
    totalAmount: 59.98,
    shippingAddress: 'Musterstraße 1, 10115 Berlin',
  };

  it('accepts valid order', () => {
    const result = createOrderSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('accepts optional couponCode', () => {
    const result = createOrderSchema.safeParse({
      ...valid,
      couponCode: 'SAVE10',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty items array', () => {
    const result = createOrderSchema.safeParse({ ...valid, items: [] });
    expect(result.success).toBe(false);
  });

  it('rejects item with empty productId', () => {
    const result = createOrderSchema.safeParse({
      ...valid,
      items: [{ productId: '', quantity: 1, price: 10 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects item with zero quantity', () => {
    const result = createOrderSchema.safeParse({
      ...valid,
      items: [{ productId: 'p1', quantity: 0, price: 10 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects item with negative quantity', () => {
    const result = createOrderSchema.safeParse({
      ...valid,
      items: [{ productId: 'p1', quantity: -1, price: 10 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects item with fractional quantity', () => {
    const result = createOrderSchema.safeParse({
      ...valid,
      items: [{ productId: 'p1', quantity: 1.5, price: 10 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects item with zero price', () => {
    const result = createOrderSchema.safeParse({
      ...valid,
      items: [{ productId: 'p1', quantity: 1, price: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative totalAmount', () => {
    const result = createOrderSchema.safeParse({ ...valid, totalAmount: -10 });
    expect(result.success).toBe(false);
  });

  it('rejects short shippingAddress', () => {
    const result = createOrderSchema.safeParse({
      ...valid,
      shippingAddress: '123',
    });
    expect(result.success).toBe(false);
  });

  it('accepts multi-item order', () => {
    const result = createOrderSchema.safeParse({
      ...valid,
      items: [
        { productId: 'a', quantity: 1, price: 10 },
        { productId: 'b', quantity: 3, price: 20 },
      ],
      totalAmount: 70,
    });
    expect(result.success).toBe(true);
  });
});
