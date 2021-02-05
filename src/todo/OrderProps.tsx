import {Photo} from "./usePhotoGallery";
import {LngLatLocation} from "./maps/useMyLocation";


interface quantityPair {
    value: number;
    user: string;
}

export interface OrderProps {
    id?: string;
    name: string;
    quantity: quantityPair[];
    totalPrice: number;
    boughtBy: string;
    status: string;
}
