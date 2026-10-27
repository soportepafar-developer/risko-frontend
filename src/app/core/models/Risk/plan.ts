import { Cause } from "./cause";
import { Control } from "./control";
import { Events } from "./event";
import { PlanActivity } from "./plan-activity";
import { Process } from "./process";
import { Responsibles } from "./project";
import { Risk } from "./risk";

export class Plan {
    id?: number;
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    responsibles?: Responsibles[];
    processes?: Process[];
    controls?: Control[];
    risks?: Risk[];
    events?: Events[];
    activities?: PlanActivity[];
}