export type Tribe =
    | 'Ruben'
    | 'Siméon'
    | 'Lévi'
    | 'Juda'
    | 'Dan'
    | 'Nephthali'
    | 'Gad'
    | 'Aser'
    | 'Issacar'
    | 'Zabulon'
    | 'Joseph'
    | 'Benjamin';

export const TRIBES: Tribe[] = [
    'Ruben', 'Siméon', 'Lévi', 'Juda', 'Dan', 'Nephthali',
    'Gad', 'Aser', 'Issacar', 'Zabulon', 'Joseph', 'Benjamin'
];

export interface Member {
    id: string;
    name: string;
    age: number;
    gender: 'M' | 'F';
    contact: string;
    tribe: Tribe;
    joinedAt: string;
}

export interface Tithe {
    id: string;
    memberId: string;
    amount: number;
    date: string;
}
