export interface Member {
    id: string;
    name: string;
    age: number;
    gender: 'M' | 'F';
    contact: string;
    monthlyTarget: number;
    joinedAt: string;
}

export interface Tithe {
    id: string;
    memberId: string;
    amount: number;
    date: string;
}
