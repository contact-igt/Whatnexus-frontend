"use client";

export const FooterSection = () => {
    return (
        <footer className="py-20 px-6 border-t border-white/5 bg-[#080809]">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <div className='flex items-center gap-1'>
                            <span className="font-black text-xl tracking-tighter">WhatsNexus<span className="text-emerald-500">. </span></span><span className="text-[9px] mb-2 font-black bg-white/10 px-2 py-0.5 tracking-wider rounded-full uppercase text-emerald-400 border border-white/5">Beta</span>
                        </div>
                        <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">Powered by Invictus Global Tech</span>
                    </div>
                </div>
                <div className="text-white/20 text-[10px] font-bold tracking-widest uppercase text-center md:text-right">
                    © 2024 WhatsNexus. Beta Version. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
};
