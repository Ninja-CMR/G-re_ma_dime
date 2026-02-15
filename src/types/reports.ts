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

export interface AchievementGroup {
    label: string;
    count: number;
    color?: string;
}

export interface AgeGroup {
    range: string;
    count: number;
}

export interface ReportsData {
    kpis: KpiData[];
    evolution: MonthlyEvolution[];
    achievement: AchievementGroup[];
    agePyramid: AgeGroup[];
}
