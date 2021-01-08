import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
} from '@ionic/react';


import { add, removeCircle, reload, planetOutline, globeOutline} from 'ionicons/icons';
import Student from './Student';
import { getLogger } from '../core';
import { StudentContext } from './StudentProvider';
import {AuthContext} from "../auth";
import { useNetwork } from './useNetwork';

const log = getLogger('StudentList');

export const StudentList: React.FC<RouteComponentProps> = ({ history }) => {
    const { students, fetching, fetchingError, syncFunction } = useContext(StudentContext);
    const { logout } = useContext(AuthContext);
    const { networkStatus } = useNetwork();
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My App</IonTitle>

                    {(networkStatus.connected==true) && (
                        <div>
                            <IonIcon icon="add-outline"></IonIcon>
                            <IonIcon icon={globeOutline} size={"900"} />
                            <div>You are online</div>
                        </div>
                    )}

                    {(networkStatus.connected==false) && (
                        <div>
                            <IonIcon icon={planetOutline} size={"900"}/>
                            <div>You are offline</div>
                        </div>
                    )}

                    {fetchingError && (
                        <div>
                            <div>{fetchingError.message || 'Failed to fetch students'}</div>
                            <div>{'You are not sync!'}</div>
                        </div>
                    )}

                    <IonButton color="primary" onClick={() => {
                            log("try to logout");
                            logout?.()
                            history.push('/login')}}>
                        Logout
                    </IonButton>

                    <IonButton color="primary" onClick={() => {
                        log("try to sync");
                        syncFunction?.()
                        }}>
                        Sync
                    </IonButton>

                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching students" />
                {students && (
                    <IonList>
                        {students.map(({ id, name, graduated,
                                           grade, enrollment, sync, version}) =>
                                <Student key={id} id={id} name={name} grade={grade}
                                     graduated={graduated} enrollment={enrollment} sync={sync} version={version}
                                     onEdit={id => history.push(`/student/${id}`)} />
                        )}
                    </IonList>
                )}

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/student')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default StudentList;
