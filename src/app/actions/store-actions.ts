'use server';

import { createOrder, updateOrderStatus, createCoupon, createCategory, updateReviewStatus, getProducts, getCategories, getBanners, getStoreSettings, getOrderById, getOrders } from '@/lib/db/db-provider';
import { getServerSession } from '@/lib/supabase/server';
import { sendOrderConfirmationEmail, sendOrderAdminNotificationEmail } from '@/lib/email/resend-service';
import { createNotification } from '@/lib/notifications/service';
import { Order, Coupon, Category, Product } from '@/types';

/**
 * Server Action: Fetch all orders for Admin Dashboard
 */
export async function getAdminOrdersServerAction(): Promise<{ success: boolean; orders: Order[] }> {
  try {
    const orders = await getOrders();
    return { success: true, orders };
  } catch (err) {
    console.error('[Admin Orders Action] Error fetching orders:', err);
    return { success: false, orders: [] };
  }
}

/**
 * Server Action: Get Order Details by order number or id
 */
export async function getOrderDetailsServerAction(orderNumber: string): Promise<{ success: boolean; order?: Order | null }> {
  try {
    const order = await getOrderById(orderNumber);
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
    // Validate session exists (any authenticated user can place Bestellungen)
    const session = await getServerSession();
    if (!session.isAuthenticated) {
      return { success: false, error: 'Anmeldung erforderlich, um eine Bestellung aufzugeben.' };
    }

    // Validate required fields
    if (!orderPayload.customer_email || !orderPayload.shipping_address || !orderPayload.items?.length) {
      return { success: false, error: 'Pflichtfelder fehlen (E-Mail, Lieferadresse, Artikel).' };
    }

    // Validate total_amount is positive
    if (!orderPayload.total_amount || orderPayload.total_amount <= 0) {
      return { success: false, error: 'Ungültiger Bestellbetrag.' };
    }

    const order = await createOrder(orderPayload);

    // Send emails and create notification
    const emailResults = { customer: false, admin: false };
    try {
      const settings = await getStoreSettings();

      // Send confirmation email to customer
      emailResults.customer = await sendOrderConfirmationEmail(order, settings);
      console.log(`[Order Action] Email client pour #${order.order_number}:`, emailResults.customer ? 'Envoyé' : 'Échec');

      // Send notification email to admin
      emailResults.admin = await sendOrderAdminNotificationEmail(order, settings);
      console.log(`[Order Action] Email admin pour #${order.order_number}:`, emailResults.admin ? 'Envoyé' : 'Échec');

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
      console.error('[Order Action] Erreur envoi emails/notifications:', err);
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
