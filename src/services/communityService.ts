import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  doc, 
  updateDoc, 
  increment, 
  deleteDoc, 
  setDoc,
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ModProject } from '../store';

export interface CommunityMod {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  projectId: string;
  name: string;
  description: string;
  modType: string;
  mcVersion: string;
  version: string;
  likesCount: number;
  commentsCount: number;
  createdAt: any;
}

export interface Comment {
  id: string;
  modId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: any;
}

const MODS_COLLECTION = 'community_mods';
const FOLLOWS_COLLECTION = 'follows';

export const publishMod = async (project: ModProject, description: string) => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  const modData = {
    authorId: auth.currentUser.uid,
    authorName: auth.currentUser.displayName || 'Anonymous',
    authorPhoto: auth.currentUser.photoURL || '',
    projectId: project.id,
    name: project.name,
    description: description || 'No description provided.',
    modType: project.modType,
    mcVersion: project.mcVersion,
    version: project.version,
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, MODS_COLLECTION), modData);
  return docRef.id;
};

export const getCommunityMods = async () => {
  const q = query(collection(db, MODS_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityMod));
};

export const likeMod = async (modId: string) => {
  const modRef = doc(db, MODS_COLLECTION, modId);
  await updateDoc(modRef, {
    likesCount: increment(1)
  });
};

export const addComment = async (modId: string, text: string) => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  const commentData = {
    modId,
    authorId: auth.currentUser.uid,
    authorName: auth.currentUser.displayName || 'Anonymous',
    text,
    createdAt: serverTimestamp(),
  };

  const modRef = doc(db, MODS_COLLECTION, modId);
  await addDoc(collection(modRef, 'comments'), commentData);
  await updateDoc(modRef, {
    commentsCount: increment(1)
  });
};

export const getComments = async (modId: string) => {
  const modRef = doc(db, MODS_COLLECTION, modId);
  const q = query(collection(modRef, 'comments'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
};

export const followUser = async (followedId: string) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  const followId = `${auth.currentUser.uid}_${followedId}`;
  await setDoc(doc(db, FOLLOWS_COLLECTION, followId), {
    followerId: auth.currentUser.uid,
    followedId,
    createdAt: serverTimestamp(),
  });
};

export const isFollowing = async (followedId: string) => {
  if (!auth.currentUser) return false;
  const followId = `${auth.currentUser.uid}_${followedId}`;
  const docSnap = await getDoc(doc(db, FOLLOWS_COLLECTION, followId));
  return docSnap.exists();
};
