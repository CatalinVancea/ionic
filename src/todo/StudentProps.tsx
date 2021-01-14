import {Photo} from "./usePhotoGallery";

export interface StudentProps {
    id?: string;
    name: string;
    graduated?: boolean;
    grade?: number;
    enrollment?: string;
    version?: string;
    sync?: boolean;
    studentPhotos: Photo[];
}
