import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Tithe } from '../types';
import { supabase } from '../lib/supabase';
import { useMemberStore } from './memberStore';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, format, subMonths, isSameMonth, startOfYear, addMonths } from 'date-fns';

export const useTitheStore = defineStore('tithe', () => {
    const tithes = ref<Tithe[]>([]);
    const loading = ref(false);

    const INITIAL_TITHES = [
        { id: 't1', memberId: '1', amount: 5000, date: format(new Date(), 'yyyy-MM-05') },
        { id: 't2', memberId: '2', amount: 10000, date: format(new Date(), 'yyyy-MM-10') },
        { id: 't3', memberId: '1', amount: 2500, date: format(new Date(), 'yyyy-MM-12') },
        { id: 't4', memberId: '3', amount: 15000, date: format(subMonths(new Date(), 1), 'yyyy-MM-20') },
    ];

    async function fetchTithes() {
        loading.value = true;
        try {
            const { data, error } = await supabase
                .from('tithes')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;

            if (data) {
                tithes.value = data.map((t: any) => ({
                    id: t.id,
                    memberId: t.member_id,
                    amount: t.amount,
                    date: t.date
                }));
            }
        } catch (error) {
            console.error('Error fetching tithes:', error);
        } finally {
            loading.value = false;
        }
    }

    async function seedInitialTithes() {
        loading.value = true;
        try {
            const tithesToInsert = INITIAL_TITHES.map(t => ({
                id: t.id,
                member_id: t.memberId,
                amount: t.amount,
                date: t.date
            }));

            const { error } = await supabase
                .from('tithes')
                .insert(tithesToInsert);

            if (error) throw error;
            await fetchTithes();
        } catch (error) {
            console.error('Error seeding tithes:', error);
        } finally {
            loading.value = false;
        }
    }

    async function resetToInitialTithes() {
        loading.value = true;
        try {
            const { error: deleteError } = await supabase
                .from('tithes')
                .delete()
                .neq('id', '0');

            if (deleteError) throw deleteError;
            await seedInitialTithes();
        } catch (error) {
            console.error('Error resetting tithes:', error);
        } finally {
            loading.value = false;
        }
    }

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

    async function registerTithe(tithe: Omit<Tithe, 'id'>) {
        const id = Math.random().toString(36).substring(2, 9);
        const newTithe = { ...tithe, id };

        try {
            const { error } = await supabase
                .from('tithes')
                .insert({
                    id,
                    member_id: tithe.memberId,
                    amount: tithe.amount,
                    date: tithe.date
                });

            if (error) throw error;
            tithes.value.push(newTithe);
        } catch (error) {
            console.error('Error registering tithe:', error);
        }
    }

    function getTithesByMemberId(memberId: string) {
        return tithes.value
            .filter(t => t.memberId === memberId)
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    return {
        tithes,
        loading,
        totalTithesThisMonth,
        activeMembersCount,
        membersYearlyStats,
        globalYearlyStats,
        dailyEvolutionData,
        fetchTithes,
        registerTithe,
        getTithesByMemberId,
        resetToInitialTithes,
    };
}, {
    persist: true
});
