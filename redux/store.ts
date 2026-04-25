import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import createWebStorage from 'redux-persist/es/storage/createWebStorage';
import authReducer from './slices/auth/authSlice';
import templateReducer from './slices/template/templateSlice';
import notificationsReducer from './slices/notifications/notificationsSlice';
import { combineReducers } from 'redux';

const createNoopStorage = () => ({
  getItem() {
    return Promise.resolve(null);
  },
  setItem(_key: string, value: string) {
    return Promise.resolve(value);
  },
  removeItem() {
    return Promise.resolve();
  },
});

const storage = typeof window === 'undefined'
  ? createNoopStorage()
  : createWebStorage('local');

const storageSession = typeof window === 'undefined'
  ? createNoopStorage()
  : createWebStorage('session');

const persistConfig = {
  key: 'root',
  storage,
};

const authPersistConfig = {
  key: 'auth',
  storage: storageSession,
  whitelist: ['activeStatus', 'currentStatusDataState', 'token', 'refreshToken', 'user', 'whatsappApiDetails'],
};

const templatePersistConfig = {
  key: 'template',
  storage,
  whitelist: ['uploadedMediaUrl', 'uploadedMediaType'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  template: persistReducer(templatePersistConfig, templateReducer),
  notifications: notificationsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
