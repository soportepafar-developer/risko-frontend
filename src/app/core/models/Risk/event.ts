import { Cause } from "./cause";
import { Control } from "./control";
import { Process } from "./process";
import { Responsibles } from "./project";
import { Risk } from "./risk";

export class Events {
    id?: number;
    name: string;
    whereOcurred: string;
    description?: string;
    startDate: Date;
    startTime: string;
    discoveryDate: Date;
    discoveryTime: string;
    state: string;
    criticality: string;
    generateLoss: string;
    responsibles?: Responsibles[];
    causes?: Cause[];
    processes?: Process[];
    controls?: Control[];
    risks?: Risk[];
}