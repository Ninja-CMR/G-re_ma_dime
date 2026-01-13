import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Tithe } from '../types';
import { useMemberStore } from './memberStore';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, format } from 'date-fns';

export const useTitheStore = defineStore('tithe', () => {
    const tithes = ref<Tithe[]>([
        { id: 't1', memberId: '1', amount: 5000, date: '2026-01-05' },
        { id: 't2', memberId: '2', amount: 10000, date: '2026-01-10' },
        { id: 't3', memberId: '1', amount: 2500, date: '2026-01-12' },
        { id: 't4', memberId: '3', amount: 15000, date: '2025-12-20' },
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

    const mostGenerousTribe = computed(() => {
        const tribeTotals: Record<string, number> = {};

        tithes.value.forEach(t => {
            const member = memberStore.getMemberById(t.memberId);
            if (member) {
                tribeTotals[member.tribe] = (tribeTotals[member.tribe] || 0) + t.amount;
            }
        });

        let maxTribe = 'Aucune';
        let maxAmount = 0;

        for (const [tribe, total] of Object.entries(tribeTotals)) {
            if (total > maxAmount) {
                maxAmount = total;
                maxTribe = tribe;
            }
        }

        return maxTribe;
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
        mostGenerousTribe,
        dailyEvolutionData,
        registerTithe,
        getTithesByMemberId,
    };
}, {
    persist: true
});
