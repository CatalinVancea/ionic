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
    IonItemDivider,
    IonIcon,
    IonActionSheet,
    IonCol,
    IonFab,
    IonFabButton,
    IonGrid,
    IonImg,
    IonRow,
} from '@ionic/react';


import { getLogger } from '../core';
import { StudentContext } from './StudentProvider';
import { RouteComponentProps } from 'react-router';
import { StudentProps } from './StudentProps';
import {globeOutline, logoHackernews, camera, close, trash} from "ionicons/icons";
import {Photo, usePhotoGallery} from "./usePhotoGallery";

const log = getLogger('StudentEdit');

interface StudentEditProps extends RouteComponentProps<{
    id?: string;
}> {}

export const StudentEdit: React.FC<StudentEditProps> = ({ history, match }) => {
    const { students, saving, savingError, saveStudent, deleteStudent, forceUpdateStudent, syncFunction} = useContext(StudentContext);
    const [name, setName] = useState('');
    const [showDiv, setShowDiv] = useState(false);
    const [graduated, setGraduated] = useState(Boolean());
    const [grade, setGrade] = useState(Number());
    const [enrollment, setEnrollment] = useState('2012-12-15T13:47:20.789');
    const [student, setStudent] = useState<StudentProps>();
    const { photos, takePhoto, deletePhoto } = usePhotoGallery();
    const [photoToDelete, setPhotoToDelete] = useState<Photo>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const student = students?.find(it => it.id === routeId);
        if (student) {
            setStudent(student);
            setName(student.name);
            setEnrollment(student.enrollment || '');
            setGraduated(student.graduated || Boolean());
            setGrade(student.grade || Number());
        }
    }, [match.params.id, students]);
    const handleSave = async () => {
        log("handleSave: start")
        const editedStudent = student ? {...student, name, graduated, grade, enrollment} : {
            name,
            graduated,
            grade,
            enrollment
        };
        //saveStudent && saveStudent(editedStudent).then(() => history.goBack());


        var c: boolean;
        c = false;

        if (saveStudent != null) {
            c = await saveStudent(editedStudent)
                .then(() => {
                    log("handleSave: save succeed")
                    return false;
                })
                .catch((error) => {
                    log("handleSave: Catch Error")

                    if(error == "Error: Network Error"){
                        log("handleSave: Network Error")
                        return false;
                    }

                    if(error == "Error: Version Conflict"){
                        log("handleSave: Version Conflict")
                        return true;
                    }
                    return false;
                })
        }
        return c;
        log("handleSave: stop")
    };
    const handleForceUpdate = () => {
        const editedStudent = student ? {...student, name, graduated, grade, enrollment} : {
            name,
            graduated,
            grade,
            enrollment
        };
        forceUpdateStudent && forceUpdateStudent(editedStudent).then(() => history.goBack());
    };
    const handleSync = () => {
        if (syncFunction) {
            syncFunction()
            history.goBack();
        }
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

                    {(showDiv==true) && (
                        <div  style={{ color: 'red' }}>
                            <div>Conflict</div>
                            <IonButtons slot="end">
                                <IonButton onClick={()=>{handleForceUpdate()}}>
                                    Force Update
                                </IonButton>
                                <IonButton onClick={()=>{handleSync()}}>
                                    Featch data
                                </IonButton>
                            </IonButtons>
                        </div>
                    )}

                    <IonButtons slot="end">
                        <IonButton onClick={()=>{
                            if(showDiv==true){
                                setShowDiv(false)
                            }else{
                                setShowDiv(true)
                            }
                        }}>
                            Show Div Test
                        </IonButton>
                        <IonButton onClick={async () => {
                            if (await handleSave() == true) {
                                setShowDiv(true)
                            } else {
                                setShowDiv(false)
                                history.goBack()
                            }
                        }}>
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

                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save student'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default StudentEdit;
