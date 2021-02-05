import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { IonButton, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { AuthContext } from './AuthProvider';
import { getLogger } from '../core';

const log = getLogger('Login');

interface LoginState {
  username?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
  log("LoginLoginLogin")
  const { isAuthenticated, isAuthenticating, login, logout, authenticationError, getTokenStorage, token} = useContext(AuthContext);
  const [state, setState] = useState<LoginState>({});
  const { username } = state;

  const handleLogin = () => {
    log('handleLogin...');
    login?.(username);
  };

  log('render');

  if (isAuthenticated) {

      log('renderrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
      log('token = ',token);
      if (token==="professor") {
          log('redirect to professor');
          //
      }

      if (token==="student") {
          log('redirect to student');
          //
      }

      return <Redirect to={{ pathname: '/' }} />
  }

  if (getTokenStorage) {
      getTokenStorage?.();
  }


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonInput
          placeholder="Username"
          value={username}
          onIonChange={e => setState({
            ...state,
            username: e.detail.value || ''
          })}/>
        <IonLoading isOpen={isAuthenticating}/>
        {authenticationError && (
          <div>{authenticationError.message || 'Failed to authenticate'}</div>
        )}
        <IonButton onClick={handleLogin}>Login</IonButton>
      </IonContent>
    </IonPage>
  );
};
