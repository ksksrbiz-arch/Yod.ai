'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Check if user profile exists, if not, create it
                const userRef = doc(db, 'users', currentUser.uid);
                try {
                    const snap = await getDocFromServer(userRef);
                    if (!snap.exists()) {
                        await setDoc(userRef, {
                            email: currentUser.email,
                            name: currentUser.displayName || 'Unknown Jedi',
                            createdAt: serverTimestamp(),
                            rank: 'youngling'
                        });
                    }
                } catch (error) {
                    console.error("Error creating user profile:", error);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
