import { Cause } from "./cause";
import { Control } from "./control";
import { Process } from "./process";
import { Responsibles } from "./project";

export class Risk {
    id?: number;
    code?: string;
    name: string;
    impact: number;
    impactWeight?: number;
    frequency: number;
    frequencyWeight?: number;
    description?: string;
    affect: number;
    responsibles?: Responsibles[];
    causes?: Cause[];
    processes?: Process[];
    controls?: Control[];
    inherentLevel?: string;
    inherentColor?: string;
    residualImpact?: number;
    residualFrequency?: number;
    residualLevel?: string;
    residualColor?: string;
}

export class RiskForAssociate {
    id?: number;
    name: string;
    impact: number;
    impactName: string;
    frecuency: number;
    frequencyName: string;
}
