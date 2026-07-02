import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomBytes, randomUUID } from 'node:crypto';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');

export const CUSTOMER_STATUSES = {
  pending_signature: 'Väntar på signering',
  active: 'Aktiv',
  cancel_requested: 'Avslut begärt',
  cancelled: 'Avslutad',
  completed: 'Slutförd'
};

export const CUSTOMER_TYPES = {
  membership: 'Medlemskap',
  order: 'Beställning'
};

const sanitize = (value) => String(value || '').trim();
const normalizeEmail = (value) => sanitize(value).toLowerCase();

const nowIso = () => new Date().toISOString();

const readCustomers = async () => {
  try {
    const content = await readFile(CUSTOMERS_FILE, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
};

const writeCustomers = async (customers) => {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), 'utf8');
};

const generateAccessCode = () =>
  `AEGIS-${randomBytes(3).toString('hex').toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;

const generateToken = () => randomBytes(24).toString('hex');

const createSystemMessage = (text) => ({
  id: randomUUID(),
  author: 'system',
  text,
  createdAt: nowIso()
});

const byNewestUpdate = (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);

export async function listCustomers() {
  const customers = await readCustomers();
  return customers.sort(byNewestUpdate);
}

export async function getCustomer(id) {
  const customers = await readCustomers();
  return customers.find((customer) => customer.id === id) || null;
}

export async function getCustomerBySignToken(token) {
  const customers = await readCustomers();
  return customers.find((customer) => customer.signToken === token) || null;
}

export async function findCustomerByLogin(email, accessCode) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedCode = sanitize(accessCode).toUpperCase();
  const customers = await readCustomers();

  return customers.find((customer) =>
    normalizeEmail(customer.email) === normalizedEmail &&
    sanitize(customer.accessCode).toUpperCase() === normalizedCode
  ) || null;
}

export async function createAgreementFromRequest(contactRequest, input = {}) {
  const customers = await readCustomers();
  const existingIndex = customers.findIndex((customer) => customer.requestId === contactRequest.id);
  const existing = existingIndex >= 0 ? customers[existingIndex] : null;
  const createdAt = existing?.createdAt || nowIso();
  const type = input.type === 'order' ? 'order' : 'membership';
  const plan = sanitize(input.plan) || (type === 'membership' ? 'Start' : 'Projekt');
  const price = sanitize(input.price);
  const billingCycle = sanitize(input.billingCycle) || (type === 'membership' ? 'per månad' : 'enligt offert');
  const projectTitle = sanitize(input.projectTitle) || contactRequest.serviceLabel || contactRequest.service || 'Aegis uppdrag';
  const requirements = sanitize(input.requirements) || sanitize(contactRequest.message);
  const adminNotes = sanitize(input.adminNotes);
  const signToken = generateToken();
  const accessCode = existing?.accessCode || generateAccessCode();
  const baseMessages = existing?.messages?.length ? existing.messages : [
    createSystemMessage('Kundkort skapat från en kontaktförfrågan.')
  ];

  const customer = {
    ...existing,
    id: existing?.id || randomUUID(),
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
    price,
    billingCycle,
    projectTitle,
    requirements,
    adminNotes,
    signToken,
    signedAt: '',
    signatureName: '',
    signatureTitle: '',
    signatureIp: '',
    accessCode,
    createdAt,
    updatedAt: nowIso(),
    messages: [
      createSystemMessage('Nytt avtal/signering skapades av admin.'),
      ...baseMessages
    ].slice(0, 200)
  };

  if (existingIndex >= 0) {
    customers[existingIndex] = customer;
  } else {
    customers.unshift(customer);
  }

  await writeCustomers(customers);
  return customer;
}

export async function signAgreement(token, input = {}, requestMeta = {}) {
  const customers = await readCustomers();
  const index = customers.findIndex((customer) => customer.signToken === token);

  if (index < 0) {
    return null;
  }

  const customer = customers[index];

  if (customer.status !== 'pending_signature') {
    return customer;
  }

  const signedAt = nowIso();
  const nextCustomer = {
    ...customer,
    status: 'active',
    signedAt,
    signatureName: sanitize(input.signatureName) || customer.name,
    signatureTitle: sanitize(input.signatureTitle),
    signatureIp: sanitize(requestMeta.ip),
    updatedAt: signedAt,
    messages: [
      createSystemMessage('Avtalet signerades digitalt av kunden.'),
      ...(customer.messages || [])
    ].slice(0, 200)
  };

  customers[index] = nextCustomer;
  await writeCustomers(customers);
  return nextCustomer;
}

export async function updateCustomer(id, input = {}) {
  const customers = await readCustomers();
  const index = customers.findIndex((customer) => customer.id === id);

  if (index < 0) {
    return null;
  }

  const current = customers[index];
  const allowedStatus = CUSTOMER_STATUSES[input.status] ? input.status : current.status;
  const nextCustomer = {
    ...current,
    status: allowedStatus,
    plan: sanitize(input.plan ?? current.plan),
    price: sanitize(input.price ?? current.price),
    billingCycle: sanitize(input.billingCycle ?? current.billingCycle),
    projectTitle: sanitize(input.projectTitle ?? current.projectTitle),
    requirements: sanitize(input.requirements ?? current.requirements),
    adminNotes: sanitize(input.adminNotes ?? current.adminNotes),
    updatedAt: nowIso()
  };

  customers[index] = nextCustomer;
  await writeCustomers(customers);
  return nextCustomer;
}

export async function addCustomerMessage(id, author, text) {
  const cleanText = sanitize(text);

  if (!cleanText) {
    return null;
  }

  const customers = await readCustomers();
  const index = customers.findIndex((customer) => customer.id === id);

  if (index < 0) {
    return null;
  }

  const message = {
    id: randomUUID(),
    author,
    text: cleanText,
    createdAt: nowIso()
  };
  const customer = customers[index];

  customers[index] = {
    ...customer,
    updatedAt: nowIso(),
    messages: [
      message,
      ...(customer.messages || [])
    ].slice(0, 200)
  };

  await writeCustomers(customers);
  return message;
}

export async function requestCustomerCancellation(id, reason = '') {
  const customers = await readCustomers();
  const index = customers.findIndex((customer) => customer.id === id);

  if (index < 0) {
    return null;
  }

  const customer = customers[index];
  const cancellationText = sanitize(reason) || 'Kunden begärde avslut utan extra kommentar.';
  const updatedAt = nowIso();

  customers[index] = {
    ...customer,
    status: customer.status === 'cancelled' ? 'cancelled' : 'cancel_requested',
    cancellationRequestedAt: customer.cancellationRequestedAt || updatedAt,
    cancellationReason: cancellationText,
    updatedAt,
    messages: [
      createSystemMessage(`Kunden begärde avslut: ${cancellationText}`),
      ...(customer.messages || [])
    ].slice(0, 200)
  };

  await writeCustomers(customers);
  return customers[index];
}

export function getCustomerStats(customers) {
  return {
    total: customers.length,
    active: customers.filter((customer) => customer.status === 'active').length,
    pending: customers.filter((customer) => customer.status === 'pending_signature').length,
    inactive: customers.filter((customer) => ['cancel_requested', 'cancelled', 'completed'].includes(customer.status)).length
  };
}
