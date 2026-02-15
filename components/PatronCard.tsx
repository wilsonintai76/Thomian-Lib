
import React from 'react';
import { ShieldCheck, User } from 'lucide-react';
import { Patron, MapConfig } from '../types';

interface PatronCardProps {
    patron: Patron;
    config: MapConfig | null;
}

const BarcodeMock: React.FC<{ code: string }> = ({ code }) => (
    <div className="flex items-end gap-[1px] h-10 bg-white p-1 rounded-sm">
        {code.split('').map((char, i) => (
            <div 
                key={i} 
                className="bg-black" 
                style={{ 
                    width: (parseInt(char, 36) % 3 + 1) + 'px',
                    height: (80 + (i % 20)) + '%' 
                }} 
            />
        ))}
    </div>
);

const PatronCard: React.FC<PatronCardProps> = ({ patron, config }) => {
  return (
    <div className="w-[324px] h-[204px] bg-white rounded-[12px] shadow-2xl overflow-hidden relative border border-slate-200 flex flex-col font-sans select-none">
        {/* Header Ribbon */}
        <div className="h-12 bg-slate-900 flex items-center px-4 gap-3 relative">
            <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-red-600 to-transparent opacity-50" />
            <div className="h-8 w-8 bg-white rounded-lg p-1 shrink-0 z-10">
                {config?.logo ? (
                    <img src={config.logo} alt="" className="w-full h-full object-contain" />
                ) : (
                    <div className="w-full h-full bg-blue-600 rounded-sm" />
                )}
            </div>
            <div className="z-10">
                <p className="text-[10px] font-black text-white leading-none uppercase tracking-tighter">St. Thomas Secondary</p>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-tight">Library Information System</p>
            </div>
        </div>

        {/* Card Body */}
        <div className="flex-1 flex p-4 gap-4 bg-gradient-to-br from-white to-slate-50">
            {/* Photo Placeholder */}
            <div className="w-20 h-24 bg-slate-100 rounded-lg border-2 border-slate-200 flex flex-col items-center justify-center relative overflow-hidden shrink-0 shadow-inner">
                <User className="h-12 w-12 text-slate-300" />
                <div className="absolute bottom-0 w-full bg-slate-200/80 py-1 text-center">
                    <span className="text-[6px] font-black text-slate-500 uppercase">Identity Verified</span>
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div>
                    <p className="text-[6px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Patron Name</p>
                    <h4 className="text-sm font-black text-slate-800 leading-tight uppercase truncate">{patron.full_name}</h4>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-slate-900 text-white text-[7px] font-black rounded uppercase tracking-tighter">
                            {patron.patron_group}
                        </span>
                        <div className="flex items-center gap-1 text-[7px] font-bold text-emerald-600">
                            <ShieldCheck className="h-2 w-2" /> ACTIVE
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Student ID / Barcode</p>
                    <BarcodeMock code={patron.student_id} />
                    <p className="text-[8px] font-mono font-bold text-slate-800 tracking-[0.3em]">{patron.student_id}</p>
                </div>
            </div>
        </div>

        {/* Hologram Accent */}
        <div className="absolute top-16 right-[-10px] w-12 h-12 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute bottom-4 right-4 h-6 w-6 border-2 border-slate-100 rounded-full flex items-center justify-center opacity-30 rotate-12">
            <ShieldCheck className="h-3 w-3 text-slate-300" />
        </div>
    </div>
  );
};

export default PatronCard;
