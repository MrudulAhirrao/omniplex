// src/store/authSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

// FIX: This interface was already correct, just confirming it
export interface UserDetailsState {
  uid: string;
  name: string;
  email: string;
  profilePic: string;
  isPro: boolean;
}

interface AuthState {
  authState: boolean;
  userDetails: UserDetailsState;
}

const initialState: AuthState = {
  authState: false,
  userDetails: {
    uid: "",
    name: "",
    email: "",
    profilePic: "",
    isPro: false, 
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (state, action: PayloadAction<boolean>) => {
      state.authState = action.payload;
    },
    setUserDetailsState: (
      state,
      action: PayloadAction<Partial<UserDetailsState>> 
    ) => {
      state.userDetails = { ...state.userDetails, ...action.payload };
    },
    resetAuth: () => {
      return initialState;
    },
  },
});

export const { setAuthState, setUserDetailsState, resetAuth } =
  authSlice.actions;

export const selectAuthState = (state: RootState) => state.auth.authState;
export const selectUserDetailsState = (state: RootState) =>
  state.auth.userDetails;

export default authSlice.reducer;