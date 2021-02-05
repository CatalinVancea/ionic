import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { StudentProps } from './StudentProps';
import {OrderProps} from "./OrderProps";

interface OrderPropsExt extends OrderProps {
    price:number
}

const OrderForPost: React.FC<OrderPropsExt> = ({ id, name, status,
                                            boughtBy, quantity,
                                            totalPrice,price}) => {
    return (
        <IonItem>
            <IonLabel>{"id: "+id + " name: " + name + " status: " + status + " boughtBy: " + boughtBy + " price: "+price}</IonLabel>
        </IonItem>
    );
};

export default OrderForPost;
