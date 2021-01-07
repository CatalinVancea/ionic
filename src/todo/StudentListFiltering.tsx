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
    IonSelectOption,
    IonSelect, useIonViewWillEnter
} from '@ionic/react';
import { add, removeCircle, reload} from 'ionicons/icons';
import Student from './Student';
import { getLogger } from '../core';
import { StudentContext } from './StudentProvider';
import {AuthContext} from "../auth";
import {StudentProps} from "./StudentProps";

const log = getLogger('StudentList');

export const StudentListFiltering: React.FC<RouteComponentProps> = ({ history }) => {
    const { students, fetching, fetchingError } = useContext(StudentContext);
    const { logout } = useContext(AuthContext);
    const [filter, setFilter] = useState<string | undefined>(undefined);
    const [grades, setGrades] = useState<string[]>([]);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const [visibleStudents, setVisibleStudents] = useState<StudentProps[] | undefined>([]);

    async function fetchGrades() {

        const gradesss = [1,2,3,4,5]

        setGrades(Object.keys(gradesss))
        gradesss.forEach((it)=>{
            //log('fetchGrades'+it)
            //setGrades(Object.keys(it))
        })
    }

    useIonViewWillEnter(async () => {
        await fetchGrades();
    });

    async function fetchData() {

        setVisibleStudents(students?.filter((student)=>{
            return student.grade == filter;
        }))

        log("fetchData "+visibleStudents?.length)

        if (visibleStudents && visibleStudents.length < 4) {
            setDisableInfiniteScroll(true);
        }
        else {
            setDisableInfiniteScroll(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [filter]);

    log('render');
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
                <IonLoading isOpen={fetching} message="Fetching students" />

                <IonSelect value={filter} placeholder="Select grade" onIonChange={e => setFilter(e.detail.value)}>
                    {grades.map(grade => <IonSelectOption key={grade} value={grade}>{grade}</IonSelectOption>)}
                </IonSelect>

                {visibleStudents && (
                    <IonList>
                        {visibleStudents.map(({ id, name, graduated,
                                           grade, enrollment}) =>
                                <Student key={id} id={id} name={name} grade={grade}
                                     graduated={graduated} enrollment={enrollment}
                                     onEdit={id => history.push(`/student/${id}`)} />
                        )}
                    </IonList>
                )}
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

export default StudentListFiltering;
