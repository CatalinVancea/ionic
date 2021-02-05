import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { StudentProps } from './StudentProps';
import {OrderProps} from "./OrderProps";

interface OrderPropsExt extends OrderProps {
}

const OrderForSolve: React.FC<OrderPropsExt> = ({ id, name, status,
                                            boughtBy, quantity,
                                            totalPrice}) => {
    return (
        <IonItem >
            <IonLabel>{"id: "+id + " name: " + name + " status: " + status + " boughtBy: " + boughtBy}</IonLabel>
        </IonItem>
    );
};

export default OrderForSolve;
