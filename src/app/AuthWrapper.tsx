"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAuthState, setUserDetailsState } from "@/store/authSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          dispatch(setAuthState(true));
          dispatch(
            setUserDetailsState({
              uid: user.uid,
              name: user.displayName ?? "",
              email: user.email ?? "",
              profilePic: user.photoURL ?? "",
            })
          );
          console.log("User signed in:", user.email);
        } else {
          dispatch(setAuthState(false));
          console.log("User is signed out");
        }
      } catch (err) {
        console.error("Auth state error:", err);
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthWrapper;
