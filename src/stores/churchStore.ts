import { defineStore } from 'pinia';
import { ref } from 'vue';


export const useChurchStore = defineStore('church', () => {
    const churchInfo = ref({
        name: 'Gère ma Dîme Centra',
        logo: '',
        currency: 'XAF',
        address: 'Yaoundé, Cameroun',
        phone: '+237 600 000 000',
        email: 'contact@geremadime.cm'
    });


    function updateChurchInfo(newInfo: Partial<typeof churchInfo.value>) {
        churchInfo.value = { ...churchInfo.value, ...newInfo };
    }


    return {
        churchInfo,
        updateChurchInfo
    };
}, {
    persist: true
});
