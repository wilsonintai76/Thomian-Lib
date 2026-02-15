
import React from 'react';
import { Book as BookType } from '../types';

interface BookLabelProps {
    book: Partial<BookType>;
}

const BookLabel: React.FC<BookLabelProps> = ({ book }) => {
    const authorShort = (book.author || 'UNK').slice(0, 3).toUpperCase();
    
    // Logic to split DDC for narrow spines
    const ddc = book.ddc_code || '000.00';
    const [main, sub] = ddc.includes('.') ? ddc.split('.') : [ddc, ''];

    return (
        <div className="w-[144px] h-[96px] bg-white border border-slate-300 p-2 flex flex-col font-mono shadow-md select-none relative group overflow-hidden">
            {/* Grid pattern to simulate label texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]" />
            
            <div className="flex-1 flex justify-between gap-2 z-10">
                {/* DDC Vertical Stack */}
                <div className="flex flex-col leading-none">
                    <span className="text-xl font-black text-black">{main}</span>
                    {sub && <span className="text-lg font-bold text-black">.{sub}</span>}
                    <span className="text-xs font-bold text-black mt-1 bg-black text-white px-1 w-fit">{authorShort}</span>
                </div>

                {/* Vertical Barcode Rotation */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="flex flex-col gap-[1px] w-12 h-14 bg-black/5 p-1 rounded-sm">
                        {Array.from({length: 12}).map((_, i) => (
                            <div 
                                key={i} 
                                className="bg-black h-[2px]" 
                                style={{ 
                                    width: (40 + (Math.random() * 60)) + '%' 
                                }} 
                            />
                        ))}
                    </div>
                    <span className="text-[7px] font-black mt-1 tracking-widest">{book.barcode_id || 'TEMP-ID'}</span>
                </div>
            </div>

            {/* Cutter Info Bottom */}
            <div className="mt-auto pt-1 border-t border-slate-200 flex justify-between items-center z-10">
                <span className="text-[6px] font-black uppercase text-slate-400">Thomian Lib</span>
                <span className="text-[6px] font-black uppercase text-slate-400">Spine-1.5x1</span>
            </div>
        </div>
    );
};

export default BookLabel;
