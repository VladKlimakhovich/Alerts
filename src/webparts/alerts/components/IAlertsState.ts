import { IArrayItem } from "./IArrayItem";

export interface IAlertsState {
    errorMessage: string;
    arrayAlerts: IArrayItem[];
    levelStyle: string;
    levelIcon: string;
}