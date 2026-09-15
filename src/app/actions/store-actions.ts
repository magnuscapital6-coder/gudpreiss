'use server';

import { createOrder, updateOrderStatus, createCoupon, createCategory, updateReviewStatus, getProducts, getCategories, getBanners, getStoreSettings, getOrderById, getOrders } from '@/lib/db/db-provider';
import { getServerSession, type ServerSession } from '@/lib/supabase/server';
import { sendOrderConfirmationEmail, sendOrderAdminNotificationEmail } from '@/lib/email/mailer-service';
import { createNotification } from '@/lib/notifications/service';
import { Order, Coupon, Category, Product, ShippingAddress } from '@/types';

/**
 * Server actions are public HTTP endpoints: every action returning order data
 * must check the caller. Order numbers (GP-2026-XXXX) are trivially guessable.
 */
function isOrderOwner(session: ServerSession, order: Order): boolean {
  if (!session.isAuthenticated) return false;
  if (session.userId && order.user_id === session.userId) return true;
  return !!session.email && (order.customer_email || '').toLowerCase() === session.email.toLowerCase();
}

/**
 * Public view of an order: status, items and totals, without customer PII.
 * Built from an allowlist because DB rows carry extra columns
 * (customer_name, shipping_address_json, ...).
 */
function redactOrder(order: Order): Order {
  const publicAddress: ShippingAddress = {
    full_name: '',
    address_line1: '',
    city: order.shipping_address?.city || '',
    postal_code: '',
    country: order.shipping_address?.country || '',
    phone: '',
  };
  return {
    id: order.id,
    order_number: order.order_number,
    customer_email: '',
    customer_phone: '',
    shipping_address: publicAddress,
    billing_address: publicAddress,
    items: order.items,
    subtotal: order.subtotal,
    discount_amount: order.discount_amount,
    tax_amount: order.tax_amount,
    shipping_fee: order.shipping_fee,
    total_amount: order.total_amount,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    order_status: order.order_status,
    tracking_number: order.tracking_number,
    coupon_code: order.coupon_code,
    bank_transfer_iban: order.bank_transfer_iban,
    bank_transfer_bic: order.bank_transfer_bic,
    bank_transfer_holder: order.bank_transfer_holder,
    created_at: order.created_at,
    updated_at: order.updated_at,
  };
}

/**
 * Server Action: Fetch all orders for Admin Dashboard (Admin Only)
 */
export async function getAdminOrdersServerAction(): Promise<{ success: boolean; orders: Order[] }> {
  try {
    const session = await getServerSession();
    if (!session.isAdmin) {
      return { success: false, orders: [] };
    }

    const orders = await getOrders();
    return { success: true, orders };
  } catch (err) {
    console.error('[Admin Orders Action] Error fetching orders:', err);
    return { success: false, orders: [] };
  }
}

/**
 * Server Action: Get Order Details by order number or id.
 * Only admins and the order's owner get the order; guests rely on the copy
 * the checkout stored in localStorage.
 */
export async function getOrderDetailsServerAction(orderNumber: string): Promise<{ success: boolean; order?: Order | null }> {
  try {
    const session = await getServerSession();
    if (!session.isAuthenticated) {
      return { success: false, order: null };
    }

    const order = await getOrderById(orderNumber);
    if (!order || !(session.isAdmin || isOrderOwner(session, order))) {
      return { success: false, order: null };
    }
    return { success: true, order };
  } catch (err) {
    return { success: false, order: null };
  }
}

/**
 * Server Action: Submit Order 100% Server-Side
 * Requires an authenticated session.
 */
