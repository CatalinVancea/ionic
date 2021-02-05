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
    IonToolbar
} from '@ionic/react';
import { add, removeCircle, reload} from 'ionicons/icons';
import { getLogger } from '../core';
import { OrderContext } from "./OrdersProvider";
import Order from "./Order";

const log = getLogger('PostStudent');

export const PostStudent: React.FC<RouteComponentProps> = ({ history }) => {
    const { orders, fetching, fetchingError } = useContext(OrderContext);
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My App</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching students" />
                {orders && (
                    <IonList>
                        {orders.map(({ id, name, totalPrice,
                                         status, boughtBy,quantity}) =>
                                <Order key={id} id={id} name={name} status={status}
                                       boughtBy={boughtBy} quantity={quantity}
                                       totalPrice={totalPrice}/>
                        )}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch orders'}</div>
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

export default PostStudent;
