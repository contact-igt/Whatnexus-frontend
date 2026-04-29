export const getHeatStateStyles = (state: string) => {
    const normalized = state?.toLowerCase()?.replace('_', '');

    switch (normalized) {
        case 'hot': return 'bg-red-500/10 text-red-500 border-red-500/20';
        case 'warm': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        case 'cold': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'supercold': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
        default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
};
