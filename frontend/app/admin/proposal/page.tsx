"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

// Komponen Kecil biar kodenya gak kepanjangan
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-bold text-[#b0413e] mb-4 border-b border-gray-200 pb-2 mt-10 font-serif">
    {children}
  </h2>
);

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-sm font-bold text-gray-700 mb-1">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

// --- MAIN PAGE COMPONENT ---
function ProposalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("id");

  const [formData, setFormData] = useState<any>({
    // Your Credentials
    credentials_name: "", credentials_title: "", credentials_email: "", credentials_affiliation: "", credentials_address: "", credentials_phone: "",
    // Event Details
    event_name: "", acronym: "", past_editions: "", main_organizer: "", other_organizers: "", sponsors: "",
    conference_type: "In person", city: "", country: "", start_date: "", end_date: "", delivery_date: "",
    conference_website: "", past_websites: "", past_proceedings_links: "", indexes: "",
    // Audience
    audience_undergrad: false, audience_grad: false, audience_professional: false, audience_research: false, audience_popular: false,
    // Editors
    editor1_name: "", editor1_email: "", editor1_affiliation: "", editor1_corresponding: "Yes",
    editor2_name: "", editor2_email: "", editor2_affiliation: "", editor2_corresponding: "No",
    other_editors: "",
    // Reviewers & Selection
    reviewers_info: "", review_type: "Double-blind peer review", paper_management: "", 
    reviewers_per_paper: "", expected_submissions: "", expected_accepted: "",
    estimated_pages: "", estimated_participants: "", geographic_dist: "", past_metrics: "",
    // Scope
    topics_link: "", committee_names: "", keynote_speakers: "",
    // Options
    print_ready: false, plagiarism_check: false, learn_from: "Internet search",
    agreement_accepted: false,
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (isSubmit: boolean) => {
    if (isSubmit && !formData.agreement_accepted) {
      alert("Please accept the agreement before submitting.");
      return;
    }

    const payload = {
      proposal_id: proposalId,
      organizer_name: formData.main_organizer || formData.credentials_name || "Unknown",
      event_name: formData.event_name,
      acronym: formData.acronym,
      delivery_date: formData.delivery_date,
      form_details: formData,
    };

    try {
      const endpoint = isSubmit ? "/admin/proposals/submit" : "/admin/proposals/draft";
      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(isSubmit ? "Proposal Submitted Successfully!" : "Draft Saved!");
        router.push("/admin");
      }
    } catch (error) {
      alert("Error connecting to server.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-4xl mx-auto p-10 font-sans shadow-sm">
        <button onClick={() => router.back()} className="text-sm text-[#b0413e] hover:underline mb-6">
          ← Back to overview
        </button>
        
        <h1 className="text-3xl text-[#b0413e] font-serif">Proceedings proposal</h1>
        <p className="text-xs text-gray-400 mt-2 italic">* Mandatory fields are marked with an asterisk.</p>

        <div className="mt-8 space-y-6">
          {/* SECTION 1: CREDENTIALS */}
          <SectionTitle>Your Credentials</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label required>Full Name</Label>
              <input type="text" name="credentials_name" value={formData.credentials_name} onChange={handleChange} className="w-full border p-2 rounded bg-gray-50" />
            </div>
            <div>
              <Label>Email Address</Label>
              <input type="email" name="credentials_email" value={formData.credentials_email} onChange={handleChange} className="w-full border p-2 rounded bg-gray-50" />
            </div>
          </div>

          {/* SECTION 2: EVENT DETAILS */}
          <SectionTitle>Event Details</SectionTitle>
          <div className="space-y-4">
            <div>
              <Label required>Name of the event (in English)</Label>
              <input type="text" name="event_name" value={formData.event_name} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Acronym</Label>
                <input type="text" name="acronym" value={formData.acronym} onChange={handleChange} className="w-full border p-2 rounded" />
              </div>
              <div>
                <Label>Conference Type</Label>
                <select name="conference_type" value={formData.conference_type} onChange={handleChange} className="w-full border p-2 rounded bg-white">
                  <option>In person</option>
                  <option>Online</option>
                  <option>Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: AUDIENCE */}
          <SectionTitle>Audience</SectionTitle>
          <p className="text-sm text-gray-600 mb-2">For whom is the conference intended?</p>
          <div className="grid grid-cols-2 gap-2">
            {['Undergraduate', 'Graduate', 'Professional', 'Research', 'Popular'].map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name={`audience_${item.toLowerCase()}`} checked={formData[`audience_${item.toLowerCase()}`]} onChange={handleChange} />
                {item}
              </label>
            ))}
          </div>

          {/* SECTION 4: REVIEWERS */}
          <SectionTitle>Reviewers & Selection</SectionTitle>
          <Label>List of Reviewers (Names & Affiliations)</Label>
          <textarea name="reviewers_info" rows={4} value={formData.reviewers_info} onChange={handleChange} className="w-full border p-2 rounded" placeholder="At least three senior persons..." />

          <div className="grid grid-cols-2 gap-4 mt-4">
             <div>
                <Label>Expected Submissions</Label>
                <input type="number" name="expected_submissions" value={formData.expected_submissions} onChange={handleChange} className="w-full border p-2 rounded" />
             </div>
             <div>
                <Label>Expected Accepted</Label>
                <input type="number" name="expected_accepted" value={formData.expected_accepted} onChange={handleChange} className="w-full border p-2 rounded" />
             </div>
          </div>

          {/* SECTION 5: CONFIRMATION */}
          <div className="mt-12 p-6 bg-red-50 border border-red-100 rounded">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="agreement_accepted" checked={formData.agreement_accepted} onChange={handleChange} className="mt-1 h-5 w-5 accent-[#b0413e]" />
              <span className="text-sm text-gray-700">
                I confirm that all information provided is correct and the event mentioned will follow the Code of Conduct.
              </span>
            </label>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="flex justify-end gap-4 pt-10 border-t mt-10">
            <button onClick={() => handleSave(false)} className="px-6 py-2 border border-gray-400 rounded hover:bg-gray-50 transition-colors">
              Save as Draft
            </button>
            <button onClick={() => handleSave(true)} className="px-6 py-2 bg-[#b0413e] text-white rounded hover:bg-[#8e3431] shadow-md transition-colors font-bold">
              Submit Proposal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Wrapper to handle Suspense (Needed for useSearchParams in Next.js)
export default function ProposalPageWrapper() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="p-20 text-center">Loading Form...</div>}>
        <ProposalForm />
      </Suspense>
    </AuthGuard>
  );
}