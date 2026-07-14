import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ChevronLeft, ArrowRight, ShieldCheck, CheckCircle2, Clock, Activity, Stethoscope, Heart, FileText } from 'lucide-react';

export default function RecoveryReport() {
  const { id } = useParams();

  // Integrated Case Study Database matching SuccessStories entries
  const reports = {
    'max-labrador': {
      title: 'Midnight Emergency Foreign Body Swallowing Triage',
      petName: 'Max',
      species: 'Dog (Labrador Retriever)',
      age: '2 Years',
      owner: 'Mark Olsen',
      category: 'Emergency Triage',
      date: 'October 2024',
      img: '/images/golden-retriever.png',
      vet: 'Dr. Anjali Mehta',
      vetId: 'anjali-mehta',
      vetImg: '/images/dr-anjali.png',
      excerpt: 'Max swallowed a thick plastic bottle cap at midnight. Quick virtual diagnosis prevented emergency surgery.',
      symptoms: [
        'Acute ingestion of non-food plastic object (approx. 3.5cm diameter)',
        'Gagging, pacing, and mild drooling distress',
        'Abdominal tenderness upon light palpation'
      ],
      timeline: [
        { time: '12:05 AM', title: 'Foreign Object Ingestion', desc: 'Max swallowed the plastic bottle cap during unsupervised play.' },
        { time: '12:12 AM', title: 'Virtual Triage Initiated', desc: 'Owner connected via Anitalk secure portal. Clinic panel assigned Dr. Anjali Mehta within 45 seconds.' },
        { time: '12:18 AM', title: 'Physical Evaluation via Video', desc: 'Dr. Mehta assessed airway clearance, gum color, and abdominal swelling over HD video stream.' },
        { time: '12:25 AM', title: 'Safe Inducement & Monitoring Plan', desc: 'Guided owner through hydration steps and feeding small amounts of bread to buffer the stomach liner, avoiding costly night surgeries.' },
        { time: '08:00 AM', title: 'Successful Passage & Follow-up', desc: 'Object passed naturally. Follow-up diagnostic scan confirmed zero gastrointestinal tears.' }
      ],
      diagnosis: 'Acute gastrointestinal foreign body threat. Preventative buffering clinical plan was deployed. Surgical intervention avoided.',
      dietPlan: 'High-fiber diet buffer for 48 hours, strict soft-toy restrictions, and follow-up hydration tracking.'
    },
    'luna-cat': {
      title: 'Reversing Chronic Hypersensitivity Dermatitis Scales',
      petName: 'Luna',
      species: 'Cat (Persian)',
      age: '4 Years',
      owner: 'Sarah Jenkins',
      category: 'Dermatology',
      date: 'August 2024',
      img: '/images/siamese-cat.png',
      vet: 'Dr. Sarah Jenkins',
      vetId: 'sarah-jenkins',
      vetImg: 'https://images.unsplash.com/photo-1594824813573-246434e33963?q=80&w=400',
      excerpt: 'Luna had suffered from chronic skin scale dermatitis for over 8 months. Our custom allergy food plans cured the constant itching entirely.',
      symptoms: [
        'Chronic scaling and redness across tail base and neck area',
        'Hair loss (alopecia) from obsessive self-grooming',
        'Severe skin itching and inflammation triggers'
      ],
      timeline: [
        { time: 'Month 1', title: 'Initial Consultation', desc: 'Reviewed previous treatment failure records. Pinpointed dietary starch allergens.' },
        { time: 'Week 2', title: 'Strict Elimination Protocol', desc: 'Removed chicken and corn by-products. Introduced hydrolyzed single-protein venison meals.' },
        { time: 'Week 4', title: 'Skin Barrier Strengthening', desc: 'Prescribed daily omega-3 fish oil supplements and gentle oat baths.' },
        { time: 'Month 2', title: 'Scaling Reduction', desc: 'Inflammation dropped by 75%. Hair began growing back in patches.' },
        { time: 'Month 3', title: 'Full Resolution achieved', desc: 'Dermatitis scales resolved. Luna has a full, shiny coat with zero itch occurrences.' }
      ],
      diagnosis: 'Chronic dietary-induced hypersensitivity dermatitis. Cured via targeted diet elimination and omega skin barrier lipids.',
      dietPlan: 'Hydrolyzed single-protein diet, strict avoidance of grains, poultry fats, and custom omega-3 dosage.'
    },
    'budgie-parrot': {
      title: 'Managing Severe Avian Travel Panic Syndrome',
      petName: 'Budgie',
      species: 'Bird (Budgerigar)',
      age: '1 Year',
      owner: 'Elena Rossi',
      category: 'Behavioral Guidance',
      date: 'September 2024',
      img: '/images/parrot.png',
      vet: 'Dr. Vivek Patel',
      vetId: 'vivek-patel',
      vetImg: '/images/dr-marcus.png',
      excerpt: 'Budgie exhibited high travel panic stress. An online triage consult provided guidance tips on cage layouts and hydration schedules.',
      symptoms: [
        'Obsessive feather plucking and pacing in travel cage',
        'Hyperventilation (open-mouth breathing) during transit',
        'Refusal of water and seeds, leading to hydration drops'
      ],
      timeline: [
        { time: 'Day 1', title: 'Behavioral Consultation', desc: 'Dr. Vivek Patel analyzed travel layouts. Noted that direct sunlight exposure triggered panic.' },
        { time: 'Day 3', title: 'Cage Layout Tweaks', desc: 'Implemented travel covers, dark corner buffers, and soft horizontal perches for stabilizers.' },
        { time: 'Day 5', title: 'Hydration and Stress Blocks', desc: 'Introduced electrolyte water sprays and soothing herbal ambient sprays.' },
        { time: 'Day 7', title: 'Trial Transit Runs', desc: 'Conducted short 10-minute trips. Budgie remained calm, feed intake remained normal.' },
        { time: 'Week 2', title: 'Long Distance Journey success', desc: 'Owner completed a 4-hour travel route with zero panics or feather plucking.' }
      ],
      diagnosis: 'Travel-induced panic syndrome in small psittacines. Managed via light filtering layouts and electrolyte hydration sprays.',
      dietPlan: 'High-energy millet treats during transit, electrolyte-fortified hydration water, and chamomile sprays.'
    },
    'bella-dog': {
      title: 'Post-Operative Orthopedic Rehabilitation Care',
      petName: 'Bella',
      species: 'Dog (Golden Retriever)',
      age: '6 Years',
      owner: 'David Chen',
      category: 'Physiotherapy',
      date: 'July 2024',
      img: '/images/collie-yellow.png',
      vet: 'Dr. David Chen',
      vetId: 'david-chen',
      vetImg: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400',
      excerpt: 'Bella had joint blocks and post-operative recovery stress. We mapped custom physical schedules that helped her stand again.',
      symptoms: [
        'Post-op muscle atrophy in right hind leg',
        'Reluctance to put weight on joint block area',
        'Mild stiffness and pain flare-ups'
      ],
      timeline: [
        { time: 'Week 1', title: 'Rehab Planning Consult', desc: 'Dr. David Chen mapped safe range-of-motion ranges. Assessed scar tissue healing.' },
        { time: 'Week 2', title: 'Passive Mobilization', desc: 'Owner performed daily passive joint rotations and warm thermal pack rubs.' },
        { time: 'Week 4', title: 'Assisted Walking Blocks', desc: 'Utilized support slings for weight distribution. Conducted slow walking drills.' },
        { time: 'Week 8', title: 'Active Muscle Loading', desc: 'Introduced incline walks and soft balance pad exercises to restore muscle mass.' },
        { time: 'Month 3', title: 'Full Stand & Running', desc: 'Bella regained 95% muscle strength and can run without assistance or pain.' }
      ],
      diagnosis: 'Post-operative quadriceps contracture and muscle atrophy. Treated via structured passive mobilization and active loading.',
      dietPlan: 'Glucosamine & chondroitin joint supplements, high-protein muscle rebuilding blocks, and caloric balance controls.'
    }
  };

  const caseStudy = reports[id];

  if (!caseStudy) {
    return (
      <div className="pt-32 pb-20 px-4 text-center max-w-md mx-auto flex flex-col gap-6 items-center">
        <FileText className="w-16 h-16 text-slate-300" />
        <h2 className="text-2xl font-extrabold text-slate-800">Case Study Not Found</h2>
        <p className="text-slate-500 text-sm">We couldn't retrieve the clinical details for this specific patient story.</p>
        <Link to="/success-stories" className="bg-slate-900 text-white font-extrabold text-xs py-3.5 px-6 rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
          Return to Success Stories
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-[1280px] mx-auto flex flex-col gap-8">
      
      {/* Back navigation */}
      <div>
        <Link 
          to="/success-stories" 
          className="inline-flex items-center gap-1.5 text-xs font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Success Stories
        </Link>
      </div>

      {/* Case Header Details */}
      <div className="flex flex-col gap-3 max-w-4xl">
        <div className="flex items-center gap-2">
          <span className="bg-rose-50 border border-rose-100 text-rose-600 text-[0.65rem] font-bold uppercase rounded-md px-2.5 py-1 tracking-wider shadow-sm">
            {caseStudy.category}
          </span>
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Case File: #{id}
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
          {caseStudy.title}
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-medium">
          Recovery Chronicle published in {caseStudy.date} · Verified clinical treatment
        </p>
      </div>

      {/* ==========================================
         TWO-COLUMN REPORT LAYOUT
         ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: Report Details */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Clinical Symptoms Section */}
          <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100">
            <h3 className="border-l-4 border-rose-500 pl-3 font-extrabold text-lg text-slate-800 mb-5 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500" /> Initial Symptoms & Triage Check
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Prior to connecting with our clinician panel, the patient exhibited the following diagnostic flags:
            </p>
            <div className="flex flex-col gap-3">
              {caseStudy.symptoms.map((symptom, i) => (
                <div key={i} className="flex gap-3 items-start p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{symptom}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Treatment Timeline Section */}
          <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100">
            <h3 className="border-l-4 border-rose-500 pl-3 font-extrabold text-lg text-slate-800 mb-8 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" /> Treatment Timeline
            </h3>
            
            {/* Visual Timeline Nodes */}
            <div className="relative border-l border-slate-200 ml-3 pl-8 flex flex-col gap-8">
              {caseStudy.timeline.map((item, i) => (
                <div key={i} className="relative">
                  {/* Timeline indicator node */}
                  <span className="absolute -left-[41px] top-0.5 w-6 h-6 rounded-full bg-rose-50 border-4 border-rose-500 flex items-center justify-center shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  </span>
                  
                  {/* Timeline Content */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-rose-500 font-extrabold text-xs uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        {item.time}
                      </span>
                      <h4 className="font-extrabold text-slate-800 text-sm md:text-base leading-tight">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-slate-500 text-xs md:text-sm leading-relaxed mt-2 pl-1">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnosis & Care Plan */}
          <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col gap-6">
            <div>
              <h3 className="border-l-4 border-rose-500 pl-3 font-extrabold text-lg text-slate-800 mb-4 tracking-tight flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-rose-500" /> Final Diagnosis Note
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold italic pl-1">
                "{caseStudy.diagnosis}"
              </p>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="border-l-4 border-rose-500 pl-3 font-extrabold text-lg text-slate-800 mb-4 tracking-tight flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> Post-Recovery Diet & Wellness Plan
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed pl-1">
                {caseStudy.dietPlan}
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Patient Summary & Vet Profile */}
        <div className="flex flex-col gap-6">
          
          {/* Patient Card */}
          <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col gap-4">
            <h4 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider">
              Patient File
            </h4>
            <div className="w-full h-44 rounded-2xl overflow-hidden relative shrink-0 shadow-sm border border-slate-100">
              <img 
                src={caseStudy.img} 
                alt={caseStudy.petName} 
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-emerald-500 text-white font-bold text-[0.65rem] px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
                Recovered
              </span>
            </div>
            
            {/* Spec details grid */}
            <div className="flex flex-col gap-3.5 border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Pet Name</span>
                <span className="font-extrabold text-slate-700">{caseStudy.petName}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Breed Focus</span>
                <span className="font-extrabold text-slate-700">{caseStudy.species}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Pet Age</span>
                <span className="font-extrabold text-slate-700">{caseStudy.age}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Owner</span>
                <span className="font-extrabold text-slate-700">{caseStudy.owner}</span>
              </div>
            </div>
          </div>

          {/* Assigned Practitioner Profile Card */}
          <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col gap-4">
            <h4 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider">
              Lead Practitioner
            </h4>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-100 shadow-sm shrink-0">
                <img 
                  src={caseStudy.vetImg} 
                  alt={caseStudy.vet} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400'; }}
                />
              </div>
              <div>
                <h5 className="font-extrabold text-slate-800 text-sm">{caseStudy.vet}</h5>
                <span className="text-rose-500 font-bold text-[0.7rem] uppercase tracking-wider">{caseStudy.category} Lead</span>
              </div>
            </div>
            <Link 
              to={`/doctors/${caseStudy.vetId}`} 
              className="w-full inline-flex items-center justify-center bg-slate-50 text-slate-800 font-extrabold text-xs py-3.5 px-4 rounded-xl border border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm text-center gap-1.5"
            >
              View Practitioner Profile <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Consult CTA Panel */}
          <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-lg border border-slate-800 flex flex-col gap-4 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
            
            <h4 className="font-extrabold text-xs text-rose-400 uppercase tracking-wider relative z-10">
              Emergency Clinical Panel
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed relative z-10">
              Experiencing a similar vet concern? Connect over chat or high-definition video slots with certified veterinarians instantly.
            </p>
            <Link 
              to="/doctors" 
              className="w-full inline-flex items-center justify-center bg-white text-slate-900 hover:bg-slate-100 font-black py-3.5 px-4 rounded-xl shadow-md transition-colors text-center text-xs gap-1.5 relative z-10"
            >
              Start Online Consult <ArrowRight className="w-3.5 h-3.5 text-rose-500" />
            </Link>
            <div className="flex items-center gap-1.5 justify-center text-[0.65rem] text-slate-400 relative z-10 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vetted Veterinarians Online</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
