import { randomBytes } from 'node:crypto';
import { desc, eq, inArray } from 'drizzle-orm';

import {
  hashAccessCode,
  normalizeAccessCode,
  verifyAccessCode
} from './customerAuth.js';
import { db } from './db/index.js';
import {
  customerMessages,
  customers
} from './db/schema.ts';

export const CUSTOMER_STATUSES = {
  pending_signature: 'Väntar på signering',
  pending_payment: 'Väntar på betalning',
  active: 'Aktiv',
  cancel_requested: 'Avslut begärt',
  cancelled: 'Avslutad',
  completed: 'Slutförd'
};

export const CUSTOMER_TYPES = {
  membership: 'Medlemskap',
  order: 'Beställning'
};

const sanitize = (value) => String(value ?? '').trim();
const normalizeEmail = (value) => sanitize(value).toLowerCase();

const generateAccessCode = () =>
  `AEGIS-${randomBytes(3).toString('hex').toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;

const generateToken = () => randomBytes(24).toString('hex');

const toIso = (value) => {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
};

const formatMessage = (message) => ({
  id: message.id,
  author: message.author,
  text: message.text,
  createdAt: toIso(message.createdAt)
});

const formatCustomer = (customer, messages = []) => {
  if (!customer) return null;

  return {
    ...customer,
    accessCode: customer.accessCode ? '••••••••' : '',
    createdAt: toIso(customer.createdAt),
    updatedAt: toIso(customer.updatedAt),
    signedAt: toIso(customer.signedAt),
    cancellationRequestedAt: toIso(customer.cancellationRequestedAt),
    cancelledAt: toIso(customer.cancelledAt),
    currentPeriodEnd: toIso(customer.currentPeriodEnd),
    signToken: customer.signToken || '',
    requestId: customer.requestId || '',
    stripeCustomerId: customer.stripeCustomerId || '',
    stripeSubscriptionId: customer.stripeSubscriptionId || '',
    stripeCheckoutSessionId: customer.stripeCheckoutSessionId || '',
    stripePriceId: customer.stripePriceId || '',
    subscriptionStatus: customer.subscriptionStatus || '',
    messages: messages.map(formatMessage)
  };
};

async function getMessagesForCustomer(customerId) {
  return db
    .select()
    .from(customerMessages)
    .where(eq(customerMessages.customerId, customerId))
    .orderBy(desc(customerMessages.createdAt));
}

async function hydrateCustomer(customer) {
  if (!customer) return null;
  const messages = await getMessagesForCustomer(customer.id);
  return formatCustomer(customer, messages);
}

async function insertSystemMessage(customerId, text) {
  const [message] = await db
    .insert(customerMessages)
    .values({
      customerId,
      author: 'system',
      text
    })
    .returning();

  return formatMessage(message);
}

export async function listCustomers() {
  const rows = await db
    .select()
    .from(customers)
    .orderBy(desc(customers.updatedAt));

  if (rows.length === 0) {
    return [];
  }

  const messages = await db
    .select()
    .from(customerMessages)
    .where(inArray(customerMessages.customerId, rows.map((row) => row.id)))
    .orderBy(desc(customerMessages.createdAt));

  const messagesByCustomer = new Map();

  for (const message of messages) {
    const current = messagesByCustomer.get(message.customerId) || [];
    current.push(message);
    messagesByCustomer.set(message.customerId, current);
  }

  return rows.map((row) =>
    formatCustomer(row, messagesByCustomer.get(row.id) || [])
  );
}

export async function getCustomer(id) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);

  return hydrateCustomer(customer);
}

export async function getCustomerBySignToken(token) {
  const cleanToken = sanitize(token);

  if (!cleanToken) {
    return null;
  }

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.signToken, cleanToken))
    .limit(1);

  return hydrateCustomer(customer);
}

export async function findCustomerByLogin(email, accessCode) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedCode = normalizeAccessCode(accessCode);

  if (!normalizedEmail || !normalizedCode) {
    return null;
  }

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.email, normalizedEmail))
    .limit(1);

  if (!customer || customer.status === 'pending_payment') {
    return null;
  }

  const verification = await verifyAccessCode(
    normalizedCode,
    customer.accessCode
  );

  if (!verification.valid) {
    return null;
  }

  if (verification.needsUpgrade) {
    const upgradedHash = await hashAccessCode(normalizedCode);

    await db
      .update(customers)
      .set({
        accessCode: upgradedHash,
        updatedAt: new Date()
      })
      .where(eq(customers.id, customer.id));

    customer.accessCode = upgradedHash;
  }

  return hydrateCustomer(customer);
}

export async function createAgreementFromRequest(
  contactRequest,
  input = {}
) {
  const [existing] = await db
    .select()
    .from(customers)
    .where(eq(customers.requestId, contactRequest.id))
    .limit(1);

  const type = input.type === 'order' ? 'order' : 'membership';
  const plan =
    sanitize(input.plan) ||
    (type === 'membership' ? 'Start' : 'Projekt');
  const billingCycle =
    sanitize(input.billingCycle) ||
    (type === 'membership' ? 'per månad' : 'enligt offert');
  const projectTitle =
    sanitize(input.projectTitle) ||
    contactRequest.serviceLabel ||
    contactRequest.service ||
    'Aegis uppdrag';

  const placeholderAccessCode =
    existing?.accessCode ||
    (await hashAccessCode(generateAccessCode()));

  const values = {
    requestId: contactRequest.id,
    source: 'contact-request',
    type,
    status: 'pending_signature',
    name: sanitize(contactRequest.name),
    company: sanitize(contactRequest.company),
    email: normalizeEmail(contactRequest.email),
    phone: sanitize(contactRequest.phone),
    service: sanitize(contactRequest.service),
    serviceLabel: sanitize(contactRequest.serviceLabel),
    plan,
    price: sanitize(input.price),
    billingCycle,
    projectTitle,
    requirements:
      sanitize(input.requirements) ||
      sanitize(contactRequest.message),
    adminNotes: sanitize(input.adminNotes),
    signToken: generateToken(),
    accessCode: placeholderAccessCode,
    signedAt: null,
    signatureName: '',
    signatureTitle: '',
    signatureIp: '',
    updatedAt: new Date()
  };

  let customer;

  if (existing) {
    [customer] = await db
      .update(customers)
      .set(values)
      .where(eq(customers.id, existing.id))
      .returning();

    await insertSystemMessage(
      customer.id,
      'Nytt avtal/signering skapades av admin.'
    );
  } else {
    [customer] = await db
      .insert(customers)
      .values(values)
      .returning();

    await insertSystemMessage(
      customer.id,
      'Kundkort skapat från en kontaktförfrågan.'
    );

    await insertSystemMessage(
      customer.id,
      'Nytt avtal/signering skapades av admin.'
    );
  }

  return hydrateCustomer(customer);
}

export async function createPendingMembershipCustomer(
  input = {},
  requestMeta = {}
) {
  const email = normalizeEmail(input.email);
  const accessCode = normalizeAccessCode(input.accessCode);

  if (!email || !accessCode) {
    throw new Error('INVALID_MEMBERSHIP_DATA');
  }

  const [existing] = await db
    .select()
    .from(customers)
    .where(eq(customers.email, email))
    .limit(1);

  if (existing && existing.status !== 'pending_payment') {
    throw new Error('CUSTOMER_EMAIL_EXISTS');
  }

  const now = new Date();
  const values = {
    source: 'stripe-checkout',
    type: 'membership',
    status: 'pending_payment',
    name: sanitize(input.name),
    company: sanitize(input.company),
    email,
    phone: sanitize(input.phone),
    service: 'maintenance',
    serviceLabel: 'Webbunderhåll & IT-support',
    plan: sanitize(input.plan) || 'Start',
    price: sanitize(input.price),
    billingCycle: 'per månad',
    projectTitle: `${sanitize(input.plan) || 'Start'}-medlemskap`,
    requirements: sanitize(input.requirements),
    adminNotes: '',
    signToken: null,
    accessCode: await hashAccessCode(accessCode),
    signedAt: null,
    signatureName: sanitize(input.name),
    signatureTitle: sanitize(input.signatureTitle),
    signatureIp: sanitize(requestMeta.ip),
    paymentMethod: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripeCheckoutSessionId: null,
    stripePriceId: sanitize(input.stripePriceId) || null,
    subscriptionStatus: 'incomplete',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    cancellationRequestedAt: null,
    cancelledAt: null,
    cancellationReason: '',
    updatedAt: now
  };

  let customer;

  if (existing) {
    [customer] = await db
      .update(customers)
      .set(values)
      .where(eq(customers.id, existing.id))
      .returning();

    await insertSystemMessage(
      customer.id,
      'Betalningsförsöket startades om via Stripe Checkout.'
    );
  } else {
    [customer] = await db
      .insert(customers)
      .values({
        ...values,
        createdAt: now
      })
      .returning();

    await insertSystemMessage(
      customer.id,
      'Medlemskap skapades och väntar på verifierad Stripe-betalning.'
    );
  }

  return hydrateCustomer(customer);
}

export async function activateMembershipFromStripe(
  customerId,
  stripeData = {}
) {
  const [current] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (!current) {
    return null;
  }

  const now = new Date();
  const currentPeriodEnd = stripeData.currentPeriodEnd
    ? new Date(stripeData.currentPeriodEnd)
    : current.currentPeriodEnd;

  const [updated] = await db
    .update(customers)
    .set({
      status: 'active',
      signedAt: current.signedAt || now,
      stripeCustomerId:
        sanitize(stripeData.stripeCustomerId) ||
        current.stripeCustomerId,
      stripeSubscriptionId:
        sanitize(stripeData.stripeSubscriptionId) ||
        current.stripeSubscriptionId,
      stripeCheckoutSessionId:
        sanitize(stripeData.stripeCheckoutSessionId) ||
        current.stripeCheckoutSessionId,
      stripePriceId:
        sanitize(stripeData.stripePriceId) ||
        current.stripePriceId,
      subscriptionStatus:
        sanitize(stripeData.subscriptionStatus) || 'active',
      currentPeriodEnd,
      cancelAtPeriodEnd:
        Boolean(stripeData.cancelAtPeriodEnd),
      paymentMethod:
        stripeData.paymentMethod ||
        current.paymentMethod,
      updatedAt: now
    })
    .where(eq(customers.id, customerId))
    .returning();

  if (
    current.status !== 'active' ||
    current.stripeCheckoutSessionId !==
      sanitize(stripeData.stripeCheckoutSessionId)
  ) {
    await insertSystemMessage(
      customerId,
      'Stripe-betalningen verifierades och medlemskapet aktiverades.'
    );
  }

  return hydrateCustomer(updated);
}

export async function syncMembershipSubscription(
  stripeSubscriptionId,
  stripeData = {}
) {
  const subscriptionId = sanitize(stripeSubscriptionId);

  if (!subscriptionId) {
    return null;
  }

  const [current] = await db
    .select()
    .from(customers)
    .where(eq(customers.stripeSubscriptionId, subscriptionId))
    .limit(1);

  if (!current) {
    return null;
  }

  const subscriptionStatus =
    sanitize(stripeData.subscriptionStatus) ||
    current.subscriptionStatus;

  const cancelled =
    subscriptionStatus === 'canceled' ||
    subscriptionStatus === 'unpaid';

  const currentPeriodEnd = stripeData.currentPeriodEnd
    ? new Date(stripeData.currentPeriodEnd)
    : current.currentPeriodEnd;

  const [updated] = await db
    .update(customers)
    .set({
      status: cancelled ? 'cancelled' : current.status,
      subscriptionStatus,
      currentPeriodEnd,
      cancelAtPeriodEnd:
        stripeData.cancelAtPeriodEnd ??
        current.cancelAtPeriodEnd,
      cancelledAt:
        cancelled && !current.cancelledAt
          ? new Date()
          : current.cancelledAt,
      updatedAt: new Date()
    })
    .where(eq(customers.id, current.id))
    .returning();

  return hydrateCustomer(updated);
}

export async function signAgreement(
  token,
  input = {},
  requestMeta = {}
) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.signToken, token))
    .limit(1);

  if (!customer) {
    return null;
  }

  if (customer.status !== 'pending_signature') {
    return hydrateCustomer(customer);
  }

  const signedAt = new Date();
  const requestedAccessCode =
    normalizeAccessCode(input.accessCode);

  const [updated] = await db
    .update(customers)
    .set({
      status: 'active',
      signedAt,
      signatureName:
        sanitize(input.signatureName) || customer.name,
      signatureTitle: sanitize(input.signatureTitle),
      signatureIp: sanitize(requestMeta.ip),
      accessCode: requestedAccessCode
        ? await hashAccessCode(requestedAccessCode)
        : customer.accessCode,
      signToken: null,
      updatedAt: signedAt
    })
    .where(eq(customers.id, customer.id))
    .returning();

  await insertSystemMessage(
    customer.id,
    'Avtalet signerades digitalt av kunden.'
  );

  return hydrateCustomer(updated);
}

export async function updateCustomer(id, input = {}) {
  const [current] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);

  if (!current) {
    return null;
  }

  const allowedStatus =
    CUSTOMER_STATUSES[input.status]
      ? input.status
      : current.status;

  const [updated] = await db
    .update(customers)
    .set({
      status: allowedStatus,
      plan: sanitize(input.plan ?? current.plan),
      price: sanitize(input.price ?? current.price),
      billingCycle: sanitize(
        input.billingCycle ?? current.billingCycle
      ),
      projectTitle: sanitize(
        input.projectTitle ?? current.projectTitle
      ),
      requirements: sanitize(
        input.requirements ?? current.requirements
      ),
      adminNotes: sanitize(
        input.adminNotes ?? current.adminNotes
      ),
      updatedAt: new Date()
    })
    .where(eq(customers.id, id))
    .returning();

  return hydrateCustomer(updated);
}

export async function addCustomerMessage(
  id,
  author,
  text
) {
  const cleanText = sanitize(text);

  if (!cleanText) {
    return null;
  }

  const [customer] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);

  if (!customer) {
    return null;
  }

  const [message] = await db
    .insert(customerMessages)
    .values({
      customerId: id,
      author: sanitize(author) || 'system',
      text: cleanText
    })
    .returning();

  await db
    .update(customers)
    .set({ updatedAt: new Date() })
    .where(eq(customers.id, id));

  return formatMessage(message);
}

export async function requestCustomerCancellation(
  id,
  reason = ''
) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);

  if (!customer) {
    return null;
  }

  const cancellationText =
    sanitize(reason) ||
    'Kunden avslutade medlemskapet utan extra kommentar.';
  const now = new Date();

  const [updated] = await db
    .update(customers)
    .set({
      status: 'cancelled',
      subscriptionStatus:
        customer.stripeSubscriptionId
          ? 'canceled'
          : customer.subscriptionStatus,
      cancelAtPeriodEnd: false,
      cancellationRequestedAt:
        customer.cancellationRequestedAt || now,
      cancelledAt: customer.cancelledAt || now,
      cancellationReason: cancellationText,
      updatedAt: now
    })
    .where(eq(customers.id, id))
    .returning();

  await insertSystemMessage(
    id,
    `Kunden avslutade medlemskapet: ${cancellationText}`
  );

  return hydrateCustomer(updated);
}

export async function deleteCustomer(id) {
  const deleted = await db
    .delete(customers)
    .where(eq(customers.id, id))
    .returning({ id: customers.id });

  return deleted.length > 0;
}

export function getCustomerStats(customerList) {
  return {
    total: customerList.length,
    active: customerList.filter(
      (customer) => customer.status === 'active'
    ).length,
    pending: customerList.filter((customer) =>
      ['pending_signature', 'pending_payment'].includes(customer.status)
    ).length,
    inactive: customerList.filter((customer) =>
      ['cancel_requested', 'cancelled', 'completed'].includes(customer.status)
    ).length
  };
}
