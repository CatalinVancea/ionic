import React, { useContext, useEffect, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonDatetime,
    IonFooter,
    IonToggle,
    IonItemDivider
} from '@ionic/react';


import { getLogger } from '../core';
import { StudentContext } from './StudentProvider';
import { RouteComponentProps } from 'react-router';
import { StudentProps } from './StudentProps';

const log = getLogger('StudentEdit');

interface StudentEditProps extends RouteComponentProps<{
    id?: string;
}> {}

export const StudentEdit: React.FC<StudentEditProps> = ({ history, match }) => {
    const { students, saving, savingError, saveStudent, deleteStudent } = useContext(StudentContext);
    const [name, setName] = useState('');
    const [graduated, setGraduated] = useState(Boolean());
    const [grade, setGrade] = useState(Number());
    const [enrollment, setEnrollment] = useState('2012-12-15T13:47:20.789');
    const [student, setStudent] = useState<StudentProps>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const student = students?.find(it => it.id === routeId);
        setStudent(student);
        if (student) {
            setName(student.name);
            setEnrollment(student.enrollment || '');
            setGraduated(student.graduated || Boolean());
            setGrade(student.grade || Number());
        }
    }, [match.params.id, students]);
    const handleSave = () => {
        const editedStudent = student ? { ...student, name, graduated, grade, enrollment } : { name, graduated, grade, enrollment };
        saveStudent && saveStudent(editedStudent).then(() => history.goBack());
    };
    const handleDelete = () => {
        const deletedStudent = student ? { ...student, name, graduated, grade, enrollment } : { name, graduated, grade, enrollment };
        deleteStudent && deleteStudent(deletedStudent).then(() => history.goBack());
    };
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                        <IonButton onClick={handleDelete}>
                            Delete
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonItem>
                    <IonLabel>Student Name</IonLabel>
                    <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
                </IonItem>
                <IonItem>
                    <IonLabel>Checked: {JSON.stringify(graduated)}</IonLabel>
                    <IonToggle checked={graduated} onIonChange={e => setGraduated(e.detail.checked)} />
                </IonItem>
                <IonItemDivider>Number type input</IonItemDivider>
                <IonItem>
                    <IonInput type="number" value={grade} placeholder="Enter Number" onIonChange={e => setGrade(parseInt(e.detail.value!, 10))}></IonInput>
                </IonItem>
                <IonItem>
                    <IonLabel>Enrollment</IonLabel>
                    <IonLabel>D MMM YYYY H:mm</IonLabel>
                    <IonDatetime displayFormat="D MMM YYYY H:mm" min="1997" max="2010" value={enrollment} onIonChange={e => setEnrollment(e.detail.value!)}></IonDatetime>
                </IonItem>

                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save student'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default StudentEdit;
