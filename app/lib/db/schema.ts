import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core';

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),

  requestId: text('request_id').unique(),
  source: text('source').notNull().default('direct-membership'),

  type: text('type').notNull().default('membership'),
  status: text('status').notNull().default('pending_signature'),

  name: text('name').notNull(),
  company: text('company').notNull().default(''),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull().default(''),

  service: text('service').notNull().default(''),
  serviceLabel: text('service_label').notNull().default(''),

  plan: text('plan').notNull(),
  price: text('price').notNull().default(''),
  billingCycle: text('billing_cycle').notNull().default('per månad'),

  projectTitle: text('project_title').notNull().default(''),
  requirements: text('requirements').notNull().default(''),
  adminNotes: text('admin_notes').notNull().default(''),

  signToken: text('sign_token').unique(),
  accessCode: text('access_code').notNull(),

  signatureName: text('signature_name').notNull().default(''),
  signatureTitle: text('signature_title').notNull().default(''),
  signatureIp: text('signature_ip').notNull().default(''),

  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeCheckoutSessionId: text('stripe_checkout_session_id').unique(),
  stripePriceId: text('stripe_price_id'),

  subscriptionStatus: text('subscription_status'),

  currentPeriodEnd: timestamp('current_period_end', {
    withTimezone: true
  }),

  cancelAtPeriodEnd: boolean('cancel_at_period_end')
    .notNull()
    .default(false),

  paymentMethod: jsonb('payment_method'),

  signedAt: timestamp('signed_at', {
    withTimezone: true
  }),

  cancellationRequestedAt: timestamp('cancellation_requested_at', {
    withTimezone: true
  }),

  cancelledAt: timestamp('cancelled_at', {
    withTimezone: true
  }),

  cancellationReason: text('cancellation_reason')
    .notNull()
    .default(''),

  createdAt: timestamp('created_at', {
    withTimezone: true
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp('updated_at', {
    withTimezone: true
  })
    .notNull()
    .defaultNow()
});

export const customerMessages = pgTable('customer_messages', {
  id: uuid('id').defaultRandom().primaryKey(),

  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id, {
      onDelete: 'cascade'
    }),

  author: text('author').notNull(),
  text: text('text').notNull(),

  createdAt: timestamp('created_at', {
    withTimezone: true
  })
    .notNull()
    .defaultNow()
});

export const contactRequests = pgTable('contact_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true
  })
    .notNull()
    .defaultNow()
});

export const adminNotifications = pgTable('admin_notifications', {
  id: uuid('id').defaultRandom().primaryKey(),

  read: boolean('read').notNull().default(false),
  type: text('type').notNull().default('info'),
  title: text('title').notNull().default('Ny notis'),
  message: text('message').notNull().default(''),

  requestId: text('request_id').notNull().default(''),

  customerId: uuid('customer_id').references(() => customers.id, {
    onDelete: 'set null'
  }),

  createdAt: timestamp('created_at', {
    withTimezone: true
  })
    .notNull()
    .defaultNow(),

  readAt: timestamp('read_at', {
    withTimezone: true
  })
});
