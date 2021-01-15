import {Photo} from "./usePhotoGallery";
import {LngLatLocation} from "./maps/useMyLocation";

export interface StudentProps {
    id?: string;
    name: string;
    graduated?: boolean;
    grade?: number;
    enrollment?: string;
    version?: string;
    sync?: boolean;
    studentPhotos: Photo[];
    position?: LngLatLocation;
}
