import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { StudentProps } from './StudentProps';

interface StudentPropsExt extends StudentProps {
    onEdit: (id?: string) => void;
}

const Student: React.FC<StudentPropsExt> = ({ id, name, onEdit}) => {
    return (
        <IonItem onClick={() => onEdit(id)}>
            <IonLabel>{id + " " + name}</IonLabel>
        </IonItem>
    );
};

export default Student;
