export const saveCharacter = (data) => {
    try {
        localStorage.setItem('tabaxi_generator_data', JSON.stringify(data));
    } catch (e) {
        console.error("Could not save to localStorage", e);
    }
};

export const loadCharacter = () => {
    try {
        const data = localStorage.getItem('tabaxi_generator_data');
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error("Could not load from localStorage", e);
        return null;
    }
};
