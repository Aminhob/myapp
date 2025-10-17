import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { auth, db, serverTimestamp } from '../lib/firebase';

const AuthContext = createContext(null);

const defaultRoles = ['admin', 'accountant', 'sales'];

const fetchUserProfile = async (uid) => {
  if (!uid) return null;
  const snapshot = await db.collection('users').doc(uid).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

const ensureUserDocument = async (uid, data = {}) => {
  if (!uid) return null;
  const payload = {
    role: 'sales',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    ...data,
  };
  await db.collection('users').doc(uid).set(payload, { merge: true });
  const snapshot = await db.collection('users').doc(uid).get();
  return { id: snapshot.id, ...snapshot.data() };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleProfileFetch = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setProfile(null);
      return;
    }
    try {
      const current = await fetchUserProfile(firebaseUser.uid);
      if (current) {
        setProfile(current);
        return;
      }
      const created = await ensureUserDocument(firebaseUser.uid, {
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || '',
        role: 'admin',
      });
      setProfile(created);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[AuthContext] Failed to fetch profile', err);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      await handleProfileFetch(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [handleProfileFetch]);

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    roles: defaultRoles,
    signIn: async (email, password) => {
      const credentials = await auth.signInWithEmailAndPassword(email, password);
      return credentials.user;
    },
    signUp: async (email, password, extra = {}) => {
      const credentials = await auth.createUserWithEmailAndPassword(email, password);
      const firebaseUser = credentials.user;
      if (firebaseUser) {
        await firebaseUser.updateProfile({ displayName: extra.name || '' }).catch(() => {});
        const doc = await ensureUserDocument(firebaseUser.uid, {
          email,
          name: extra.name || firebaseUser.displayName || '',
          role: extra.role || 'sales',
          updated_at: serverTimestamp(),
        });
        setProfile(doc);
      }
      return firebaseUser;
    },
    resetPassword: async (email) => auth.sendPasswordResetEmail(email),
    signOut: async () => {
      await auth.signOut();
      setUser(null);
      setProfile(null);
    },
    refreshProfile: async () => {
      if (user) {
        const current = await fetchUserProfile(user.uid);
        setProfile(current);
      }
    },
  }), [handleProfileFetch, user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
