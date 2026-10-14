const DATABASE_NAME = "resume-craft-pending-drafts";
const DATABASE_VERSION = 1;
const STORE_NAME = "drafts";
const DRAFT_KEY = "current-print-draft";

function openDraftDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("This browser cannot temporarily store your resume. Please use a modern browser and try again."));
      return;
    }

    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Unable to open temporary resume storage."));
    request.onblocked = () => reject(new Error("Resume storage is busy in another tab. Close other Resume Craft tabs and try again."));
  });
}

export async function savePendingResumeDraft(draft) {
  const database = await openDraftDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(draft, DRAFT_KEY);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error("Unable to save the temporary resume draft."));
      transaction.onabort = () => reject(transaction.error || new Error("Temporary resume saving was interrupted."));
    });
  } finally {
    database.close();
  }
}

export async function getPendingResumeDraft() {
  const database = await openDraftDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(DRAFT_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error("Unable to read the temporary resume draft."));
    });
  } finally {
    database.close();
  }
}

export async function updatePendingResumeDraft(patch) {
  const current = await getPendingResumeDraft();
  if (!current) return;
  await savePendingResumeDraft({ ...current, ...patch });
}

export async function deletePendingResumeDraft() {
  const database = await openDraftDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(DRAFT_KEY);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error("Unable to clear the temporary resume draft."));
      transaction.onabort = () => reject(transaction.error || new Error("Clearing the temporary resume draft was interrupted."));
    });
  } finally {
    database.close();
  }
}
