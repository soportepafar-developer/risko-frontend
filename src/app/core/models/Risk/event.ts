import { Cause } from "./cause";
import { Control } from "./control";
import { Process } from "./process";
import { Responsibles } from "./project";
import { Risk } from "./risk";

export class Events {
    id?: number;
    code?: string;
    name: string;
    category?: string;
    whereOcurred: string;
    description?: string;
    startDate: Date;
    startTime: string;
    discoveryDate: Date;
    discoveryTime: string;
    endDate?: Date;
    endTime?: string;
    state: string;
    criticality: string;
    generateLoss: string;
    lossAmount?: number;
    recoveredAmount?: number;
    netLoss?: number;
    recoveryCosts?: number;
    downtimeHours?: number;
    reputationalImpact?: string;
    responsibles?: Responsibles[];
    causes?: Cause[];
    processes?: Process[];
    controls?: Control[];
    risks?: Risk[];
}
