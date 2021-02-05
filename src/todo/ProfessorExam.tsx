import React, {useContext, useState} from 'react';
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
    IonButton, IonGrid, IonRow, IonCol, IonImg, IonActionSheet,
} from '@ionic/react';


import {add, removeCircle, reload, planetOutline, globeOutline, camera, trash, close} from 'ionicons/icons';
import Student from './Student';
import { getLogger } from '../core';
import { StudentContext } from './StudentProvider';
import {AuthContext} from "../auth";
import { useNetwork } from './useNetwork';
import {Photo, usePhotoGallery} from "./usePhotoGallery";

const log = getLogger('ProfessorExam');

export const ProfessorExam: React.FC<RouteComponentProps> = ({ history }) => {
    const { students, fetching, fetchingError, syncFunction, lostConnection } = useContext(StudentContext);
    const { logout } = useContext(AuthContext);
    const { networkStatus } = useNetwork();
    const { photos, takePhoto, deletePhoto } = usePhotoGallery();
    const [photoToDelete, setPhotoToDelete] = useState<Photo>();
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

                    {(lostConnection == true) && (
                        <div>
                            <IonIcon icon="add-outline"></IonIcon>
                            <IonIcon icon={globeOutline} size={"900"} />
                            <div>You have not connection to server</div>
                        </div>
                    )}

                    {(lostConnection == false) && (
                        <div>
                            <IonIcon icon="add-outline"></IonIcon>
                            <IonIcon icon={globeOutline} size={"900"} />
                            <div>You have connection to server</div>
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
                        {students.map(( { id, name, graduated,
                                            studentPhotos, grade, enrollment,
                                            sync, version}) =>
                                id && studentPhotos && (
                                <Student key={id} id={id} name={name} grade={grade} graduated={graduated}
                                         enrollment={enrollment} sync={sync} version={version}
                                         onEdit={id => history.push(`/student/${id}`)} studentPhotos={studentPhotos}/>
                                )
                        )}

                    </IonList>
                )}

                <div>
                    <IonHeader collapse="condense">
                        <IonToolbar>
                            <IonTitle size="large">Blank</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <IonGrid>
                        <IonRow>
                            {photos.map((photo, index) => (
                                <IonCol size="6" key={index}>
                                    <IonImg onClick={() => setPhotoToDelete(photo)}
                                            src={photo.webviewPath}/>
                                </IonCol>
                            ))}
                        </IonRow>
                    </IonGrid>
                    <IonFab vertical="bottom" horizontal="center" slot="fixed">
                        <IonFabButton onClick={() => takePhoto()}>
                            <IonIcon icon={camera}/>
                        </IonFabButton>
                    </IonFab>
                    <IonActionSheet
                        isOpen={!!photoToDelete}
                        buttons={[{
                            text: 'Delete',
                            role: 'destructive',
                            icon: trash,
                            handler: () => {
                                if (photoToDelete) {
                                    deletePhoto(photoToDelete);
                                    setPhotoToDelete(undefined);
                                }
                            }
                        }, {
                            text: 'Cancel',
                            icon: close,
                            role: 'cancel'
                        }]}
                        onDidDismiss={() => setPhotoToDelete(undefined)}
                    />
                </div>

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/student')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default ProfessorExam;
