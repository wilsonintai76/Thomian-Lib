
import React, { useState } from 'react';
import { BookOpen, ArrowLeftRight, Settings, ScanLine, Printer, LayoutGrid, Calendar, HelpCircle, ChevronRight, Bookmark, AlertTriangle, Search, CheckCircle, MapPin, Sparkles, Building2, MapPinned, Image as ImageIcon, Smartphone, ShieldCheck, Wallet, UserCheck, Zap, Server, RefreshCcw, Globe, Wifi } from 'lucide-react';

interface HelpTopic {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  content: React.ReactNode;
}

const HelpGuide: React.FC = () => {
  const [activeTopicId, setActiveTopicId] = useState<string>('CIRCULATION');

  const topics: HelpTopic[] = [
    {
      id: 'CIRCULATION',
      title: 'Circulation Desk',
      icon: ArrowLeftRight,
      description: 'How to issue, return, and manage book loans.',
      content: (
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Checking Out Books</h3>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600">
              <li>Navigate to the <strong>Circulation</strong> tab.</li>
              <li>Ensure the mode toggle is set to <strong>Check Out</strong> (Green Theme).</li>
              <li><strong>Scan Patron ID:</strong> Scan the student's ID card first. The system will verify their status.</li>
              <li><strong>Scan Books:</strong> Once identified, scan book barcodes to add them to the batch.</li>
              <li><strong>Complete Transaction:</strong> Click "Complete Loan Transaction" to finalize.</li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Returns (Check In)</h3>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600">
              <li>Switch mode to <strong>Check In</strong> (Blue Theme).</li>
              <li><strong>Scan Book:</strong> Scan barcodes to return them. No patron ID required.</li>
              <li><strong>Review Outcome:</strong> Check for fines or reservation alerts (Purple mode).</li>
            </ol>
          </section>
        </div>
      )
    },
    {
      id: 'FINANCIAL',
      title: 'Financial Desk & Audit',
      icon: Wallet,
      description: 'Accepting payments and processing waivers.',
      content: (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex gap-3 mb-6">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-sm text-emerald-800 font-medium">
              <strong>Accountability Tracking:</strong> Every financial transaction is stamped with the Full Name of the processing librarian for audit transparency.
            </p>
          </div>

          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Processing Cash Payments</h3>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600">
              <li>Locate the patron in the <strong>Patrons</strong> dashboard.</li>
              <li>Click the <strong>Banknote Icon</strong> to open the Ledger.</li>
              <li>Enter the cash amount received and click "Accept & Print".</li>
              <li><strong>Receipt Signature:</strong> A physical signature is required on the printed receipt under the "Received By" line to validate the paper trail.</li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Dismissing (Waiving) Fines</h3>
            <p className="text-slate-600 mb-2">Use this only for verified school excuses (illness, administrative error).</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>A <strong>Reason for Waive</strong> is mandatory for the audit log.</li>
              <li>The "Processed By" field will record your identity permanently in the system history.</li>
            </ul>
          </section>
        </div>
      )
    },
    {
      id: 'CATALOG',
      title: 'Cataloging & Acquisition',
      icon: BookOpen,
      description: 'Adding new books and managing inventory.',
      content: (
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
              Zebra Optimization <div className="px-2 py-0.5 bg-slate-900 text-white text-[8px] rounded uppercase">Hardware</div>
            </h3>
            <p className="text-slate-600 mb-4">
              The acquisition interface is optimized for Zebra HID scanners. The ISBN input will automatically re-focus after every commit to allow for rapid multi-book intake.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-3">AI Search Waterfall</h3>
            <p className="text-slate-600 mb-3">
              The system uses a sequential search to find book metadata automatically:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded">1</div>
                <span className="text-sm font-medium">Local Database (Thomian Core)</span>
              </li>
              <li className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded">2</div>
                <span className="text-sm font-medium">Z39.50 Library of Congress Gateway</span>
              </li>
              <li className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded">3</div>
                <span className="text-sm font-medium">Open Library Global API</span>
              </li>
            </ul>
          </section>
        </div>
      )
    },
    {
      id: 'WAYFINDER',
      title: 'Map & Wayfinder Setup',
      icon: MapPin,
      description: 'Creating digital twins with Gemini AI Vision.',
      content: (
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
              AI Vision Analysis <Sparkles className="h-5 w-5 text-amber-500" />
            </h3>
            <p className="text-slate-600 mb-4">
                The Thomian Library uses <strong>Gemini 3 Flash</strong> to analyze architectural blueprints.
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600">
              <li>Upload a blueprint image (JPG/PNG).</li>
              <li>Click <strong>AI Auto-Map</strong>.</li>
              <li>The AI will detect rectangles representing shelves and automatically assign Dewey Decimal (DDC) ranges based on the room's flow.</li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Calibrating "You Are Here"</h3>
            <p className="text-slate-600 mb-3">
                Students need to know where they are relative to the shelves.
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600">
              <li>Enter <strong>Set Kiosk</strong> mode.</li>
              <li>Click the map at the exact physical location of the Kiosk station.</li>
            </ol>
          </section>
        </div>
      )
    },
    {
      id: 'STOCKTAKE',
      title: 'Inventory Audit',
      icon: ScanLine,
      description: 'Shelf verification using Dual-Scan tech.',
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3 mb-6">
            <Zap className="h-5 w-5 text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800 font-medium">
              <strong>Dual-Scan Technology:</strong> You can use a Zebra scanner at the desk or switch to <strong>Mobile Scanner</strong> mode to audit shelves physically using a smartphone camera.
            </p>
          </div>

          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Running an Audit</h3>
            <p className="text-slate-600 mb-4">
              Stocktaking verifies that physical books are in the correct zones.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                 <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                 <div>
                    <span className="font-bold text-slate-800">Verified:</span>
                    <p className="text-sm text-slate-600">Book is present and correctly shelved.</p>
                 </div>
              </li>
              <li className="flex items-start gap-3">
                 <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                 <div>
                    <span className="font-bold text-slate-800">Misplaced:</span>
                    <p className="text-sm text-slate-600">The system will tell you exactly which shelf the book <span className="underline italic">actually</span> belongs on.</p>
                 </div>
              </li>
            </ul>
          </section>
        </div>
      )
    },
    {
      id: 'DEPLOYMENT',
      title: 'System Deployment',
      icon: Server,
      description: 'Server, Hardware, and Network Setup Guide.',
      content: (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-400" /> Hybrid Architecture
            </h3>
            <p className="text-sm text-slate-300">
              The Thomian Library System operates as a hybrid web app. The frontend handles Kiosk UI and Admin Dashboards via HTTPS (required for AI/Camera), while a local backend manages Zebra hardware communication.
            </p>
          </div>

          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                Managing AI Token Quota <RefreshCcw className="h-5 w-5 text-blue-600" />
            </h3>
            <p className="text-sm text-slate-600 mb-4">
                The "AI Auto-Map" feature uses the Google Gemini API. If you receive a <span className="font-mono text-rose-600 bg-rose-50 px-1 rounded">Quota Exhausted</span> error, follow these renewal steps:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border-2 border-slate-100 p-4 rounded-xl shadow-sm">
                    <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase">Option A</span>
                    <h4 className="font-bold text-slate-800 mt-2 mb-1">Wait for Reset</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Quotas reset automatically at Midnight (PT). This happens on Google's servers; no action required.
                    </p>
                </div>
                <div className="bg-white border-2 border-slate-100 p-4 rounded-xl shadow-sm">
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded uppercase">Option B</span>
                    <h4 className="font-bold text-slate-800 mt-2 mb-1">Billing Upgrade</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Enable "Blaze" (Pay-as-you-go) in Google Cloud Console. Costs are approx. $0.0001 per image analysis.
                    </p>
                </div>
                <div className="bg-white border-2 border-slate-100 p-4 rounded-xl shadow-sm">
                    <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-1 rounded uppercase">Option C</span>
                    <h4 className="font-bold text-slate-800 mt-2 mb-1">Rotate Key</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Generate a new API Key in Google AI Studio and update the server's `.env` configuration file.
                    </p>
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                    <HelpCircle className="h-4 w-4 text-blue-500" /> How does Google track my usage?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                    Google identifies your application <strong>solely by the API Key</strong> configured in your settings. It does not track your website URL, IP address, or hosting provider (Firebase/Vercel) for quota purposes.
                </p>
                <div className="mt-2 flex gap-2">
                    <span className="text-[10px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded">PRO TIP</span>
                    <span className="text-[10px] text-slate-500 font-medium">If you have multiple library branches, create a unique API Key for each branch to give them separate quotas.</span>
                </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Hosting Strategy</h3>
            <p className="text-sm text-slate-600 mb-3">You are not required to use Firebase. Choose the method that fits your school's IT infrastructure:</p>
            <div className="space-y-3">
                <div className="flex gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="bg-white p-2 rounded-lg h-fit border border-slate-100 shadow-sm"><Globe className="h-5 w-5 text-blue-500" /></div>
                    <div>
                        <h4 className="font-bold text-sm text-slate-800">Cloud Hosting (Firebase / Vercel / Netlify)</h4>
                        <p className="text-xs text-slate-600 mt-1">Recommended. Free tiers usually suffice. Requires zero maintenance and provides HTTPS automatically (essential for camera/AI). <strong>Use the included `firebase.json` for instant config.</strong></p>
                    </div>
                </div>
                <div className="flex gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="bg-white p-2 rounded-lg h-fit border border-slate-100 shadow-sm"><Wifi className="h-5 w-5 text-emerald-500" /></div>
                    <div>
                        <h4 className="font-bold text-sm text-slate-800">Local School Server (Nginx / Apache)</h4>
                        <p className="text-xs text-slate-600 mt-1">Advanced. Keeps all data within the building. Requires IT to configure an SSL Certificate manually, otherwise camera permissions will be blocked by the browser.</p>
                    </div>
                </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Hardware Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 p-4 rounded-xl">
                <h4 className="font-bold text-sm text-slate-700 mb-2 flex items-center gap-2">
                  <Printer className="h-4 w-4" /> Zebra Printers
                </h4>
                <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                  <li><strong>Port:</strong> 9100 (Raw TCP/IP)</li>
                  <li><strong>Labels:</strong> 1.5" x 1" (Spine)</li>
                  <li><strong>Cards:</strong> CR80 PVC (Patron ID)</li>
                  <li>Ensure static IP assignment for reliable routing.</li>
                </ul>
              </div>
              <div className="border border-slate-200 p-4 rounded-xl">
                <h4 className="font-bold text-sm text-slate-700 mb-2 flex items-center gap-2">
                  <ScanLine className="h-4 w-4" /> Barcode Scanners
                </h4>
                <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                  <li><strong>Mode:</strong> HID Keyboard Emulation</li>
                  <li><strong>Suffix:</strong> Carriage Return (CR / Enter)</li>
                  <li><strong>Delay:</strong> 0ms (Instant)</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      )
    },
    {
      id: 'SECURITY',
      title: 'System & Security',
      icon: ShieldCheck,
      description: 'Access levels and blueprint testing.',
      content: (
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Administrative Access</h3>
            <p className="text-slate-600 mb-4">
              Two roles are defined within the system:
            </p>
            <ul className="space-y-2">
              <li className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                <strong>Librarian:</strong> Access to Circulation, Cataloging, Patrons, and Reports.
              </li>
              <li className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                <strong>Administrator:</strong> Full system access including the <strong>Circulation Matrix</strong> (Policy Engine) and <strong>Map Layout</strong> editor.
              </li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
               Master Blueprint Mode <Sparkles className="h-5 w-5 text-amber-500" />
            </h3>
            <p className="text-slate-600">
              For blueprint testing, the <strong>"Fill Admin"</strong> button on the login screen provides instant access to the Administrator role using authorized demo credentials.
            </p>
          </section>
        </div>
      )
    }
  ];

  const activeContent = topics.find(t => t.id === activeTopicId);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto h-full flex flex-col md:flex-row gap-8 animate-fade-in-up">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 shrink-0 space-y-4">
         <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
               <HelpCircle className="h-7 w-7 text-blue-600" />
               Help & Documentation
            </h2>
            <p className="text-slate-500 text-sm font-medium">Librarian Operations Handbook</p>
         </div>

         <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {topics.map(topic => (
               <button
                 key={topic.id}
                 onClick={() => setActiveTopicId(topic.id)}
                 className={`w-full text-left p-5 flex items-center gap-4 border-b border-slate-100 last:border-0 transition-all
                    ${activeTopicId === topic.id ? 'bg-blue-600 text-white shadow-inner' : 'hover:bg-slate-50 text-slate-600'}
                 `}
               >
                  <div className={`p-2 rounded-xl ${activeTopicId === topic.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <topic.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                      <p className="font-black text-xs uppercase tracking-widest">{topic.title}</p>
                      <p className={`text-[10px] truncate ${activeTopicId === topic.id ? 'text-blue-100' : 'text-slate-400'}`}>{topic.description}</p>
                  </div>
                  {activeTopicId === topic.id && <ChevronRight className="h-4 w-4 ml-auto" />}
               </button>
            ))}
         </div>

         <div className="bg-slate-900 rounded-[2rem] p-8 text-white text-center shadow-2xl relative overflow-hidden group">
             <Building2 className="absolute top-0 right-0 h-24 w-24 opacity-5 -rotate-12 translate-x-4 -translate-y-4 group-hover:rotate-0 transition-transform duration-700" />
             <Printer className="h-10 w-10 mx-auto mb-4 text-blue-400" />
             <h4 className="font-black text-sm uppercase tracking-widest">Hardware Support</h4>
             <p className="text-[10px] text-slate-400 mt-2 mb-6 font-medium leading-relaxed uppercase tracking-tighter">Ensure Zebra printers are on Port 9100. Contact system admin for ZPL calibration.</p>
             <button 
                onClick={() => setActiveTopicId('DEPLOYMENT')}
                className="w-full bg-white/10 border border-white/20 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
             >
                 System Deployment Guide
             </button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-10 h-fit min-h-[700px]">
          {activeContent ? (
              <div className="animate-fade-in">
                  <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100">
                      <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                          <activeContent.icon className="h-10 w-10" />
                      </div>
                      <div>
                          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{activeContent.title}</h2>
                          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">{activeContent.description}</p>
                      </div>
                  </div>
                  <div className="prose prose-slate max-w-none prose-h3:text-slate-800 prose-p:text-slate-600 prose-p:font-medium">
                      {activeContent.content}
                  </div>
              </div>
          ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-32">
                  <Bookmark className="h-20 w-20 mb-6 opacity-10" />
                  <p className="text-xl font-black uppercase tracking-tighter opacity-20">Select a handbook chapter</p>
              </div>
          )}
      </div>

    </div>
  );
};

export default HelpGuide;
