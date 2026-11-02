
export class Project {
    id?: number;
    name: string;
    descripcion: string;
    responsibles: Responsibles[];
}

export class Responsibles{
    id: number;
    fullName: string;
    dependence: string;
    position: string;
}