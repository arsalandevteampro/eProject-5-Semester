export const convertWeight = (val, toUnit) => {
    if (!val || isNaN(val)) return val;
    if (toUnit === 'lbs') return (val * 2.20462).toFixed(1);
    return val;
};

export const convertBackWeight = (val, fromUnit) => {
    if (!val || isNaN(val)) return val;
    if (fromUnit === 'lbs') return (val / 2.20462).toFixed(1);
    return val;
};

export const convertHeight = (val, toUnit) => {
    if (!val || isNaN(val)) return val;
    if (toUnit === 'ft') {
        const totalInches = val / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return `${feet}'${inches}"`;
    }
    return val;
};

export const convertBackHeight = (val, fromUnit) => {
    if (!val) return val;
    if (fromUnit === 'ft') {
        const parts = val.split("'");
        if (parts.length === 2) {
            const feet = parseInt(parts[0]);
            const inches = parseInt(parts[1].replace('"', ''));
            return ((feet * 12 + inches) * 2.54).toFixed(1);
        }
    }
    return val;
};

export const convertDistance = (val, toUnit) => {
    if (!val || isNaN(val)) return val;
    if (toUnit === 'mi') return (val * 0.621371).toFixed(2);
    return val;
};

export const convertMeasurement = (val, toUnit) => {
    if (!val || isNaN(val)) return val;
    if (toUnit === 'in') return (val / 2.54).toFixed(1);
    return val;
};

export const convertBackMeasurement = (val, fromUnit) => {
    if (!val || isNaN(val)) return val;
    if (fromUnit === 'in') return (val * 2.54).toFixed(1);
    return val;
};
