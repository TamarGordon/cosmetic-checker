import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { SkinProfile } from '../components/SkinProfileSelector';

export interface SavedScan {
  id: string;
  productName: string;
  rating: string;
  score: number;
  summary: string;
  ingredients: unknown[];
  skinSuitability?: unknown;
  flags?: unknown;
  source?: string;
  profileUsed: SkinProfile;
  createdAt: number | null;
}

// Firestore rejects `undefined`; recursively drop those keys before writing.
// IMPORTANT: only recurse into plain objects/arrays. Firestore sentinels such as
// serverTimestamp() are FieldValue class instances — iterating them would corrupt
// the sentinel (turning it into `{}`), so we leave non-plain objects untouched.
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const proto = Object.getPrototypeOf(value);
    const isPlainObject = proto === Object.prototype || proto === null;
    if (!isPlainObject) {
      // FieldValue sentinels, Timestamp, Date, etc. — pass through as-is.
      return value;
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) out[k] = stripUndefined(v);
    }
    return out as T;
  }
  return value;
}

function userRef(uid: string) {
  return doc(db, 'users', uid);
}

export async function getUserProfile(uid: string): Promise<SkinProfile | null> {
  const snap = await getDoc(userRef(uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (!data?.skinType) return null;
  return {
    skinType: data.skinType,
    gender: data.gender ?? 'unspecified',
    ageGroup: data.ageGroup ?? 'adult',
    conditions: Array.isArray(data.conditions) ? data.conditions : [],
  };
}

export async function saveUserProfile(
  uid: string,
  profile: SkinProfile,
  identity?: { displayName?: string | null; email?: string | null }
): Promise<void> {
  await setDoc(
    userRef(uid),
    stripUndefined({
      skinType: profile.skinType,
      gender: profile.gender,
      ageGroup: profile.ageGroup,
      conditions: profile.conditions,
      displayName: identity?.displayName ?? null,
      email: identity?.email ?? null,
      updatedAt: serverTimestamp(),
    }),
    { merge: true }
  );
}

export interface AnalysisResultLike {
  productName: string;
  rating: string;
  score: number;
  summary: string;
  ingredients: unknown[];
  skinSuitability?: unknown;
  flags?: unknown;
  source?: string;
}

export async function addScan(
  uid: string,
  result: AnalysisResultLike,
  profileUsed: SkinProfile
): Promise<string> {
  const scansCol = collection(db, 'users', uid, 'scans');
  const docRef = await addDoc(
    scansCol,
    stripUndefined({
      productName: result.productName,
      rating: result.rating,
      score: result.score,
      summary: result.summary,
      ingredients: result.ingredients,
      skinSuitability: result.skinSuitability ?? null,
      flags: result.flags ?? null,
      source: result.source ?? null,
      profileUsed: {
        skinType: profileUsed.skinType,
        gender: profileUsed.gender,
        ageGroup: profileUsed.ageGroup,
        conditions: profileUsed.conditions,
      },
      createdAt: serverTimestamp(),
    })
  );
  return docRef.id;
}

export async function getScans(uid: string, max = 50): Promise<SavedScan[]> {
  const scansCol = collection(db, 'users', uid, 'scans');
  const q = query(scansCol, orderBy('createdAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    const createdAt = data.createdAt as Timestamp | null;
    return {
      id: d.id,
      productName: data.productName,
      rating: data.rating,
      score: data.score,
      summary: data.summary,
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      skinSuitability: data.skinSuitability ?? undefined,
      flags: data.flags ?? undefined,
      source: data.source ?? undefined,
      profileUsed: {
        skinType: data.profileUsed?.skinType ?? 'normal',
        gender: data.profileUsed?.gender ?? 'unspecified',
        ageGroup: data.profileUsed?.ageGroup ?? 'adult',
        conditions: Array.isArray(data.profileUsed?.conditions) ? data.profileUsed.conditions : [],
      },
      createdAt: createdAt ? createdAt.toMillis() : null,
    };
  });
}
