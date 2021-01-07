import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { login as loginApi } from './authApi';
import { Plugins } from '@capacitor/core';
const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;
type LogoutFn = () => void;
type TokenGetFn = () => void;

export interface AuthState {
  authenticationError: Error | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login?: LoginFn;
  logout?: LogoutFn;
  getTokenStorage?: TokenGetFn;
  pendingAuthentication?: boolean;
  username?: string;
  password?: string;
  token: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAuthenticating: false,
  authenticationError: null,
  pendingAuthentication: false,
  token: '',
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  log('AuthAuthAuth')
  const [state, setState] = useState<AuthState>(initialState);
  const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token } = state;
  const login = useCallback<LoginFn>(loginCallback, []);
  const logout = useCallback<LogoutFn>(logOutCallback, []);
  const getTokenStorage = useCallback<TokenGetFn>(getTokenStorageCallBack, []);
  useEffect(authenticationEffect, [pendingAuthentication]);
  const value = { isAuthenticated, login, logout, isAuthenticating, authenticationError, token, getTokenStorage};
  log('render');
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

  function logOutCallback(): void {
    log('logout');

    (async () => {
      const { Storage } = Plugins;

      await Storage.remove({ key: 'token' });

      console.log('token is deleted from local storage');
    })();

    setState(initialState);
  }

  function loginCallback(username?: string, password?: string): void {
    log('login');
    setState({
      ...state,
      pendingAuthentication: true,
      username,
      password
    });
  }

  function setTokenStorageCallBack(token: string){
    log('setTokenStorageCallBack');
    (async () => {
      const { Storage } = Plugins;

      // Saving ({ key: string, value: string }) => Promise<void>
      await Storage.set({
        key: 'token',
        value: JSON.stringify({
          token: token
        })
      });
      console.log('token is setted in local storage');
    })();
  }

  function getTokenStorageCallBack(){
    log('getTokenStorageCallBack');
    (async () => {
      const { Storage } = Plugins;

      // Loading value by key ({ key: string }) => Promise<{ value: string | null }>
      const res = await Storage.get({ key: 'token' });
      if (res.value) {
        const token = JSON.parse(res.value).token;

        setState({
          ...state,
          token,
          pendingAuthentication: false,
          isAuthenticated: true,
          isAuthenticating: false,
        });

        console.log('token found', JSON.parse(res.value));
      } else {
        console.log('token not found');
      }

    })();
  }

  function authenticationEffect() {
    let canceled = false;
    authenticate();
    return () => {
      canceled = true;
    }

    async function authenticate() {
      if (!pendingAuthentication) {
        log('authenticate, !pendingAuthentication, return');
        return;
      }
      try {
        log('get token from local storage...');
        getTokenStorageCallBack();
        if(state.token){
          log('token is in local storage');
          return;
        }else
        {
          log('token is not in local storage');
        }


        log('authenticate...');
        setState({
          ...state,
          isAuthenticating: true,
        });
        const { username, password } = state;
        const { token } = await loginApi(username, password);
        if (canceled) {
          return;
        }
        log('authenticate succeeded');
        setState({
          ...state,
          token,
          pendingAuthentication: false,
          isAuthenticated: true,
          isAuthenticating: false,
        });
        await setTokenStorageCallBack(token);


      } catch (error) {
        if (canceled) {
          return;
        }
        log('authenticate failed');
        setState({
          ...state,
          authenticationError: error,
          pendingAuthentication: false,
          isAuthenticating: false,
        });
      }
    }
  }
};
