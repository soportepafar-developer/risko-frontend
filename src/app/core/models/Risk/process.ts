import { Responsibles } from "./project";
import { CategoryProcess } from "../Enum/category-process.enum";
import { TypeProcess } from "../Enum/type-process.enum";
import { Risk } from "./risk";

export class Process {
    id?: number;
    name: string;
    type: TypeProcess; 
    category: CategoryProcess;
    project?: number;
    process?: number;
    code: string;
    unit?: number
    description: string;
    responsibles: Responsibles[];
    risks?: Risk[];
}
