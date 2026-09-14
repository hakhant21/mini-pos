import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLocaleStore = defineStore('locale', () => {
    const locale = ref(localStorage.getItem('locale') ?? 'my');
    function setLocale(value) {
        locale.value = value;
        localStorage.setItem('locale', value);
    }
    return { locale, setLocale };
});
