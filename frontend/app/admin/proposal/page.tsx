"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGuard from "../../../components/AuthGuard";

const InputGroup = ({
  label,
  name,
  type = "text",
  required = false,
  placeholder = "",
  formData,
  onChange,
  hint = "",
}: any) => (
  <div className="mb-4">
    <label className="block text-sm font-bold text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {hint && <p className="text-xs text-gray-400 mb-1 italic">{hint}</p>}
    <input
      type={type}
      name={name}
      value={formData[name] || ""}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-[#b0413e] bg-white text-sm"
    />
  </div>
);

const TextAreaGroup = ({
  label,
  name,
  formData,
  onChange,
  rows = 3,
  hint = "",
  required = false,
}: any) => (
  <div className="mb-4">
    <label className="block text-sm font-bold text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {hint && <p className="text-xs text-gray-400 mb-1 italic">{hint}</p>}
    <textarea
      name={name}
      value={formData[name] || ""}
      onChange={onChange}
      rows={rows}
      required={required}
      className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-[#b0413e] bg-white text-sm"
    />
  </div>
);

export default function ProposalFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("id");
  const [userRole, setUserRole] = useState("USER");

  const initialFormState = {
    credentials_name: "",
    credentials_title: "",
    credentials_email: "",
    credentials_affiliation: "",
    credentials_address: "",
    credentials_phone: "",
    signatory_name: "",
    signatory_title: "",
    signatory_email: "",
    signatory_affiliation: "",
    signatory_address: "",
    event_name: "",
    acronym: "",
    past_editions: "",
    main_organizer: "",
    other_organizers: "",
    sponsors: "",
    conference_type: "",
    city: "",
    country: "",
    start_date: "",
    end_date: "",
    delivery_date: "",
    conference_website: "",
    past_websites: "",
    past_proceedings_links: "",
    indexes: "",
    audience_undergrad: false,
    audience_grad: false,
    audience_professional: false,
    audience_research: false,
    audience_popular: false,
    editor1_firstname: "",
    editor1_lastname: "",
    editor1_email: "",
    editor1_affiliation: "",
    editor1_corresponding: "",
    editor2_firstname: "",
    editor2_lastname: "",
    editor2_email: "",
    editor2_affiliation: "",
    editor2_corresponding: "",
    other_editors: "",
    reviewers_list: "",
    review_type: "",
    submission_management: "",
    reviewers_per_paper: "",
    expected_submissions: "",
    expected_accepted: "",
    estimated_pages: "",
    estimated_participants: "",
    geographic_dist: "",
    past_metrics: "",
    supplementary: "",
    topics_cfp: "",
    committee_names: "",
    keynote_info: "",
    print_ready: false,
    plagiarism_check: false,
    how_learn_ap: "",
    agreement_accepted: false,
    confirmation_correct: false,
  };

  const [formData, setFormData] = useState<any>(initialFormState);

  useEffect(() => {
    // Cek Role User
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role);
    }

    // TARIK DATA DRAFT JIKA ADA ID
    if (proposalId) {
      fetch(`http://localhost:3001/admin/proposals/${proposalId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.form_details) {
            setFormData(data.form_details);
          }
        })
        .catch((err) => console.error("Gagal menarik data draft", err));
    } else {
      setFormData(initialFormState); // Reset jika tidak ada ID
    }
  }, [proposalId]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (isSubmit: boolean) => {
    if (
      isSubmit &&
      (!formData.agreement_accepted || !formData.confirmation_correct)
    ) {
      alert("Please check the confirmation boxes at the bottom.");
      return;
    }

    const payload = {
      proposal_id: proposalId,
      organizer_name:
        formData.main_organizer || formData.credentials_name || "Unknown",
      event_name: formData.event_name,
      acronym: formData.acronym,
      delivery_date: formData.delivery_date,
      form_details: formData,
    };

    try {
      const endpoint = isSubmit
        ? "/admin/proposals/submit"
        : "/admin/proposals/draft";
      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        if (userRole === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/admin/proposal");
          setFormData(initialFormState);
        }
      } else {
        alert(`Gagal: ${result.message}`);
      }
    } catch (error) {
      alert("Gagal koneksi ke Backend (Port 3001)!");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white font-serif text-gray-800 pb-20">
        <nav className="flex justify-between items-center p-5 bg-gray-50 border-b border-gray-200 text-sm font-sans sticky top-0 z-10">
          <div className="font-bold text-[#b0413e] text-lg tracking-wider">
            PUBLISHER PORTAL
          </div>
          <div className="flex gap-10">
            {userRole === "ADMIN" && (
              <Link href="/admin" className="hover:text-black">
                Overview
              </Link>
            )}
            <Link
              href="/admin/proposal"
              className="font-bold border-b-2 border-[#b0413e]"
            >
              Proceedings proposal
            </Link>
            <button
              onClick={handleLogout}
              className="hover:text-black hover:underline"
            >
              Logout
            </button>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto p-10 font-sans">
          {/* LOGIC TOMBOL BACK/NEW PROPOSAL BERDASARKAN ROLE */}
          {userRole === "ADMIN" ? (
            <Link
              href="/admin"
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 mb-6 inline-block font-bold transition-colors"
            >
              ← Back to overview
            </Link>
          ) : (
            <button
              onClick={() => {
                router.push("/admin/proposal");
                setFormData(initialFormState);
              }}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 mb-6 inline-block font-bold transition-colors"
            >
              + Create New Proposal
            </button>
          )}

          <h1 className="text-3xl text-[#b0413e] mb-2 font-serif">
            Proceedings proposal
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            * Please note that all form fields are mandatory unless stated
            otherwise.
          </p>

          <div className="space-y-12">
            {/* 1. YOUR CREDENTIALS */}
            <section>
              <h2 className="text-xl font-bold text-[#b0413e] mb-4 border-b pb-2">
                Your Credentials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InputGroup
                  label="Full Name"
                  name="credentials_name"
                  formData={formData}
                  onChange={handleChange}
                  required
                />
                <InputGroup
                  label="Title"
                  name="credentials_title"
                  formData={formData}
                  onChange={handleChange}
                />
                <InputGroup
                  label="Email address"
                  name="credentials_email"
                  type="email"
                  hint="University or professional email required"
                  formData={formData}
                  onChange={handleChange}
                  required
                />
                <InputGroup
                  label="Phone number corresponding contact"
                  name="credentials_phone"
                  hint="Please don't use spaces or separators such as '-', '.' or '/'."
                  formData={formData}
                  onChange={handleChange}
                />
                <div className="col-span-2">
                  <InputGroup
                    label="Affiliation"
                    name="credentials_affiliation"
                    formData={formData}
                    onChange={handleChange}
                    required
                  />
                  <TextAreaGroup
                    label="Professional or university address"
                    name="credentials_address"
                    formData={formData}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            {/* 2. SIGNATORY CREDENTIALS */}
            <section>
              <h2 className="text-xl font-bold text-[#b0413e] mb-4 border-b pb-2">
                Credentials of the person authorised to sign the publishing
                agreement
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InputGroup
                  label="Full Name"
                  name="signatory_name"
                  formData={formData}
                  onChange={handleChange}
                />
                <InputGroup
                  label="Title"
                  name="signatory_title"
                  formData={formData}
                  onChange={handleChange}
                />
                <InputGroup
                  label="Email address"
                  name="signatory_email"
                  type="email"
                  hint="University or professional email required"
                  formData={formData}
                  onChange={handleChange}
                />
                <div className="col-span-2">
                  <InputGroup
                    label="Affiliation"
                    name="signatory_affiliation"
                    formData={formData}
                    onChange={handleChange}
                  />
                  <TextAreaGroup
                    label="Professional or university address"
                    name="signatory_address"
                    formData={formData}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            {/* 3. EVENT DETAILS */}
            <section>
              <h2 className="text-xl font-bold text-[#b0413e] mb-4 border-b pb-2">
                Event details
              </h2>
              <InputGroup
                label="Name of the event (in English)"
                name="event_name"
                formData={formData}
                onChange={handleChange}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <InputGroup
                  label="Acronym of the event (in English)"
                  name="acronym"
                  formData={formData}
                  onChange={handleChange}
                  required
                />
                <InputGroup
                  label="Number of past editions of the proceedings"
                  name="past_editions"
                  type="number"
                  formData={formData}
                  onChange={handleChange}
                />
              </div>

              <TextAreaGroup
                label="Main Organizer (University, Institute or Society)"
                hint="Please fill in name and full address"
                name="main_organizer"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Other Organizers (if applicable)"
                name="other_organizers"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Sponsors (if applicable)"
                name="sponsors"
                formData={formData}
                onChange={handleChange}
              />

              <div className="mt-4 mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Conference type
                </label>
                <select
                  name="conference_type"
                  value={formData.conference_type}
                  onChange={handleChange}
                  className="w-full border p-2 rounded text-sm bg-white"
                >
                  <option value="">Choose a value...</option>
                  <option value="In person">In person</option>
                  <option value="Online">Online</option>
                  <option value="In person & Online Hybrid">
                    In person & Online Hybrid
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputGroup
                  label="City"
                  name="city"
                  formData={formData}
                  onChange={handleChange}
                />
                <InputGroup
                  label="Country"
                  name="country"
                  hint="In case the conference is held virtually, please fill in the location of the main organizer."
                  formData={formData}
                  onChange={handleChange}
                />
                <InputGroup
                  label="Start date"
                  name="start_date"
                  type="date"
                  hint="Please use the YYYY-MM-DD format"
                  formData={formData}
                  onChange={handleChange}
                />
                <InputGroup
                  label="End date"
                  name="end_date"
                  type="date"
                  hint="Please use the YYYY-MM-DD format"
                  formData={formData}
                  onChange={handleChange}
                />
              </div>

              <InputGroup
                label="Expected delivery date of articles to Publisher"
                name="delivery_date"
                type="date"
                hint="You can communicate changes to the expected delivery date at any later stage via Email."
                formData={formData}
                onChange={handleChange}
                required
              />
              <InputGroup
                label="Conference website"
                name="conference_website"
                type="url"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Websites of the past editions (last 3-5 years, if applicable)"
                name="past_websites"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Web links to the proceedings of the past editions (last 3-5 years)"
                hint="If proceedings are not available online, please specify where they were published"
                name="past_proceedings_links"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Indexes: in which indexes have the proceedings of the past editions been indexed?"
                hint="Please provide links"
                name="indexes"
                formData={formData}
                onChange={handleChange}
              />
            </section>

            {/* 4. AUDIENCE */}
            <section>
              <h2 className="text-xl font-bold text-[#b0413e] mb-4 border-b pb-2">
                Audience
              </h2>
              <p className="text-sm font-bold mb-2">
                For whom is the conference intended? Please indicate content
                level:
              </p>
              <div className="space-y-2">
                {[
                  { label: "Undergraduate", name: "audience_undergrad" },
                  { label: "Graduate", name: "audience_grad" },
                  {
                    label: "Professional/practitioner",
                    name: "audience_professional",
                  },
                  { label: "Research", name: "audience_research" },
                  { label: "Popular/general", name: "audience_popular" },
                ].map((item) => (
                  <label
                    key={item.name}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      name={item.name}
                      checked={formData[item.name] || false}
                      onChange={handleChange}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </section>

            {/* 5. EDITORS AND REVIEW */}
            <section>
              <h2 className="text-xl font-bold text-[#b0413e] mb-4 border-b pb-2">
                Editors and review
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Names of the proceedings editor(s), i.e., those ultimately
                responsible for the contents of the proceedings, whose names are
                to appear on the portal and cover of the proceedings volume as
                Editors:
              </p>

              <h3 className="font-bold text-sm mb-2 text-[#b0413e]">
                Editor 1
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup
                  label="First Name"
                  name="editor1_firstname"
                  formData={formData}
                  onChange={handleChange}
                />
                <InputGroup
                  label="Last Name"
                  name="editor1_lastname"
                  formData={formData}
                  onChange={handleChange}
                />
              </div>
              <InputGroup
                label="Email address (university or professional email required)"
                hint="University or professional email required"
                name="editor1_email"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Full Affiliation: (Institution, Department, City, Postal Code, Country)"
                name="editor1_affiliation"
                formData={formData}
                onChange={handleChange}
              />

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Is Corresponding? (Yes or No)
                </label>
                <select
                  name="editor1_corresponding"
                  value={formData.editor1_corresponding}
                  onChange={handleChange}
                  className="w-full border p-2 rounded text-sm bg-white"
                >
                  <option value="">Choose...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <h3 className="font-bold text-sm mb-2 text-[#b0413e] border-t pt-4">
                Editor 2
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup
                  label="First Name"
                  name="editor2_firstname"
                  formData={formData}
                  onChange={handleChange}
                />
                <InputGroup
                  label="Last Name"
                  name="editor2_lastname"
                  formData={formData}
                  onChange={handleChange}
                />
              </div>
              <InputGroup
                label="Email address (university or professional email required)"
                hint="University or professional email required"
                name="editor2_email"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Full Affiliation: (Institution, Department, City, Postal Code, Country)"
                name="editor2_affiliation"
                formData={formData}
                onChange={handleChange}
              />

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Is Corresponding? (Yes or No)
                </label>
                <select
                  name="editor2_corresponding"
                  value={formData.editor2_corresponding}
                  onChange={handleChange}
                  className="w-full border p-2 rounded text-sm bg-white"
                >
                  <option value="">Choose...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <h3 className="font-bold text-sm mb-2 text-[#b0413e] border-t pt-4">
                Other editors (if any)
              </h3>
              <TextAreaGroup
                label=""
                hint="Information of other editors if there are more than two editors. Please provide the required information as the above."
                name="other_editors"
                formData={formData}
                onChange={handleChange}
              />

              <h3 className="font-bold text-sm mb-2 text-[#b0413e] border-t pt-4">
                Reviewers
              </h3>
              <TextAreaGroup
                label=""
                hint="Full Name, title, email address (university or professional email required), affiliation and full address of at least three senior person(s) responsible for the review process of the conference (who can be contacted by us)."
                name="reviewers_list"
                formData={formData}
                onChange={handleChange}
              />

              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Type of review:
                </label>
                <select
                  name="review_type"
                  value={formData.review_type}
                  onChange={handleChange}
                  className="w-full border p-2 rounded text-sm bg-white"
                >
                  <option value="">Choose a value...</option>
                  <option value="Main editor peer review">
                    Main editor peer review
                  </option>
                  <option value="Open peer review">Open peer review</option>
                  <option value="Single-blind peer review">
                    Single-blind peer review
                  </option>
                  <option value="Double-blind peer review">
                    Double-blind peer review
                  </option>
                  <option value="Other:">Other:</option>
                </select>
              </div>
            </section>

            {/* 6. PAPER SELECTION */}
            <section>
              <h2 className="text-xl font-bold text-[#b0413e] mb-4 border-b pb-2">
                Paper selection
              </h2>
              <TextAreaGroup
                label="How do you collect and manage new submissions? E.g., by email, or online editorial system etc."
                hint="If you are using online editorial system such as Easy Chair, Meteor, Scholar One etc., please indicate which one you are using to go through full-paper peer review process."
                name="submission_management"
                formData={formData}
                onChange={handleChange}
              />
              <InputGroup
                label="By how many reviewers will each paper be reviewed?"
                name="reviewers_per_paper"
                formData={formData}
                onChange={handleChange}
              />
              <InputGroup
                label="Expected number of paper submissions"
                name="expected_submissions"
                type="number"
                formData={formData}
                onChange={handleChange}
              />
              <InputGroup
                label="Estimated minimum number of accepted papers"
                name="expected_accepted"
                type="number"
                formData={formData}
                onChange={handleChange}
              />
              <InputGroup
                label="Estimated page number for the proceedings (where a page contains some 400 words)"
                name="estimated_pages"
                type="number"
                formData={formData}
                onChange={handleChange}
              />
              <InputGroup
                label="Estimated number of participants of the conference"
                name="estimated_participants"
                type="number"
                formData={formData}
                onChange={handleChange}
              />
              <InputGroup
                label="Expected geographic distribution of participants of the conference"
                name="geographic_dist"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Number of submissions, acceptance rate, estimated number of participants for several past editions (if applicable)"
                name="past_metrics"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Please indicate any supplementary materials or data you plan to include: (e.g., software, online files, delicate websites, solution manual etc.)"
                name="supplementary"
                formData={formData}
                onChange={handleChange}
              />
            </section>

            {/* 7. SCOPE AND PC */}
            <section>
              <h2 className="text-xl font-bold text-[#b0413e] mb-4 border-b pb-2">
                Scope and PC
              </h2>
              <TextAreaGroup
                label="Topics/link to CFP"
                name="topics_cfp"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Names and affiliations of people in the organizing and technical/scientific committee"
                hint="General chairs, program chairs, technical/scientific committee members, etc"
                name="committee_names"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Brief introduction keynote speakers (mandatory) and keynote speeches (if applicable)"
                name="keynote_info"
                formData={formData}
                onChange={handleChange}
                required
              />
            </section>

            {/* 8. PRINT VERSION & PLAGIARISM */}
            <section>
              <h2 className="text-xl font-bold text-[#b0413e] mb-4 border-b pb-2">
                Print version (optional)
              </h2>
              <p className="text-sm font-bold mb-2">
                Do you wish to receive print-ready files?
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Print-ready files: Publisher is able to provide a e-printable
                file of the whole proceedings books with Rights & Permission all
                cleared allowing conference organizers to print it with a local
                printer. (Cost: 1,000 euro).
              </p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="print_ready"
                  checked={formData.print_ready || false}
                  onChange={handleChange}
                  className="mt-1"
                />
                <span className="text-sm">
                  Yes, I want to receive print-ready files (including a table of
                  contents and print ISBN) which you can then have printed by a
                  local printing service.
                </span>
              </label>

              <h2 className="text-xl font-bold text-[#b0413e] mb-4 border-b pb-2 mt-8">
                Pre-review plagiarism check (optional)
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                Publisher also provides a service allowing proceedings
                organizers to check the submitted papers on plagiarism before
                they are reviewed by your experts. This way, organizers can
                avoid reviewing papers that would have been rejected for
                plagiarism anyway and also to pay 50% of the publication fee for
                these rejected papers. (Costs: 100 euro set up fee + 5
                euro/paper).
              </p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="plagiarism_check"
                  checked={formData.plagiarism_check || false}
                  onChange={handleChange}
                  className="mt-1"
                />
                <span className="text-sm">
                  Yes, I would like Publisher to perform a pre-review plagiarism
                  check.
                </span>
              </label>
            </section>

            {/* 9. VARIOUS */}
            <section>
              <h2 className="text-xl font-bold text-[#b0413e] mb-4 border-b pb-2">
                Various
              </h2>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                How did you learn of this Portal?
              </label>
              <select
                name="how_learn_ap"
                value={formData.how_learn_ap}
                onChange={handleChange}
                className="w-full border p-2 rounded text-sm bg-white"
              >
                <option value="">Choose a value</option>
                <option value="Past collaboration">
                  Past collaboration: please mention the name of the
                  publication(s)
                </option>
                <option value="Advertisement">Advertisement</option>
                <option value="From publisher editor">
                  From publisher editor: please give the name
                </option>
                <option value="Internet search">
                  Internet search: please provide keywords you used
                </option>
                <option value="From colleagues / peers">
                  From colleagues / peers: please give his/her name
                </option>
                <option value="From publisher website">
                  From publisher website
                </option>
                <option value="Other">Other:</option>
              </select>
            </section>

            {/* 10. CONFIRMATION */}
            <section className="bg-gray-50 p-6 border rounded space-y-4">
              <h2 className="text-xl font-bold text-[#b0413e] border-b pb-2">
                Confirmation
              </h2>
              <label className="flex gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreement_accepted"
                  checked={formData.agreement_accepted || false}
                  onChange={handleChange}
                  className="mt-1 flex-shrink-0"
                />
                <span className="text-sm text-gray-600">
                  Yes, I accept that the content of these proceedings will be
                  distributed under the terms of the Creative Commons
                  Attribution License 4.0, which permits non-commercial use,
                  distribution and reproduction in any medium, provided the
                  original work is properly cited. See for details:
                  https://creativecommons.org/licenses/by-nc/4.0/
                </span>
              </label>
              <p className="text-sm text-gray-600 ml-6">
                Please note that all proceedings articles on the Publisher
                platform are “gold” open access and therefore freely available
                in perpetuity from the moment of publication with a Creative
                Commons Attribution License 4.0 attached. Under this model we
                will charge the organizer for the cost of publishing, which is
                usually covered by the organizers’ institution/society or
                research funders, conference registration fee, etc.
              </p>
              <label className="flex gap-3 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  name="confirmation_correct"
                  checked={formData.confirmation_correct || false}
                  onChange={handleChange}
                  className="mt-1 flex-shrink-0"
                />
                <span className="text-sm text-gray-600">
                  Hereby I confirm that all information provided in this
                  proposal form is correct. I also confirm that the event
                  mentioned in this proposal form will be a real conference or
                  workshop where researchers will meet and discuss their work
                  and that all the papers of the proceedings will go through
                  rigorous peer review process before being sent to the
                  Publisher and that the volume editors will follow the Code of
                  Conduct.
                </span>
              </label>
            </section>

            {/* BUTTONS */}
            <div className="flex justify-end gap-4 border-t pt-8">
              <button
                onClick={() => handleSave(false)}
                className="px-8 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 font-bold shadow-sm transition-colors"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                className="px-8 py-2 bg-[#b0413e] text-white rounded hover:bg-[#8e3431] font-bold shadow-md transition-colors"
              >
                Submit proposal
              </button>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
