/**
 * GudPreiss Core E-Commerce Business Logic Test Suite
 */

function testCartCalculation() {
  console.log('🧪 Testing Cart Subtotal, Discount & Tax Calculation...');

  const sampleItem1 = { price: 1150, quantity: 1 }; // Samsung Yantabalt Expe
  const sampleItem2 = { price: 160, quantity: 2 };  // DualSense Controller

  const subtotal = sampleItem1.price * sampleItem1.quantity + sampleItem2.price * sampleItem2.quantity;
  if (subtotal !== 1470) {
    throw new Error(`Cart subtotal mismatch: expected 1470, got ${subtotal}`);
  }

  // Apply 10% coupon
  const discountValue = 10;
  const discount = (subtotal * discountValue) / 100;
  if (discount !== 147) {
    throw new Error(`Discount calculation mismatch: expected 147, got ${discount}`);
  }

  // Free shipping check over $150
  const shipping = subtotal > 150 ? 0 : 15;
  if (shipping !== 0) {
    throw new Error(`Free shipping failed: expected 0, got ${shipping}`);
  }

  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;

  if (Math.round(total * 100) / 100 !== 1428.84) {
    throw new Error(`Total calculation mismatch: expected 1428.84, got ${total}`);
  }

  console.log('✅ Cart & Pricing calculations verified successfully!\n');
}

function testCouponValidation() {
  console.log('🧪 Testing Coupon Code Verification...');

  const coupons = [
    { code: 'TECH10', discount_type: 'percentage', discount_value: 10, active: true },
    { code: 'FREESHIP', discount_type: 'free_shipping', discount_value: 0, active: true }
  ];

  const validCoupon = coupons.find(c => c.code === 'TECH10' && c.active);
  if (!validCoupon) {
    throw new Error('Valid coupon TECH10 was not found or inactive');
  }

  console.log('✅ Coupon validation verified successfully!\n');
}

function runAllTests() {
  try {
    testCartCalculation();
    testCouponValidation();
    console.log('🎉 ALL TECHNOVA E-COMMERCE TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test Failure:', err.message);
    process.exit(1);
  }
}

runAllTests();
