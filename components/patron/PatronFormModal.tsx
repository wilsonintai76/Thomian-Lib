
import React from 'react';
// Added missing RefreshCw import
import { X, UserPlus, Save, GraduationCap, Phone, Mail, ShieldCheck, User, RefreshCw } from 'lucide-react';
import { Patron, PatronGroup } from '../../types';

interface PatronFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (patron: Partial<Patron>) => void;
    initialData?: Patron | null;
    isSaving: boolean;
}

const PatronFormModal: React.FC<PatronFormModalProps> = ({ isOpen, onClose, onSave, initialData, isSaving }) => {
    const [formData, setFormData] = React.useState<Partial<Patron>>({
        student_id: '',
        full_name: '',
        patron_group: 'STUDENT',
        class_name: '',
        email: '',
        phone: '',
        is_blocked: false,
        fines: 0
    });

    React.useEffect(() => {
        if (initialData) setFormData(initialData);
        else setFormData({ student_id: '', full_name: '', patron_group: 'STUDENT', class_name: '', email: '', phone: '', is_blocked: false, fines: 0 });
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.student_id || !formData.full_name) {
            alert("ID and Name are mandatory.");
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-fade-in-up border border-slate-100">
                <div className="bg-slate-900 p-8 text-white relative">
                    <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white"><X className="h-6 w-6" /></button>
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            {initialData ? <User className="h-7 w-7" /> : <UserPlus className="h-7 w-7" />}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">{initialData ? 'Update Identity' : 'Register Patron'}</h3>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Thomian Core Directory Services</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Unique Patron ID (Barcode)</label>
                            <input 
                                type="text" 
                                value={formData.student_id}
                                disabled={!!initialData}
                                onChange={(e) => setFormData({...formData, student_id: e.target.value.toUpperCase()})}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-mono font-bold text-slate-700 outline-none focus:border-blue-500 disabled:opacity-50"
                                placeholder="ST-2024-XXX"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Legal Name</label>
                            <input 
                                type="text" 
                                value={formData.full_name}
                                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-blue-500"
                                placeholder="Surname, Given Names"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Patron Group</label>
                            <select 
                                value={formData.patron_group}
                                onChange={(e) => setFormData({...formData, patron_group: e.target.value as PatronGroup})}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500"
                            >
                                <option value="STUDENT">Student</option>
                                <option value="TEACHER">Teacher</option>
                                <option value="LIBRARIAN">Librarian</option>
                                <option value="ADMINISTRATOR">Administrator</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class / Grade</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                <input 
                                    type="text" 
                                    value={formData.class_name}
                                    onChange={(e) => setFormData({...formData, class_name: e.target.value})}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-10 pr-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500"
                                    placeholder="e.g. 10-A"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-10 pr-4 py-3 font-medium text-slate-700 outline-none focus:border-blue-500"
                                    placeholder="p.name@school.edu"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                <input 
                                    type="tel" 
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-10 pr-4 py-3 font-medium text-slate-700 outline-none focus:border-blue-500"
                                    placeholder="+1..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {initialData ? 'Update Record' : 'Register Patron'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatronFormModal;
