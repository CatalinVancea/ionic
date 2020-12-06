import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { StudentProvider } from './todo/StudentProvider';
import { StudentEdit } from './todo/StudentEdit';
import { StudentList} from './todo/StudentList';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { AuthProvider, Login, PrivateRoute } from './auth';
import StudentListPaging from "./todo/StudentListPaging";
import {StudentListFiltering} from "./todo/StudentListFiltering";
import StudentListSearching from "./todo/StudentListSearching";

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <AuthProvider>
          <Route path="/login" component={Login} exact={true}/>
          <StudentProvider>
            <PrivateRoute path="/students-paging" component={StudentListPaging} exact={true} />
            <PrivateRoute path="/students-filtering" component={StudentListFiltering} exact={true} />
            <PrivateRoute path="/students-searching" component={StudentListSearching} exact={true} />
            <PrivateRoute path="/students" component={StudentList} exact={true} />
            <PrivateRoute path="/student" component={StudentEdit} exact={true} />
            <PrivateRoute path="/student/:id" component={StudentEdit} exact={true} />
            <Route exact path="/" render={() => <Redirect to="/students-searching" />} />
          </StudentProvider>
        </AuthProvider>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
