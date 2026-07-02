import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const REQUESTS_FILE = path.join(DATA_DIR, 'contact-requests.json');

const readRequests = async () => {
  try {
    const content = await readFile(REQUESTS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
};

const writeRequests = async (requests) => {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf8');
};

export async function saveContactRequest(request) {
  const requests = await readRequests();
  const record = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...request,
  };

  requests.unshift(record);
  await writeRequests(requests);

  return record;
}

export async function listContactRequests() {
  return readRequests();
}

export async function deleteContactRequest(id) {
  const requests = await readRequests();
  const nextRequests = requests.filter((request) => request.id !== id);

  if (nextRequests.length === requests.length) {
    return false;
  }

  await writeRequests(nextRequests);
  return true;
}

export async function getContactRequest(id) {
  const requests = await readRequests();
  return requests.find((request) => request.id === id) || null;
}
