import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { 
  ChevronRight, User, MapPin, 
  Briefcase, GraduationCap, Users, Share2, 
  Settings, CheckCircle, ListChecks,
  Upload, FileText, X, Sparkles, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateApplicant } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Contact", icon: MapPin },
  { id: 3, title: "Skills", icon: ListChecks },
  { id: 4, title: "Employment", icon: Briefcase },
  { id: 5, title: "Certificates", icon: GraduationCap },
  { id: 6, title: "References", icon: Users },
  { id: 7, title: "Social Links", icon: Share2 },
  { id: 8, title: "Preferences", icon: Settings },
];

export default function ApplicationFlow() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: createApplicant } = useCreateApplicant();

  // Unified State
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", middleName: "", suffix: "", pronoun: "", nickname: "",
    permanentAddress: "", currentAddress: "", sameAsPermanent: false,
    phoneAreaCode: "+1", phoneNumber: "", homePhone: "", email: "",
    skills: [] as string[],
    employmentHistory: [] as any[],
    certificates: [] as any[],
    references: [] as any[],
    facebookUrl: "", linkedinUrl: "",
    expectedSalary: "", salaryNegotiable: true, availabilityDate: "",
    status: "pending" as const
  });

  const [resumeUploaderOpen, setResumeUploaderOpen] = useState(true);
  const [resumeParsed, setResumeParsed] = useState(false);

  const handleResumeData = (parsed: Record<string, any>) => {
    setFormData(prev => ({
      ...prev,
      ...(parsed.firstName    && { firstName: parsed.firstName }),
      ...(parsed.lastName     && { lastName: parsed.lastName }),
      ...(parsed.middleName   && { middleName: parsed.middleName }),
      ...(parsed.suffix       && { suffix: parsed.suffix }),
      ...(parsed.nickname     && { nickname: parsed.nickname }),
      ...(parsed.pronoun      && { pronoun: parsed.pronoun }),
      ...(parsed.email        && { email: parsed.email }),
      ...(parsed.phoneAreaCode && { phoneAreaCode: parsed.phoneAreaCode }),
      ...(parsed.phoneNumber  && { phoneNumber: parsed.phoneNumber }),
      ...(parsed.permanentAddress && { permanentAddress: parsed.permanentAddress }),
      ...(parsed.currentAddress   && { currentAddress: parsed.currentAddress }),
      ...(parsed.facebookUrl  && { facebookUrl: parsed.facebookUrl }),
      ...(parsed.linkedinUrl  && { linkedinUrl: parsed.linkedinUrl }),
      ...(parsed.expectedSalary   && { expectedSalary: parsed.expectedSalary }),
      ...(parsed.availabilityDate && { availabilityDate: parsed.availabilityDate }),
      salaryNegotiable: parsed.salaryNegotiable !== false,
      ...(Array.isArray(parsed.skills) && parsed.skills.length > 0 && { skills: parsed.skills }),
      ...(Array.isArray(parsed.employmentHistory) && parsed.employmentHistory.length > 0 && { employmentHistory: parsed.employmentHistory }),
      ...(Array.isArray(parsed.certificates) && parsed.certificates.length > 0 && { certificates: parsed.certificates }),
    }));
    setResumeParsed(true);
    setResumeUploaderOpen(false);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const applicant = await createApplicant({ data: formData as any });
      // Persist applicant ID so the Assessment page can use it
      localStorage.setItem("sm_applicant_id", String(applicant.id));
      toast({ title: "Profile Created!", description: "Next — complete your assessments to boost your match score." });
      setLocation("/assessment");

    } catch (error: any) {
      console.error(error);
      toast({ title: "Submission Failed", description: error.message || "Please check required fields.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <StepPersonalInfo data={formData} update={updateField} />;
      case 2: return <StepContactInfo data={formData} update={updateField} />;
      case 3: return <StepSkills data={formData} update={updateField} />;
      case 4: return <StepEmployment data={formData} update={updateField} />;
      case 5: return <StepCertificates data={formData} update={updateField} />;
      case 6: return <StepReferences data={formData} update={updateField} />;
      case 7: return <StepSocial data={formData} update={updateField} />;
      case 8: return <StepPreferences data={formData} update={updateField} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 flex gap-8">
        
        {/* Sidebar Steps Indicator */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-28 bg-white rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-display font-bold text-lg text-primary mb-6">Application Progress</h3>
            <div className="space-y-4">
              {STEPS.map((step) => {
                const isActive = step.id === currentStep;
                const isPast = step.id < currentStep;
                return (
                  <div key={step.id} className="flex items-center gap-4">
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                      isActive ? "border-accent bg-accent/10 text-accent" : 
                      isPast ? "border-accent bg-accent text-white" : 
                      "border-slate-200 bg-slate-50 text-slate-400"
                    )}>
                      {isPast ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <span className={cn(
                      "font-medium text-sm transition-colors",
                      isActive ? "text-primary" : isPast ? "text-slate-700" : "text-slate-400"
                    )}>
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Form Content */}
        <div className="flex-1 w-full max-w-3xl space-y-4">

          {/* Resume Upload Banner */}
          <AnimatePresence>
            {resumeUploaderOpen && !resumeParsed && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <ResumeUploader
                  onData={handleResumeData}
                  onDismiss={() => setResumeUploaderOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resume Parsed Success Pill */}
          {resumeParsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium"
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              Resume auto-filled — review each step and make any adjustments.
              <button onClick={() => setResumeUploaderOpen(true)} className="ml-auto text-green-600 hover:underline text-xs">
                Upload different file
              </button>
            </motion.div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col min-h-[600px]">
            
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-2xl font-bold text-primary font-display flex items-center gap-3">
                {STEPS[currentStep - 1].title}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">Step {currentStep} of {STEPS.length}</p>
            </div>

            <div className="p-8 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-6 border-t border-border bg-slate-50 flex justify-between items-center mt-auto">
              <button
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
                className="px-6 py-2.5 font-medium rounded-xl text-slate-600 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-0 transition-colors"
              >
                Back
              </button>
              
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : currentStep === STEPS.length ? "Complete Profile" : "Continue"}
                {!isSubmitting && currentStep < STEPS.length && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>  {/* end main form column */}
      </main>
    </div>
  );
}

// ─── RESUME UPLOADER COMPONENT ────────────────────────────────────────────────

function ResumeUploader({ onData, onDismiss }: { onData: (d: Record<string, any>) => void; onDismiss: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setError(null);
    setIsParsing(true);
    try {
      const form = new FormData();
      form.append("resume", file);
      const res = await fetch("/api/resume/parse", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Parsing failed");
      onData(json.data);
    } catch (err: any) {
      setError(err.message || "Could not parse the file. Please try again.");
      setIsParsing(false);
    }
  }, [onData]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="bg-white rounded-2xl border border-accent/30 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-accent/5 to-primary/5 border-b border-accent/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="font-semibold text-sm text-primary">Auto-fill from Resume</p>
            <p className="text-xs text-slate-500">Upload your CV and we'll fill in the details for you</p>
          </div>
        </div>
        <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5">
        {isParsing ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-primary">Analysing your resume…</p>
              <p className="text-xs text-slate-500 mt-0.5">{fileName}</p>
            </div>
          </div>
        ) : (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                isDragging
                  ? "border-accent bg-accent/5 scale-[1.01]"
                  : "border-slate-200 hover:border-accent/50 hover:bg-slate-50"
              )}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">
                  {isDragging ? "Drop to upload" : "Drag & drop or click to browse"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">PDF, Word (.docx / .doc), or plain text — up to 10MB</p>
              </div>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="hidden"
              onChange={onFileChange}
            />

            {error && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠</span> {error}
              </p>
            )}

            <p className="mt-3 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <FileText className="w-3 h-3" /> Fields will be pre-filled — you can review and edit them on each step.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS FOR STEPS ---

function Input({ label, ...props }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <input 
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-shadow text-slate-900 placeholder:text-slate-400"
        {...props}
      />
    </div>
  );
}

function Select({ label, options, ...props }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <select 
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-shadow text-slate-900"
        {...props}
      >
        <option value="">Select option...</option>
        {options.map((o:any) => <option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  );
}

function StepPersonalInfo({ data, update }: any) {
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <Input label="First Name *" required value={data.firstName} onChange={(e:any)=>update('firstName', e.target.value)} />
      <Input label="Last Name *" required value={data.lastName} onChange={(e:any)=>update('lastName', e.target.value)} />
      <Input label="Middle Name" value={data.middleName} onChange={(e:any)=>update('middleName', e.target.value)} />
      <Input label="Suffix (e.g. Jr, III)" value={data.suffix} onChange={(e:any)=>update('suffix', e.target.value)} />
      <Input label="Nickname" value={data.nickname} onChange={(e:any)=>update('nickname', e.target.value)} />
      <Select 
        label="Pronouns" 
        options={['He/Him', 'She/Her', 'They/Them', 'Prefer not to say']}
        value={data.pronoun} 
        onChange={(e:any)=>update('pronoun', e.target.value)} 
      />
    </div>
  );
}

function StepContactInfo({ data, update }: any) {
  return (
    <div className="space-y-6">
      <Input label="Permanent Address *" value={data.permanentAddress} onChange={(e:any)=>update('permanentAddress', e.target.value)} />
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="same" 
            className="rounded text-accent focus:ring-accent w-4 h-4"
            checked={data.sameAsPermanent}
            onChange={(e:any)=> {
              update('sameAsPermanent', e.target.checked);
              if(e.target.checked) update('currentAddress', data.permanentAddress);
            }}
          />
          <label htmlFor="same" className="text-sm text-slate-600">Current address is same as permanent</label>
        </div>
        {!data.sameAsPermanent && (
          <Input label="Current Address *" value={data.currentAddress} onChange={(e:any)=>update('currentAddress', e.target.value)} />
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Mobile Phone *</label>
          <div className="flex gap-2">
            <select className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-accent" value={data.phoneAreaCode} onChange={(e:any)=>update('phoneAreaCode', e.target.value)}>
              <option value="+1">+1 (US)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+63">+63 (PH)</option>
            </select>
            <input type="tel" className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-accent focus:border-accent" placeholder="Phone number" value={data.phoneNumber} onChange={(e:any)=>update('phoneNumber', e.target.value)} />
          </div>
        </div>
        <Input label="Home Phone" placeholder="N/A if none" value={data.homePhone} onChange={(e:any)=>update('homePhone', e.target.value)} />
        <div className="sm:col-span-2">
          <Input label="Email Address *" type="email" value={data.email} onChange={(e:any)=>update('email', e.target.value)} />
        </div>
      </div>
    </div>
  );
}

function StepSkills({ data, update }: any) {
  const [input, setInput] = useState("");
  const addSkill = () => {
    if (input.trim() && data.skills.length < 5 && !data.skills.includes(input.trim())) {
      update('skills', [...data.skills, input.trim()]);
      setInput("");
    }
  };
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Add up to 5 top skills</label>
        <div className="flex gap-2">
          <input 
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-accent"
            placeholder="e.g. React, Project Management..."
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSkill()}
          />
          <button onClick={addSkill} className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-slate-200">Add</button>
        </div>
        <p className="text-xs text-muted-foreground">Press Enter or click Add.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {data.skills.map((skill:string) => (
          <div key={skill} className="px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm flex items-center gap-2 border border-accent/20">
            {skill}
            <button onClick={() => update('skills', data.skills.filter((s:string)=>s!==skill))} className="hover:text-primary">&times;</button>
          </div>
        ))}
        {data.skills.length === 0 && <span className="text-slate-400 text-sm">No skills added yet.</span>}
      </div>
    </div>
  );
}

function StepEmployment({ data, update }: any) {
  const addRecord = () => update('employmentHistory', [...data.employmentHistory, { companyName:'', position:'', yearsStayed:'', reasonForLeaving:'' }]);
  const updateRecord = (index: number, field: string, val: string) => {
    const arr = [...data.employmentHistory];
    arr[index][field] = val;
    update('employmentHistory', arr);
  };
  const removeRecord = (index: number) => update('employmentHistory', data.employmentHistory.filter((_:any,i:number)=>i!==index));

  return (
    <div className="space-y-6">
      {data.employmentHistory.map((emp:any, i:number) => (
        <div key={i} className="p-5 rounded-xl border border-slate-200 bg-white relative space-y-4">
          <button onClick={()=>removeRecord(i)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">&times;</button>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Company Name" value={emp.companyName} onChange={(e:any)=>updateRecord(i,'companyName',e.target.value)} />
            <Input label="Position / Title" value={emp.position} onChange={(e:any)=>updateRecord(i,'position',e.target.value)} />
            <Input label="Years Stayed (e.g. 2018-2022)" value={emp.yearsStayed} onChange={(e:any)=>updateRecord(i,'yearsStayed',e.target.value)} />
            <Select 
              label="Reason for Leaving" 
              options={['Career Growth', 'Better Opportunity', 'Company Closure', 'Relocation', 'Layoff/Redundancy', 'Other']}
              value={emp.reasonForLeaving} onChange={(e:any)=>updateRecord(i,'reasonForLeaving',e.target.value)} 
            />
          </div>
        </div>
      ))}
      <button onClick={addRecord} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-medium hover:border-accent hover:text-accent transition-colors">
        + Add Employment Record
      </button>
    </div>
  );
}

function StepCertificates({ data, update }: any) {
  // Similar to Employment, kept simple
  const addRecord = () => {
    if(data.certificates.length < 3) update('certificates', [...data.certificates, { name:'', issuingOrg:'', year:'' }]);
  }
  const updateRecord = (index: number, field: string, val: string) => {
    const arr = [...data.certificates];
    arr[index][field] = val;
    update('certificates', arr);
  };
  const removeRecord = (index: number) => update('certificates', data.certificates.filter((_:any,i:number)=>i!==index));

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">Add up to 3 relevant certificates or training completions.</p>
      {data.certificates.map((cert:any, i:number) => (
        <div key={i} className="p-5 rounded-xl border border-slate-200 bg-white relative grid sm:grid-cols-3 gap-4">
          <button onClick={()=>removeRecord(i)} className="absolute top-2 right-3 text-slate-400 hover:text-red-500 text-lg">&times;</button>
          <Input label="Name" value={cert.name} onChange={(e:any)=>updateRecord(i,'name',e.target.value)} />
          <Input label="Organization" value={cert.issuingOrg} onChange={(e:any)=>updateRecord(i,'issuingOrg',e.target.value)} />
          <Input label="Year" type="number" value={cert.year} onChange={(e:any)=>updateRecord(i,'year',e.target.value)} />
        </div>
      ))}
      {data.certificates.length < 3 && (
        <button onClick={addRecord} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-medium hover:border-accent hover:text-accent transition-colors">
          + Add Certificate
        </button>
      )}
    </div>
  );
}

function StepReferences({ data, update }: any) {
  const addRecord = () => update('references', [...data.references, { name:'', relationship:'', phone:'', email:'' }]);
  const updateRecord = (index: number, field: string, val: string) => {
    const arr = [...data.references];
    arr[index][field] = val;
    update('references', arr);
  };
  const removeRecord = (index: number) => update('references', data.references.filter((_:any,i:number)=>i!==index));

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">Provide at least 1 character reference.</p>
      {data.references.map((ref:any, i:number) => (
        <div key={i} className="p-5 rounded-xl border border-slate-200 bg-white relative grid sm:grid-cols-2 gap-4">
          <button onClick={()=>removeRecord(i)} className="absolute top-2 right-3 text-slate-400 hover:text-red-500 text-lg">&times;</button>
          <Input label="Full Name" value={ref.name} onChange={(e:any)=>updateRecord(i,'name',e.target.value)} />
          <Select label="Relationship" options={['Supervisor', 'Colleague', 'Client', 'Professor', 'Mentor']} value={ref.relationship} onChange={(e:any)=>updateRecord(i,'relationship',e.target.value)} />
          <Input label="Phone" value={ref.phone} onChange={(e:any)=>updateRecord(i,'phone',e.target.value)} />
          <Input label="Email" type="email" value={ref.email} onChange={(e:any)=>updateRecord(i,'email',e.target.value)} />
        </div>
      ))}
      {data.references.length < 3 && (
        <button onClick={addRecord} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-medium hover:border-accent hover:text-accent transition-colors">
          + Add Reference
        </button>
      )}
    </div>
  );
}

function StepSocial({ data, update }: any) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500 mb-4">Adding links to professional profiles increases visibility.</p>
      <Input label="LinkedIn Profile URL" type="url" placeholder="https://linkedin.com/in/..." value={data.linkedinUrl} onChange={(e:any)=>update('linkedinUrl', e.target.value)} />
      <Input label="Facebook Profile URL (Optional)" type="url" placeholder="https://facebook.com/..." value={data.facebookUrl} onChange={(e:any)=>update('facebookUrl', e.target.value)} />
    </div>
  );
}

function StepPreferences({ data, update }: any) {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <Input label="Expected Salary" type="text" placeholder="$60,000 / year" value={data.expectedSalary} onChange={(e:any)=>update('expectedSalary', e.target.value)} />
        
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Salary Negotiability</label>
          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={data.salaryNegotiable} onChange={()=>update('salaryNegotiable', true)} className="text-accent focus:ring-accent" />
              <span>Negotiable</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={!data.salaryNegotiable} onChange={()=>update('salaryNegotiable', false)} className="text-accent focus:ring-accent" />
              <span>Non-negotiable</span>
            </label>
          </div>
        </div>

        <div className="sm:col-span-2">
          <Input label="Date of Availability" type="date" value={data.availabilityDate} onChange={(e:any)=>update('availabilityDate', e.target.value)} />
        </div>
      </div>
    </div>
  );
}

