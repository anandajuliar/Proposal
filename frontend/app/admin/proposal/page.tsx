"use client";

import { useState, useEffect, Suspense } from "react";
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
  <div className="mb-5">
    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {hint && <p className="text-xs text-gray-400 mb-2 italic">{hint}</p>}
    <input
      type={type}
      name={name}
      value={formData[name] || ""}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full bg-[#f0f4f8] text-gray-800 placeholder-gray-400 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D24A46] transition-all text-sm"
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
  <div className="mb-5">
    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {hint && <p className="text-xs text-gray-400 mb-2 italic">{hint}</p>}
    <textarea
      name={name}
      value={formData[name] || ""}
      onChange={onChange}
      rows={rows}
      required={required}
      className="w-full bg-[#f0f4f8] text-gray-800 placeholder-gray-400 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D24A46] transition-all text-sm"
    />
  </div>
);

function ProposalFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("id");
  const [userRole, setUserRole] = useState("USER");
  const [user, setUser] = useState<any>(null);

  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "alert",
    onConfirm: () => {},
  });
  const closeDialog = () => setDialog({ ...dialog, isOpen: false });
  const showConfirm = (title: string, message: string, onConfirm: () => void) =>
    setDialog({ isOpen: true, title, message, type: "confirm", onConfirm });
  const showAlert = (
    title: string,
    message: string,
    onConfirmAction = closeDialog,
  ) =>
    setDialog({
      isOpen: true,
      title,
      message,
      type: "alert",
      onConfirm: onConfirmAction,
    });

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
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUserRole(parsedUser.role);
      setUser(parsedUser);

      if (parsedUser.role === "ADMIN") {
        showAlert(
          "Access Denied",
          "Admin cannot create or edit proposals.",
          () => {
            closeDialog();
            router.push("/admin");
          },
        );
        return;
      }

      if (parsedUser.role === "SUPER ADMIN" && !proposalId) {
        showAlert(
          "Access Denied",
          "Super Admin can only edit existing proposals. You cannot create a new one.",
          () => {
            closeDialog();
            router.push("/admin");
          },
        );
        return;
      }
    }

    if (proposalId) {
      // const url = `https://api.form.contrariusactus.com/admin/proposals/${proposalId}`;
      const url = `http://localhost:3001/admin/proposals/${proposalId}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (Object.keys(data).length > 0)
            setFormData((prev: any) => ({ ...prev, ...data }));
        })
        .catch((err) => console.error(err));
    } else {
      setFormData(initialFormState);
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
      showAlert(
        "Validation Error",
        "Please accept all terms and check the confirmation boxes at the bottom before submitting.",
      );
      return;
    }

    const payload = {
      proposal_id: proposalId,
      id_user: user ? user.id_user || user.id : null,
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

      // const url = `https://api.form.contrariusactus.com${endpoint}`;
      const url = `http://localhost:3001${endpoint}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        showAlert("Success", result.message, () => {
          closeDialog();
          router.push("/admin");
        });
      } else {
        showAlert("Error", `Failed: ${result.message}`);
      }
    } catch (error) {
      showAlert("Error", "Failed to connect to the backend server!");
    }
  };

  const handleLogout = () => {
    showConfirm("Logout", "Are you sure you want to logout?", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    });
  };

  if (userRole === "ADMIN" || (userRole === "SUPER ADMIN" && !proposalId)) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        {dialog.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-t-4 border-[#D24A46] transform transition-all">
              <h3 className="text-2xl font-extrabold text-[#3B4D6A] mb-3">
                {dialog.title}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                {dialog.message}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={dialog.onConfirm}
                  className="px-5 py-2.5 bg-[#3B4D6A] text-white rounded-lg font-bold shadow-md hover:bg-[#2a374b] transition-colors text-sm uppercase tracking-wider"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-800 pb-20">
        {dialog.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-t-4 border-[#D24A46] transform transition-all">
              <h3 className="text-2xl font-extrabold text-[#3B4D6A] mb-3">
                {dialog.title}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                {dialog.message}
              </p>
              <div className="flex justify-end gap-3">
                {dialog.type === "confirm" && (
                  <button
                    onClick={closeDialog}
                    className="px-5 py-2.5 rounded-lg font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors text-sm uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => {
                    dialog.onConfirm();
                    if (dialog.type === "alert") closeDialog();
                  }}
                  className="px-5 py-2.5 bg-[#3B4D6A] text-white rounded-lg font-bold shadow-md hover:bg-[#2a374b] transition-colors text-sm uppercase tracking-wider"
                >
                  {dialog.type === "confirm" ? "Yes, Proceed" : "OK"}
                </button>
              </div>
            </div>
          </div>
        )}

        <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm border-b border-gray-100 text-sm sticky top-0 z-50">
          <div className="font-bold text-[#3B4D6A] text-xl tracking-wider flex items-center gap-3">
            <img
              src="/icon.png"
              alt="Contrarius Logo"
              className="h-9 w-9 object-contain"
            />
            CONTRARIUS INSTITUTE
          </div>
          <div className="flex gap-8 items-center font-medium">
            <Link
              href="/admin"
              className="text-[#64748B] hover:text-[#3B4D6A] transition-colors duration-200"
            >
              Overview
            </Link>
            <Link
              href="/admin/proposal"
              className="text-[#3B4D6A] font-bold border-b-2 border-[#D24A46] pb-1"
            >
              Proceedings proposal
            </Link>
            <button
              onClick={handleLogout}
              className="bg-transparent border-2 border-[#D24A46] text-[#D24A46] px-5 py-1.5 rounded-md hover:bg-[#D24A46] hover:text-white transition-all duration-300 font-bold shadow-sm active:scale-95"
            >
              LOGOUT
            </button>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto p-10 mt-4">
          <Link
            href="/admin"
            className="text-[#64748B] hover:text-[#3B4D6A] font-bold text-sm flex items-center gap-2 mb-8 transition-colors w-fit"
          >
            ← Back to overview
          </Link>
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-[#3B4D6A] tracking-tight mb-2">
              Proceedings proposal
            </h1>
            <p className="text-sm text-gray-500">
              * Please note that all form fields are mandatory unless stated
              otherwise.
            </p>
          </div>

          <div className="space-y-8">
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#3B4D6A] mb-6 border-b border-gray-100 pb-4">
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
                  hint="Please don't use spaces or separators"
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

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#3B4D6A] mb-6 border-b border-gray-100 pb-4">
                Credentials of the person authorised to sign
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

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#3B4D6A] mb-6 border-b border-gray-100 pb-4">
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
                  label="Acronym of the event"
                  name="acronym"
                  formData={formData}
                  onChange={handleChange}
                  required
                />
                <InputGroup
                  label="Number of past editions"
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
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                  Conference type
                </label>
                <select
                  name="conference_type"
                  value={formData.conference_type}
                  onChange={handleChange}
                  className="w-full bg-[#f0f4f8] text-gray-800 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D24A46] transition-all text-sm cursor-pointer"
                >
                  <option value="">Choose a value...</option>
                  <option value="In person">In person</option>
                  <option value="Online">Online</option>
                  <option value="In person & Online Hybrid">
                    In person & Online Hybrid
                  </option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 items-end">
                <InputGroup
                  label="City"
                  name="city"
                  formData={formData}
                  onChange={handleChange}
                />
                <InputGroup
                  label="Country"
                  name="country"
                  hint="For virtual conference, location of main organizer."
                  formData={formData}
                  onChange={handleChange}
                />
                <InputGroup
                  label="Start date"
                  name="start_date"
                  type="date"
                  formData={formData}
                  onChange={handleChange}
                />
                <InputGroup
                  label="End date"
                  name="end_date"
                  type="date"
                  formData={formData}
                  onChange={handleChange}
                />
              </div>
              <InputGroup
                label="Expected delivery date of articles to Contrarius"
                name="delivery_date"
                type="date"
                hint="Changes can be communicated later via Email."
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
                label="Websites of the past editions (last 3-5 years)"
                name="past_websites"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Web links to the proceedings of the past editions"
                hint="If not available online, specify where published"
                name="past_proceedings_links"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Indexes: past editions indexed in?"
                hint="Please provide links"
                name="indexes"
                formData={formData}
                onChange={handleChange}
              />
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#3B4D6A] mb-6 border-b border-gray-100 pb-4">
                Audience
              </h2>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">
                For whom is the conference intended?
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Undergraduate", name: "audience_undergrad" },
                  { label: "Graduate", name: "audience_grad" },
                  {
                    label: "Professional / Practitioner",
                    name: "audience_professional",
                  },
                  { label: "Research", name: "audience_research" },
                  { label: "Popular / General", name: "audience_popular" },
                ].map((item) => (
                  <label
                    key={item.name}
                    className="flex items-center gap-3 text-sm text-gray-700 bg-[#f0f4f8] p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      name={item.name}
                      checked={formData[item.name] || false}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#D24A46] focus:ring-[#D24A46] rounded border-gray-300"
                    />
                    <span className="font-medium">{item.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#3B4D6A] mb-6 border-b border-gray-100 pb-4">
                Editors and review
              </h2>
              <p className="text-sm text-gray-500 mb-8 bg-[#f0f4f8] p-4 rounded-md border-l-4 border-[#3B4D6A]">
                Names of the proceedings editor(s) whose names are to appear on
                the Contrarius Portal and cover of the proceedings volume as
                Editors:
              </p>

              <h3 className="font-bold text-lg mb-4 text-[#3B4D6A]">
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
                label="Email address"
                hint="University or professional email required"
                name="editor1_email"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Full Affiliation: (Institution, Dept, City, Postal Code, Country)"
                name="editor1_affiliation"
                formData={formData}
                onChange={handleChange}
              />
              <div className="mb-8">
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                  Is Corresponding?
                </label>
                <select
                  name="editor1_corresponding"
                  value={formData.editor1_corresponding}
                  onChange={handleChange}
                  className="w-full bg-[#f0f4f8] text-gray-800 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D24A46] transition-all text-sm cursor-pointer"
                >
                  <option value="">Choose...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <h3 className="font-bold text-lg mb-4 text-[#3B4D6A] border-t border-gray-100 pt-8">
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
                label="Email address"
                hint="University or professional email required"
                name="editor2_email"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Full Affiliation: (Institution, Dept, City, Postal Code, Country)"
                name="editor2_affiliation"
                formData={formData}
                onChange={handleChange}
              />
              <div className="mb-8">
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                  Is Corresponding?
                </label>
                <select
                  name="editor2_corresponding"
                  value={formData.editor2_corresponding}
                  onChange={handleChange}
                  className="w-full bg-[#f0f4f8] text-gray-800 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D24A46] transition-all text-sm cursor-pointer"
                >
                  <option value="">Choose...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <h3 className="font-bold text-lg mb-4 text-[#3B4D6A] border-t border-gray-100 pt-8">
                Other editors
              </h3>
              <TextAreaGroup
                label="Details of other editors (if > 2)"
                hint="Provide required info as above."
                name="other_editors"
                formData={formData}
                onChange={handleChange}
              />
              <h3 className="font-bold text-lg mb-4 text-[#3B4D6A] border-t border-gray-100 pt-8">
                Reviewers
              </h3>
              <TextAreaGroup
                label="Reviewer Details"
                hint="Full Name, title, email, affiliation of at least three senior person(s) responsible for review."
                name="reviewers_list"
                formData={formData}
                onChange={handleChange}
              />
              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                  Type of review:
                </label>
                <select
                  name="review_type"
                  value={formData.review_type}
                  onChange={handleChange}
                  className="w-full bg-[#f0f4f8] text-gray-800 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D24A46] transition-all text-sm cursor-pointer"
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

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#3B4D6A] mb-6 border-b border-gray-100 pb-4">
                Paper selection
              </h2>
              <TextAreaGroup
                label="How do you collect and manage submissions?"
                hint="E.g., Easy Chair, Meteor, Scholar One, Email."
                name="submission_management"
                formData={formData}
                onChange={handleChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputGroup
                  label="Reviewers per paper"
                  name="reviewers_per_paper"
                  formData={formData}
                  onChange={handleChange}
                />
                <InputGroup
                  label="Expected submissions"
                  name="expected_submissions"
                  type="number"
                  formData={formData}
                  onChange={handleChange}
                />
                <InputGroup
                  label="Min. accepted papers"
                  name="expected_accepted"
                  type="number"
                  formData={formData}
                  onChange={handleChange}
                />
                <InputGroup
                  label="Estimated total pages"
                  name="estimated_pages"
                  type="number"
                  formData={formData}
                  onChange={handleChange}
                />
                <InputGroup
                  label="Estimated participants"
                  name="estimated_participants"
                  type="number"
                  formData={formData}
                  onChange={handleChange}
                />
                <InputGroup
                  label="Expected geographic distribution"
                  name="geographic_dist"
                  formData={formData}
                  onChange={handleChange}
                />
              </div>
              <TextAreaGroup
                label="Metrics for past editions"
                hint="Submissions, acceptance rate, participants."
                name="past_metrics"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Supplementary materials"
                hint="E.g., software, datasets, solution manual."
                name="supplementary"
                formData={formData}
                onChange={handleChange}
              />
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#3B4D6A] mb-6 border-b border-gray-100 pb-4">
                Scope and PC
              </h2>
              <TextAreaGroup
                label="Topics / link to CFP"
                name="topics_cfp"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Organizing and technical committee"
                hint="Names and affiliations of members"
                name="committee_names"
                formData={formData}
                onChange={handleChange}
              />
              <TextAreaGroup
                label="Keynote speakers and speeches"
                name="keynote_info"
                formData={formData}
                onChange={handleChange}
                required
              />
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#3B4D6A] mb-4">
                Additional Services
              </h2>
              <div className="bg-[#f0f4f8] p-5 rounded-lg mb-6">
                <h3 className="font-bold text-sm mb-2 text-[#3B4D6A] uppercase tracking-wider">
                  Print version (optional)
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Contrarius can provide a e-printable file of the whole
                  proceedings books allowing organizers to print locally. (Cost:
                  1,000 euro).
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="print_ready"
                    checked={formData.print_ready || false}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-[#D24A46] focus:ring-[#D24A46] rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Yes, I want to receive print-ready files (including TOC and
                    ISBN).
                  </span>
                </label>
              </div>
              <div className="bg-[#f0f4f8] p-5 rounded-lg">
                <h3 className="font-bold text-sm mb-2 text-[#3B4D6A] uppercase tracking-wider">
                  Pre-review plagiarism check (optional)
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Check submitted papers on plagiarism before expert review.
                  Avoid reviewing rejected papers. (Costs: 100 euro set up fee +
                  5 euro/paper).
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="plagiarism_check"
                    checked={formData.plagiarism_check || false}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-[#D24A46] focus:ring-[#D24A46] rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Yes, I would like Contrarius to perform a pre-review
                    plagiarism check.
                  </span>
                </label>
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#3B4D6A] mb-6 border-b border-gray-100 pb-4">
                Various
              </h2>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                How did you learn of Contrarius?
              </label>
              <select
                name="how_learn_ap"
                value={formData.how_learn_ap}
                onChange={handleChange}
                className="w-full bg-[#f0f4f8] text-gray-800 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D24A46] transition-all text-sm cursor-pointer"
              >
                <option value="">Choose a value</option>
                <option value="Past collaboration">Past collaboration</option>
                <option value="Advertisement">Advertisement</option>
                <option value="From publisher editor">
                  From publisher editor
                </option>
                <option value="Internet search">Internet search</option>
                <option value="From colleagues / peers">
                  From colleagues / peers
                </option>
                <option value="From publisher website">
                  From publisher website
                </option>
                <option value="Other">Other:</option>
              </select>
            </section>

            <section className="bg-[#3B4D6A] p-8 rounded-2xl shadow-xl text-white">
              <h2 className="text-xl font-bold mb-6 border-b border-white/20 pb-4 flex items-center gap-2">
                Confirmation
              </h2>
              <div className="space-y-6">
                <label className="flex gap-4 cursor-pointer items-start bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    name="agreement_accepted"
                    checked={formData.agreement_accepted || false}
                    onChange={handleChange}
                    className="mt-1 flex-shrink-0 w-5 h-5 text-[#D24A46] focus:ring-[#D24A46] rounded border-white/30 bg-transparent"
                  />
                  <span className="text-sm text-blue-100 leading-relaxed">
                    Yes, I accept that the content of these proceedings will be
                    distributed under the Creative Commons Attribution License
                    4.0. Note: all proceedings articles are “gold” open access.
                    We will charge the organizer for the cost of publishing.
                  </span>
                </label>
                <label className="flex gap-4 cursor-pointer items-start bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    name="confirmation_correct"
                    checked={formData.confirmation_correct || false}
                    onChange={handleChange}
                    className="mt-1 flex-shrink-0 w-5 h-5 text-[#D24A46] focus:ring-[#D24A46] rounded border-white/30 bg-transparent"
                  />
                  <span className="text-sm text-blue-100 leading-relaxed">
                    Hereby I confirm that all information provided is correct,
                    the event will be a real conference/workshop, and all papers
                    will go through rigorous peer review process before being
                    sent to Contrarius.
                  </span>
                </label>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-12 pt-8 border-t border-gray-200">
              <button
                onClick={() => handleSave(false)}
                className="px-8 py-3 bg-white border-2 border-[#3B4D6A] text-[#3B4D6A] rounded-md hover:bg-[#f0f4f8] font-bold shadow-sm transition-all active:scale-95 text-sm uppercase tracking-wider"
              >
                SAVE AS DRAFT
              </button>
              <button
                onClick={() => handleSave(true)}
                className="px-8 py-3 bg-[#3B4D6A] text-white rounded-md hover:bg-[#2a374b] font-bold shadow-lg transition-all active:scale-95 text-sm uppercase tracking-wider"
              >
                SUBMIT PROPOSAL
              </button>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

export default function ProposalFormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-[#3B4D6A] font-bold">
          Loading form...
        </div>
      }
    >
      <ProposalFormContent />
    </Suspense>
  );
}