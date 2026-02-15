import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Tithe } from '../types';
import { useMemberStore } from './memberStore';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, format, subMonths, isSameMonth, startOfYear, addMonths } from 'date-fns';

export const useTitheStore = defineStore('tithe', () => {
    const tithes = ref<Tithe[]>([
        { id: 't1', memberId: '1', amount: 5000, date: format(new Date(), 'yyyy-MM-05') },
        { id: 't2', memberId: '2', amount: 10000, date: format(new Date(), 'yyyy-MM-10') },
        { id: 't3', memberId: '1', amount: 2500, date: format(new Date(), 'yyyy-MM-12') },
        { id: 't4', memberId: '3', amount: 15000, date: format(subMonths(new Date(), 1), 'yyyy-MM-20') },
    ]);

    const memberStore = useMemberStore();

    const totalTithesThisMonth = computed(() => {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        return tithes.value
            .filter(t => isWithinInterval(parseISO(t.date), { start, end }))
            .reduce((sum, t) => sum + t.amount, 0);
    });

    const activeMembersCount = computed(() => memberStore.members.length);

    const membersYearlyStats = computed(() => {
        const now = new Date();
        const yearStart = startOfYear(now);
        const calendarMonths = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));

        return memberStore.members.map(member => {
            const monthlyHistory = calendarMonths.map(monthDate => {
                const amount = tithes.value
                    .filter(t => t.memberId === member.id && isSameMonth(parseISO(t.date), monthDate))
                    .reduce((sum, t) => sum + t.amount, 0);

                return {
                    month: format(monthDate, 'MMM'),
                    amount,
                    reachedTarget: amount >= member.monthlyTarget
                };
            });

            const currentMonthTithes = tithes.value
                .filter(t => t.memberId === member.id && isSameMonth(parseISO(t.date), now))
                .reduce((sum, t) => sum + t.amount, 0);

            const lastMonthTithes = tithes.value
                .filter(t => t.memberId === member.id && isSameMonth(parseISO(t.date), subMonths(now, 1)))
                .reduce((sum, t) => sum + t.amount, 0);

            const trend = currentMonthTithes >= lastMonthTithes ? 'up' : 'down';
            const percentage = member.monthlyTarget > 0
                ? Math.min(Math.round((currentMonthTithes / member.monthlyTarget) * 100), 100)
                : 0;

            return {
                memberId: member.id,
                memberName: member.name,
                target: member.monthlyTarget,
                current: currentMonthTithes,
                percentage,
                trend,
                history: monthlyHistory
            };
        });
    });

    const globalYearlyStats = computed(() => {
        const now = new Date();
        const yearStart = startOfYear(now);
        const calendarMonths = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));

        const totalMonthlyTarget = memberStore.members.reduce((sum, m) => sum + m.monthlyTarget, 0);

        const monthlyHistory = calendarMonths.map(monthDate => {
            const amount = tithes.value
                .filter(t => isSameMonth(parseISO(t.date), monthDate))
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                month: format(monthDate, 'MMM'),
                entries: amount,
                target: totalMonthlyTarget
            };
        });

        return {
            totalTarget: totalMonthlyTarget,
            history: monthlyHistory
        };
    });

    const dailyEvolutionData = computed(() => {
        const now = new Date();
        const daysInMonth = endOfMonth(now).getDate();
        const currentYearMonth = format(now, 'yyyy-MM');

        const data: Record<string, number> = {};
        for (let i = 1; i <= daysInMonth; i++) {
            const day = i.toString().padStart(2, '0');
            data[`${currentYearMonth}-${day}`] = 0;
        }

        tithes.value.forEach(t => {
            if (t.date.startsWith(currentYearMonth)) {
                data[t.date] = (data[t.date] || 0) + t.amount;
            }
        });

        return Object.entries(data).map(([date, amount]) => ({
            date: format(parseISO(date), 'dd MMM'),
            amount
        }));
    });

    function registerTithe(tithe: Omit<Tithe, 'id'>) {
        tithes.value.push({
            ...tithe,
            id: Math.random().toString(36).substring(2, 9),
        });
    }

    function getTithesByMemberId(memberId: string) {
        return tithes.value
            .filter(t => t.memberId === memberId)
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    return {
        tithes,
        totalTithesThisMonth,
        activeMembersCount,
        membersYearlyStats,
        globalYearlyStats,
        dailyEvolutionData,
        registerTithe,
        getTithesByMemberId,
    };
}, {
    persist: true
});
