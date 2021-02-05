import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonItem } from "@ionic/react";
import React from "react";
import { RouteComponentProps } from "react-router";

const HomePage: React.FC<RouteComponentProps> = ({ history }) => {

    return (
        <IonPage id="HomePage">
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Items</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonButton onClick={() => { history.push('/post-order') }}>Post Order</IonButton>
                <IonButton onClick={() => { history.push('/solve-order') }}>Solve Order</IonButton>
            </IonContent>
        </IonPage>
    );
};

export default HomePage;