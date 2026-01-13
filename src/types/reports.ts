export interface KpiData {
    title: string;
    value: string | number;
    change: number;
    icon: string;
}

export interface MonthlyEvolution {
    month: string;
    amount: number;
}

export interface TribeContribution {
    tribe: string;
    amount: number;
    color: string;
}

export interface AgeGroup {
    range: string;
    count: number;
}

export interface ReportsData {
    kpis: KpiData[];
    evolution: MonthlyEvolution[];
    tribes: TribeContribution[];
    agePyramid: AgeGroup[];
}
