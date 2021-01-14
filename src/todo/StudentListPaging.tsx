import React, {useContext, useEffect, useState} from 'react';
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
    IonCard,
    IonInfiniteScroll,
    IonInfiniteScrollContent, useIonViewWillEnter
} from '@ionic/react';
import { add, removeCircle, reload} from 'ionicons/icons';
import Student from './Student';
import { getLogger } from '../core';
import { StudentContext } from './StudentProvider';
import {AuthContext} from "../auth";
import {StudentProps} from "./StudentProps";

const log = getLogger('StudentListPaging-----------------------');

const offset = 20;

export const StudentListPaging: React.FC<RouteComponentProps> = ({ history }) => {
    const { students, fetching, fetchingError, fetchStudentPaging} = useContext(StudentContext);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const { logout } = useContext(AuthContext);
    const [visibleStudents, setVisibleStudents] = useState<StudentProps[] | undefined>([]);
    const [page, setPage] = useState(offset)
    log('render');

    useEffect(()=>{
        setPage(offset)
        fetchData();
    }, [students]);

    function fetchData(){
        setVisibleStudents(students?.slice(0, page))
        setPage(page + offset);
        if (students && page > students?.length) {
            setDisableInfiniteScroll(true);
            setPage(students.length);
        }
        else {
            setDisableInfiniteScroll(false);
        }
    }

    async function getNextPage($event:CustomEvent<void>){
        fetchData();
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }


    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My App</IonTitle>

                    <IonButton color="primary" onClick={() => {
                            log("try to logout");
                            logout?.()
                            history.push('/login')}}>
                        Logout
                    </IonButton>

                </IonToolbar>
            </IonHeader>
            <IonContent>

                {
                    visibleStudents && (
                    <IonList>
                        {visibleStudents.map(({ id, name, graduated,
                                           grade, enrollment, studentPhotos}) => {

                                return <IonCard key={`${id}`}>
                                            <Student key={id} id={id} name={name} grade={grade}
                                                     graduated={graduated} enrollment={enrollment}
                                                     studentPhotos={studentPhotos}
                                                     onEdit={id => history.push(`/student/${id}`)}/>
                                        </IonCard>
                            }
                        )}
                    </IonList>
                )}

                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll}
                                   onIonInfinite={(e: CustomEvent<void>) => getNextPage(e)}>
                    <IonInfiniteScrollContent
                        loadingText="Loading more students...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>


                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch students'}</div>
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

export default StudentListPaging;
