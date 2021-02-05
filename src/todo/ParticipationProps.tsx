import {Photo} from "./usePhotoGallery";
import {LngLatLocation} from "./maps/useMyLocation";

export interface ParticipationProps {
    id?: string;
    examId: string;
    student: string;
    status: string;
}
