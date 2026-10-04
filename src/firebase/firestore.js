/**
 * Firestore Helper & Unified Storage Adapter
 * PRD: §8 Data Model (Collections: tournament, teams, players, officials, groups, matches, goals, cards, substitutions, venues, drawHistory)
 */
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config.js';
import { DEFAULT_TEAMS, TOURNAMENT_INFO, MOCK_RECENT_MATCHES, MOCK_STANDINGS } from '../data/mockData.js';

// Local storage storage keys prefix
const STORAGE_PREFIX = 'porprov_col_';

// Initial local seed generator
function getInitialSeed(colName) {
  switch (colName) {
    case 'tournament':
      return { info: TOURNAMENT_INFO };
    case 'teams':
      return DEFAULT_TEAMS.reduce((acc, t) => ({ ...acc, [t.id]: t }), {});
    case 'matches':
      return MOCK_RECENT_MATCHES.reduce((acc, m) => ({ ...acc, [m.id]: m }), {});
    case 'standings':
      return MOCK_STANDINGS.reduce((acc, s, idx) => ({ ...acc, [`group_${idx}`]: s }), {});
    case 'venues':
      return TOURNAMENT_INFO.venues.reduce((acc, v) => ({ ...acc, [v.id]: v }), {});
    case 'players':
      return {};
    case 'officials':
      return {};
    case 'groups':
      return {};
    case 'goals':
      return {};
    case 'cards':
      return {};
    case 'substitutions':
      return {};
    case 'drawHistory':
      return {};
    default:
      return {};
  }
}

// Local collection helper
function getLocalCollection(colName) {
  const raw = localStorage.getItem(STORAGE_PREFIX + colName);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`Error parsing local collection ${colName}:`, e);
    }
  }
  const initial = getInitialSeed(colName);
  localStorage.setItem(STORAGE_PREFIX + colName, JSON.stringify(initial));
  return initial;
}

function saveLocalCollection(colName, data) {
  localStorage.setItem(STORAGE_PREFIX + colName, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(`col_updated_${colName}`, { detail: data }));
}

/**
 * Fetch all documents in a collection
 */
export async function getCollectionDocs(colName) {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.warn(`Firestore read failed for ${colName}, falling back to local:`, error);
    }
  }

  const data = getLocalCollection(colName);
  return Object.keys(data).map(id => ({ id, ...data[id] }));
}

/**
 * Get single document by ID
 */
export async function getDocById(colName, id) {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, colName, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
      return null;
    } catch (error) {
      console.warn(`Firestore getDoc failed for ${colName}/${id}, falling back:`, error);
    }
  }

  const col = getLocalCollection(colName);
  return col[id] ? { id, ...col[id] } : null;
}

/**
 * Set / Create or replace document
 */
export async function saveDoc(colName, id, data) {
  const cleanId = id || 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const payload = { ...data, updatedAt: new Date().toISOString() };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, colName, cleanId);
      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      console.warn(`Firestore write failed for ${colName}/${cleanId}:`, error);
    }
  }

  const col = getLocalCollection(colName);
  col[cleanId] = { ...(col[cleanId] || {}), ...payload };
  saveLocalCollection(colName, col);
  return { id: cleanId, ...col[cleanId] };
}

/**
 * Update document fields
 */
export async function modifyDoc(colName, id, updateFields) {
  const payload = { ...updateFields, updatedAt: new Date().toISOString() };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, colName, id);
      await updateDoc(docRef, payload);
    } catch (error) {
      console.warn(`Firestore updateDoc failed for ${colName}/${id}:`, error);
    }
  }

  const col = getLocalCollection(colName);
  if (col[id]) {
    col[id] = { ...col[id], ...payload };
    saveLocalCollection(colName, col);
    return { id, ...col[id] };
  }
  return null;
}

/**
 * Remove document by ID
 */
export async function removeDoc(colName, id) {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, colName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn(`Firestore deleteDoc failed for ${colName}/${id}:`, error);
    }
  }

  const col = getLocalCollection(colName);
  if (col[id]) {
    delete col[id];
    saveLocalCollection(colName, col);
    return true;
  }
  return false;
}

/**
 * Clear all documents in a collection (both Cloud Firestore & Local Storage)
 */
export async function clearCollection(colName) {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, colName, d.id)));
      await Promise.all(deletePromises);
    } catch (error) {
      console.warn(`Firestore clearCollection failed for ${colName}:`, error);
    }
  }

  saveLocalCollection(colName, {});
}

/**
 * Real-time subscription to collection changes
 */
export function subscribeCollection(colName, callback) {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, colName);
      return onSnapshot(colRef, (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(items);
      });
    } catch (err) {
      console.warn(`Firestore subscribe failed for ${colName}:`, err);
    }
  }

  // Fallback custom event listener with cross-tab support
  const handler = () => {
    const data = getLocalCollection(colName);
    callback(Object.keys(data).map(id => ({ id, ...data[id] })));
  };

  const storageHandler = (e) => {
    if (e.key === STORAGE_PREFIX + colName) {
      handler();
    }
  };

  window.addEventListener(`col_updated_${colName}`, handler);
  window.addEventListener('storage', storageHandler);
  handler(); // Initial dispatch

  return () => {
    window.removeEventListener(`col_updated_${colName}`, handler);
    window.removeEventListener('storage', storageHandler);
  };
}
