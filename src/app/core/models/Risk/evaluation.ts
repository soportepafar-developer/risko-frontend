import { Control } from "./control";
import { Responsibles } from "./project";
import { Risk } from "./risk";

export class Evaluation {
    id?: number;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    type: string;
    responsibles?: Responsibles[];
    controls?: Control[];
    risks?: Risk[];
}