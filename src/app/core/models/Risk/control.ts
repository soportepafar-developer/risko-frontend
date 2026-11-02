import { Responsibles } from "./project";
import { Risk } from "./risk";

export class Control {
    id?: number;
    name: string;
    description?: string;
    executionType: string;
    qualify: number;
    isFrequent: number;
    isDocument: string;
    hasEvidence: number;
    responsibleAssigned: number;
    eventsAssociated: number;
    isEffective: number;
    isEvidenceEffective: number;
    correctTime: number;
    solidityDesign: string;
    solidityExecution: string;  
    solidityResult: string;
    percentageDesign: string;
    percentageExecution: string;
    percentageResult: string;
    responsibles?: Responsibles[];
    risks?: Risk[];
}

export class ControlParams{
    id?: number;
    name: string;
    parama: string;
    paramb: string;
    paramc: string;
    module: string;
}
