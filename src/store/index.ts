import { configureStore } from "@reduxjs/toolkit";
import { accountReducer } from "./account";
import { authReducer } from "./auth";

export function makeStore() {
  return configureStore({
    reducer: {
      account: accountReducer,
      auth: authReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