export async function createOrderServerAction(orderPayload: {
  customer_email: string;
  customer_phone?: string;
  shipping_address: any;
  billing_address?: any;
  items: any[];
  subtotal: number;
  discount_amount?: number;
  shipping_cost?: number;
  tax_amount?: number;
  total_amount: number;
  coupon_code?: string;
  payment_method: string;
}): Promise<{ success: boolean; order?: Order; error?: string; emails?: { customer: boolean; admin: boolean } }> {
  try {
    // Validate required fields
    if (!orderPayload.customer_email || !orderPayload.customer_email.includes('@')) {
      return { success: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' };
    }

    if (!orderPayload.shipping_address || !orderPayload.items?.length) {
      return { success: false, error: 'Pflichtfelder fehlen (Lieferadresse, Artikel).' };
    }

    // Validate total_amount is positive
    if (!orderPayload.total_amount || orderPayload.total_amount <= 0) {
      return { success: false, error: 'Ungültiger Bestellbetrag.' };
    }

    // Attach user ID if session exists
    let userId: string | undefined = undefined;
    try {
      const session = await getServerSession();
      if (session.isAuthenticated && session.userId) {
        userId = session.userId;
      }
    } catch {
      // Non-blocking session check
    }

    const order = await createOrder({
      ...orderPayload,
      user_id: userId,
    });

    // Send emails and create notification independently
    const emailResults = { customer: false, admin: false };
    try {
      const settings = await getStoreSettings();

      // Dispatch customer confirmation and admin notification in parallel and independently
      const [customerRes, adminRes] = await Promise.allSettled([
        sendOrderConfirmationEmail(order, settings),
        sendOrderAdminNotificationEmail(order, settings),
      ]);

      emailResults.customer = customerRes.status === 'fulfilled' && customerRes.value;
      emailResults.admin = adminRes.status === 'fulfilled' && adminRes.value;

      if (customerRes.status === 'rejected') {
        console.error(`[Order Action] ❌ Erreur envoi email client pour #${order.order_number}:`, customerRes.reason);
      } else {
        console.log(`[Order Action] Email client pour #${order.order_number}:`, emailResults.customer ? 'Envoyé' : 'Échec');
      }

      if (adminRes.status === 'rejected') {
        console.error(`[Order Action] ❌ Erreur envoi email admin pour #${order.order_number}:`, adminRes.reason);
      } else {
        console.log(`[Order Action] Email admin pour #${order.order_number}:`, emailResults.admin ? 'Envoyé' : 'Échec');
      }

      // Create in-app notification for admin
      await createNotification({
        type: 'order',
        title: `Neue Bestellung #${order.order_number}`,
        message: `${order.shipping_address?.full_name || 'Kunde'} hat eine Bestellung ueber ${order.total_amount.toFixed(2)} EUR aufgegeben.`,
        data: {
          orderId: order.id,
          orderNumber: order.order_number,
          customerEmail: order.customer_email,
          totalAmount: order.total_amount,
        },
      });
    } catch (err) {
      console.error('[Order Action] Erreur globale envoi emails/notifications:', err);
    }

    return { success: true, order, emails: emailResults };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error processing order';
    return { success: false, error: message };
  }
}

/**
 * Server Action: Validate Coupon Code 100% Server-Side
 */
export async function validateCouponServerAction(code: string, subtotal: number): Promise<{
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message?: string;
}> {
  try {
    const uppercaseCode = code.trim().toUpperCase();
    if (!uppercaseCode) {
      return { valid: false, discountAmount: 0, message: 'Gutscheincode ist ungültig' };
    }

    // Server-side evaluation
    if (uppercaseCode === 'WELCOME10' || uppercaseCode === 'SPECIAL10') {
      const discountAmount = Math.round(subtotal * 0.1 * 100) / 100;
      return {
        valid: true,
        coupon: {
          id: 'coup-welcome10',
          code: uppercaseCode,
          discount_type: 'percentage',
          discount_value: 10,
          min_order_amount: 0,
          times_used: 1,
          active: true,
          created_at: new Date().toISOString(),
        },
        discountAmount,
        message: '10% Rabatt erfolgreich angewendet!',
      };
    }

    if (uppercaseCode === 'FREESHIP') {
      return {
        valid: true,
        coupon: {
          id: 'coup-freeship',
          code: 'FREESHIP',
          discount_type: 'fixed',
          discount_value: 4.9,
          min_order_amount: 0,
          times_used: 1,
          active: true,
          created_at: new Date().toISOString(),
        },
        discountAmount: 4.9,
        message: 'Kostenloser Versand angewendet!',
      };
    }

    return { valid: false, discountAmount: 0, message: 'Ungültiger oder abgelaufener Gutscheincode' };
  } catch {
    return { valid: false, discountAmount: 0, message: 'Fehler bei der Überprüfung' };
  }
}

/**
 * Server Action: Update Order Status (Admin Only)
 * Requires an authenticated admin/manager session.
 */
export async function updateOrderStatusServerAction(orderId: string, status: Order['order_status']): Promise<{ success: boolean; order?: Order | null }> {
  try {
    // Only admin or manager can update order status
    const session = await getServerSession();
    if (!session.isAdmin) {
      return { success: false };
    }

    const updatedOrder = await updateOrderStatus(orderId, status);
    return { success: true, order: updatedOrder };
  } catch {
    return { success: false };
  }
}

/**
 * Server Action: Fetch Products Server-Side
 */
export async function getProductsServerAction(filters?: any): Promise<Product[]> {
  return await getProducts(filters);
}

/**
 * Server Action: Look up an order by order number / tracking code.
 * Runs server-side with the service-role client so orders remain
 * RLS-protected (no public read of the orders table). Anyone may track an
 * order, but only admins and the owner see the customer's details.
 */
export async function trackOrderServerAction(code: string): Promise<{ success: boolean; order?: Order | null }> {
  try {
    const clean = code.trim().toUpperCase();
    if (!clean) return { success: false, order: null };

    const order = await getOrderById(clean);
    if (
      order &&
      (order.order_number?.toUpperCase() === clean ||
        order.tracking_number?.toUpperCase() === clean ||
        order.id?.toUpperCase() === clean)
    ) {
      const session = await getServerSession();
      const canSeeDetails = session.isAdmin || isOrderOwner(session, order);
      return { success: true, order: canSeeDetails ? order : redactOrder(order) };
    }
    return { success: true, order: null };
  } catch (err) {
    console.error('[Track Order Action] Error:', err);
    return { success: false, order: null };
  }
}

/**
 * Server Action: Fetch the current user's own orders (session-scoped).
 * Anonymous visitors receive an empty list (client-side localStorage
 * orders are merged by the page on top of this).
 */
export async function getMyOrdersServerAction(): Promise<{ success: boolean; orders: Order[] }> {
  try {
    const session = await getServerSession();
    if (!session.isAuthenticated || !session.userId) {
      return { success: true, orders: [] };
    }
    const all = await getOrders();
    const mine = all.filter((o) => isOrderOwner(session, o));
    return { success: true, orders: mine };
  } catch (err) {
    console.error('[My Orders Action] Error:', err);
    return { success: false, orders: [] };
  }
}
