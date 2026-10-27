import { Risk } from "./risk";

export class Cause {
    id?: number;
    name: string;
    type: string;
    category: string;
    description: string;
    risks?: Risk[];
}