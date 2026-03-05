export const getHeatStateStyles = (state: string) => {
    switch (state?.toLowerCase()) {
        case 'hot': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        case 'warm': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        case 'cold': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'super_cold': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
        default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
};
