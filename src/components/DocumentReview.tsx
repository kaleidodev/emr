"use client";

import { Bell, ChevronDown, ChevronLeft, ChevronRight, Filter, Menu, Search } from "lucide-react";
import { useMemo, useState } from "react";

type Doc = { date: string; patient: string; type: string; title: string };
type Point = { date: string; value: number };
type PatientInfo = {
  name: string;
  patientID: string;
  sex: string;
  dob: string;
  address: string;
  phone: string;
  ssn: string;
  specimenNum: string;
  reportStatus: string;
  dateOfSpecimen: string;
  dateReceived: string;
  dateReported: string;
  physician: string;
  gmtOrderID: string;
};

const docs: Doc[] = [
  { date: "07/11/2021", patient: "John Doe (123456)", type: "Labs and Pathology", title: "Imported - Discharge Summary" },
  { date: "07/11/2021", patient: "John Doe (123456)", type: "Lab Correction", title: "Imported - ED Note" },
  { date: "07/11/2021", patient: "John Doe (123456)", type: "Outside Labs", title: "Imported - Flu Vaccine Document" },
  { date: "07/03/2021", patient: "John Doe (123456)", type: "Lab Results", title: "Imported - Carotid US" },
  { date: "07/03/2021", patient: "John Doe (123456)", type: "In-house Labs", title: "Imported - Spirometry" },
  { date: "07/03/2021", patient: "John Doe (123456)", type: "Old Labs", title: "Imported - Hernia Surgery" },
  { date: "06/08/2021", patient: "John Doe (123456)", type: "Outside Lab Letter", title: "Imported - Previous PCP Note" },
  { date: "04/03/2021", patient: "John Doe (123456)", type: "Hospital Labs", title: "Imported - Medications 04/01/2020" },
  { date: "03/05/2021", patient: "John Doe (123456)", type: "Lab Results", title: "Imported - ED Note" },
  { date: "02/14/2021", patient: "John Doe (123456)", type: "Old Labs", title: "Imported - CBC Results" },
  { date: "01/28/2021", patient: "John Doe (123456)", type: "Lab Results", title: "Imported - Urinalysis" },
  { date: "01/12/2021", patient: "John Doe (123456)", type: "Outside Labs", title: "Imported - Chest X-Ray Report" },
];

const labOptions = {
  CMP: ["Sodium, Serum (mmol/L)", "Potassium, Serum (mmol/L)", "Glucose, Serum (mg/dL)"],
  Lipids: ["Total Cholesterol (mg/dL)", "HDL (mg/dL)", "Triglycerides (mg/dL)"],
  HbA1c: ["HbA1c (%)"],
} as const;

type HistoryPoint = Point & { flag?: string };
const historyMap: Record<string, HistoryPoint[]> = {
  "Sodium, Serum (mmol/L)": [
    { date: "09/30/2020", value: 143 },
    { date: "08/15/2020", value: 141.5 },
    { date: "07/30/2020", value: 142 },
    { date: "06/10/2020", value: 139 },
    { date: "05/30/2019", value: 140 },
    { date: "03/20/2019", value: 138.5 },
    { date: "11/05/2018", value: 141 },
    { date: "08/12/2018", value: 139.5 },
    { date: "05/22/2018", value: 142 },
    { date: "02/14/2018", value: 140.5 },
    { date: "10/30/2017", value: 138 },
    { date: "06/15/2017", value: 141 },
  ],
  "Potassium, Serum (mmol/L)": [
    { date: "09/30/2020", value: 4.2 },
    { date: "07/30/2020", value: 4 },
    { date: "05/30/2019", value: 3.8 },
    { date: "09/30/2018", value: 4.5 },
    { date: "05/10/2018", value: 4.1 },
    { date: "01/15/2018", value: 3.9 },
  ],
  "Glucose, Serum (mg/dL)": [
    { date: "09/30/2020", value: 94 },
    { date: "07/30/2020", value: 98 },
    { date: "05/30/2019", value: 102 },
    { date: "09/30/2018", value: 96 },
    { date: "05/10/2018", value: 100 },
    { date: "01/15/2018", value: 91 },
  ],
  "Total Cholesterol (mg/dL)": [
    { date: "09/30/2020", value: 198 },
    { date: "07/30/2020", value: 202 },
    { date: "05/30/2019", value: 195 },
    { date: "09/30/2018", value: 210 },
  ],
  "HDL (mg/dL)": [
    { date: "09/30/2020", value: 60 },
    { date: "07/30/2020", value: 58 },
    { date: "05/30/2019", value: 56 },
    { date: "09/30/2018", value: 55 },
  ],
  "Triglycerides (mg/dL)": [
    { date: "09/30/2020", value: 185, flag: "H" },
    { date: "07/30/2020", value: 170, flag: "H" },
    { date: "05/30/2019", value: 162, flag: "H" },
    { date: "09/30/2018", value: 190, flag: "H" },
  ],
  "HbA1c (%)": [
    { date: "09/30/2020", value: 5.8 },
    { date: "07/30/2020", value: 6.1 },
    { date: "05/30/2019", value: 5.9 },
    { date: "09/30/2018", value: 6.3 },
  ],
};

const reportRows = [
  { name: "CHOLESTEROL, TOTAL", result: "157 mg/dL", flag: "", range: "<200 mg/dL", lab: "CB", abnormal: false },
  { name: "HDL CHOLESTEROL", result: "60 mg/dL", flag: "", range: ">= 40 mg/dL", lab: "CB", abnormal: false },
  { name: "TRIGLYCERIDES", result: "185 mg/dL", flag: "H", range: "<150 mg/dL", lab: "CB", abnormal: true },
];

const pageSize = 10;
const patientOptions = ["John Doe (123456)", "Mary Smith (234567)", "Robert Johnson (345678)"];
const filterOptions = ["All Documents", "Unsigned", "Labs Only", "Abnormal Results", "Last 90 Days"];
const moreOptions = ["Print Document", "Download PDF", "Fax to Provider", "Mark as Reviewed", "Archive Document"];
const join = (...items: Array<string | false>) => items.filter(Boolean).join(" ");

const patientInfo: PatientInfo = {
  name: "Romero, Sergio",
  patientID: "38282",
  sex: "Male",
  dob: "07/22/1943",
  address: "5105 W 23RD PL, CICERO, IL 60804",
  phone: "###-###-###",
  ssn: "###-##-6690",
  specimenNum: "WX219746J",
  reportStatus: "Final Results",
  dateOfSpecimen: "04/08/2021 09:42:00",
  dateReceived: "04/08/2021 14:34:00",
  dateReported: "04/10/2021 07:21:00",
  physician: "FLORES, DINORA",
  gmtOrderID: "34644167",
};

export default function DocumentReview() {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showHistory, setShowHistory] = useState(true);
  const [labType, setLabType] = useState<keyof typeof labOptions | "">("");
  const [labTest, setLabTest] = useState("");
  const [openMenu, setOpenMenu] = useState<"filter" | "patient" | "more" | "">("");
  const [documentSigned, setDocumentSigned] = useState(false);
  const [historyRange, setHistoryRange] = useState("all");

  const filteredDocs = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((doc) => [doc.date, doc.patient, doc.type, doc.title].some((value) => value.toLowerCase().includes(q)));
  }, [keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const rows = filteredDocs.slice(start, start + pageSize);
  const currentDoc = filteredDocs[selectedIndex] ?? filteredDocs[0] ?? docs[0];
  const tests = labType ? labOptions[labType] : [];
  const allHistory = labTest ? historyMap[labTest] ?? [] : [];
  const history = useMemo(() => {
    if (!historyRange || historyRange === "all") return allHistory;
    const now = new Date("2020-10-01");
    const months = historyRange === "3m" ? 3 : historyRange === "6m" ? 6 : historyRange === "1y" ? 12 : 60;
    const cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - months);
    return allHistory.filter((h) => new Date(h.date) >= cutoff);
  }, [allHistory, historyRange]);
  const minHistoryValue = history.length > 0 ? Math.min(...history.map((h) => h.value)) : 0;
  const maxHistoryValue = history.length > 0 ? Math.max(...history.map((h) => h.value)) : 100;

  const handleSignDocument = () => {
    setDocumentSigned(!documentSigned);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f0efe9] text-[#2d2d2d]">
      <nav className="flex min-h-[52px] flex-wrap items-center gap-3 border-b border-[#e2e2dc] bg-white px-3 py-3 sm:px-4 sm:py-2">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" className="text-[#555]">
            <Menu size={18} />
          </button>
          <div className="text-xl font-bold tracking-tight text-[#ad273a]">Canopy</div>
          <div className="hidden text-xl text-[#c8c8c4] sm:block">|</div>
          <div className="hidden text-sm text-[#444] sm:block">Visits</div>
        </div>
        <div className="order-3 flex w-full items-center rounded-md border border-[#d8d8d2] bg-[#fafaf8] px-3 sm:order-none sm:ml-auto sm:max-w-[420px] lg:w-full">
          <input className="h-8 w-full min-w-0 bg-transparent text-sm outline-none" placeholder="Search for a patient" />
          <Search size={14} className="shrink-0 text-[#888]" />
        </div>
        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <button type="button" className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full bg-[#f0efea] text-[#555]">
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 min-w-4 rounded-full bg-[#e8372d] px-1 text-[9px] leading-4 font-bold text-white">1</span>
          </button>
          <button type="button" className="hidden h-8.5 w-8.5 items-center justify-center rounded-full bg-[#f0efea] text-xs font-semibold text-[#444] sm:flex">
            10
          </button>
          <button type="button" className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-[#2d6fa8] text-xs font-bold text-white">
            JD
          </button>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-52px)] flex-col lg:flex-row">
        <section className="flex w-full min-w-0 flex-col border-b border-[#e2e2dc] bg-white lg:w-[420px] lg:border-r lg:border-b-0 xl:w-[580px]">
          <div className="border-b border-[#f0f0ec] px-4 py-[14px] text-lg font-semibold text-[#1a1a1a] sm:px-[18px]">Documents Review</div>
          <div className="flex flex-wrap items-center gap-2 border-b border-[#f0f0ec] px-4 py-[10px] sm:px-[18px]">
            <div className="flex min-w-0 flex-1 basis-full items-center rounded border border-[#d8d8d2] bg-[#fafaf8] px-2.5 sm:basis-auto">
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                  setSelectedIndex(0);
                }}
                className="h-8 w-full min-w-0 bg-transparent text-xs outline-none"
                placeholder="Search for a document"
              />
              <Search size={12} className="text-[#999]" />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu((v) => (v === "filter" ? "" : "filter"))}
                className="flex items-center gap-1 rounded border border-[#d8d8d2] bg-[#fafaf8] px-2.5 py-1.5 text-[11px] font-semibold text-[#444]"
              >
                <Filter size={13} className="text-[#ad273a]" />
                FILTER
              </button>
              {openMenu === "filter" ? (
                <div className="absolute right-0 z-20 mt-1 w-40 max-w-[calc(100vw-1rem)] overflow-auto rounded border border-[#d8d8d2] bg-white py-1 text-xs shadow-lg">
                  {filterOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setOpenMenu("")}
                      className="block w-full px-3 py-1.5 text-left hover:bg-[#fdf0f2]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button type="button" className="px-2 py-1 text-[11px] font-semibold text-[#555]">
              REFRESH
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            <table className="min-w-[560px] w-full table-fixed border-collapse">
              <colgroup>
                <col className="w-[90px]" />
                <col className="w-[150px]" />
                <col className="w-[140px]" />
                <col />
              </colgroup>
              <thead className="sticky top-0 z-10 bg-[#fafaf8]">
                <tr className="border-b border-[#e8e8e4] text-left text-[11px] text-[#888]">
                  <th className="px-[10px] py-[7px] font-medium">Date</th>
                  <th className="px-[10px] py-[7px] font-medium">Patient</th>
                  <th className="px-[10px] py-[7px] font-medium">Type</th>
                  <th className="px-[10px] py-[7px] font-medium">Title</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((doc) => {
                  const rowIndex = filteredDocs.findIndex((item) => item.date === doc.date && item.title === doc.title);
                  return (
                    <tr
                      key={`${doc.date}-${doc.title}`}
                      onClick={() => setSelectedIndex(rowIndex)}
                      className={join("cursor-pointer border-b border-[#f2f2ee] text-xs hover:bg-[#fdf0f2]", rowIndex === selectedIndex && "bg-[#f9e4e7]")}
                    >
                      <td className="px-[10px] py-2">{doc.date}</td>
                      <td className="truncate px-[10px] py-2">{doc.patient}</td>
                      <td className="truncate px-[10px] py-2">{doc.type}</td>
                      <td className="truncate px-[10px] py-2">{doc.title}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e8e4] px-4 py-2 sm:px-[18px]">
            <button type="button" className="rounded border border-[#d8d8d2] bg-white px-3.5 py-1.5 text-xs text-[#444]">
              Back to Table
            </button>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#777] sm:justify-end">
              <span>{filteredDocs.length ? `${start + 1}-${Math.min(start + pageSize, filteredDocs.length)} of ${filteredDocs.length}` : "0-0 of 0"}</span>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((v) => Math.max(1, v - 1))}
                className="flex h-6.5 w-6.5 items-center justify-center rounded border border-[#d8d8d2] bg-[#fafaf8] disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                disabled={start + pageSize >= filteredDocs.length}
                onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
                className="flex h-6.5 w-6.5 items-center justify-center rounded border border-[#d8d8d2] bg-[#fafaf8] disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>

        <section className="flex min-w-0 flex-1 flex-col bg-white">
          <div className="border-b border-[#f0f0ec] px-4 py-[13px] sm:px-[18px]">
            <div className="mb-0.5 text-[11px] text-[#888]">{currentDoc.type}</div>
            <div className="mb-[11px] break-words text-base font-semibold text-[#1a1a1a]">{currentDoc.title}</div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu((v) => (v === "patient" ? "" : "patient"))}
                  className="flex max-w-full items-center gap-1 rounded border border-[#d8d8d2] bg-[#fafaf8] px-2.5 py-1.5 text-sm text-[#333]"
                >
                  {currentDoc.patient}
                  <ChevronDown size={12} />
                </button>
                {openMenu === "patient" ? (
                  <div className="absolute left-0 z-20 mt-1 w-48 max-w-[calc(100vw-1rem)] overflow-auto rounded border border-[#d8d8d2] bg-white py-1 text-xs shadow-lg">
                    {patientOptions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setOpenMenu("")}
                        className="block w-full px-3 py-1.5 text-left hover:bg-[#fdf0f2]"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu((v) => (v === "more" ? "" : "more"))}
                  className="flex items-center gap-1 rounded border border-[#d8d8d2] bg-[#fafaf8] px-3 py-1.5 text-xs text-[#333]"
                >
                  MORE OPTIONS
                  <ChevronDown size={12} />
                </button>
                {openMenu === "more" ? (
                  <div className="absolute left-0 z-20 mt-1 w-44 max-w-[calc(100vw-1rem)] overflow-auto rounded border border-[#d8d8d2] bg-white py-1 text-xs shadow-lg">
                    {moreOptions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setOpenMenu("")}
                        className="block w-full px-3 py-1.5 text-left hover:bg-[#fdf0f2]"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleSignDocument}
                className={`w-full rounded px-4 py-1.5 text-[13px] font-bold sm:w-auto ${
                  documentSigned ? "bg-[#4caf50] text-white" : "bg-[#ad273a] text-white"
                }`}
              >
                {documentSigned ? "SIGNED ✓" : "SIGN DOCUMENT"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#f0efea] p-3 sm:p-4">
            <div className="overflow-x-auto rounded-[3px] border border-[#e0e0d8] bg-white px-4 py-4 text-[10.5px] leading-6 text-[#2a2a2a] sm:px-[18px]">
              <div className="mb-2 text-right text-[9.5px] text-[#999]">[12/2/2021][Page 1 of 5]</div>
              <div className="mb-1 text-[11px] font-bold">Quest - Lab - General Lab</div>
              <hr className="my-2 border-[#e8e8e4]" />

              <div className="mb-1 text-[10.5px] font-bold">Patient Information:</div>
              <div className="mb-2 grid grid-cols-1 gap-x-3 gap-y-1 text-[10px] sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <span className="font-semibold">Name:</span> {patientInfo.name}
                </div>
                <div>
                  <span className="font-semibold">PatientID:</span> {patientInfo.patientID}
                </div>
                <div>
                  <span className="font-semibold">Sex:</span> {patientInfo.sex}
                </div>
                <div>
                  <span className="font-semibold">DOB:</span> {patientInfo.dob}
                </div>
                <div className="text-[9.5px] text-[#555] sm:col-span-2 lg:col-span-2">
                  <span className="font-semibold">Address:</span> <span className="break-words whitespace-normal">{patientInfo.address}</span>
                </div>
                <div>
                  <span className="font-semibold">Phone #:</span> {patientInfo.phone}
                </div>
                <div>
                  <span className="font-semibold">SSN:</span> {patientInfo.ssn}
                </div>
              </div>
              <hr className="my-2 border-[#e8e8e4]" />

              <div className="grid grid-cols-1 gap-x-3 gap-y-1 text-[10px] sm:grid-cols-2">
                <div>
                  <span className="font-semibold">Specimen #:</span> {patientInfo.specimenNum}
                </div>
                <div>
                  <span className="font-semibold">Report Status:</span> <strong className="text-[#d32f2f]">{patientInfo.reportStatus}</strong>
                </div>
                <div>
                  <span className="font-semibold">Date of Specimen:</span> {patientInfo.dateOfSpecimen}
                </div>
                <div>
                  <span className="font-semibold">Date Received:</span> {patientInfo.dateReceived}
                </div>
                <div>
                  <span className="font-semibold">Date Reported:</span> {patientInfo.dateReported}
                </div>
                <div>
                  <span className="font-semibold">Physician:</span> {patientInfo.physician}
                </div>
              </div>
              <div className="mt-1 text-[10px]">
                <span className="font-semibold">GMT Order ID:</span> <span className="font-semibold text-[#ad273a]">{patientInfo.gmtOrderID}</span>
              </div>
              <hr className="my-2 border-[#e8e8e4]" />

              <table className="min-w-[640px] w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#e0e0d8] text-left text-[10px] text-[#888]">
                    <th className="px-1.5 py-1 font-medium">Test Name</th>
                    <th className="px-1.5 py-1 font-medium">Result</th>
                    <th className="px-1.5 py-1 font-medium">Flags</th>
                    <th className="px-1.5 py-1 font-medium">Reference Range</th>
                    <th className="px-1.5 py-1 font-medium">Lab</th>
                  </tr>
                </thead>
                <tbody>
                  {reportRows.map((row) => (
                    <tr key={row.name} className={row.abnormal ? "font-bold text-[#d32f2f]" : ""}>
                      <td className="px-1.5 py-1">
                        LIPID PANEL, STANDARD
                        <br />
                        <span className={row.abnormal ? "text-[#d32f2f]" : "font-normal"}>{row.name}</span>
                      </td>
                      <td className="px-1.5 py-1">{row.result}</td>
                      <td className="px-1.5 py-1">{row.flag || "-"}</td>
                      <td className="px-1.5 py-1">{row.range}</td>
                      <td className="px-1.5 py-1">{row.lab}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col border-t border-[#e8e8e4] bg-white">
            <div className="flex items-center justify-between border-b border-[#f0f0ec] px-4 py-[9px]">
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold text-[#ad273a]">||||</div>
                <select
                  value={labType}
                  onChange={(e) => {
                    const value = e.target.value as keyof typeof labOptions | "";
                    setLabType(value);
                    setLabTest("");
                  }}
                  className="rounded border border-[#d8d8d2] bg-[#fafaf8] px-2 py-1 text-xs outline-none"
                >
                  <option value="">Select Lab Type</option>
                  {Object.keys(labOptions).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <select
                  value={labTest}
                  onChange={(e) => setLabTest(e.target.value)}
                  disabled={!labType}
                  className="rounded border border-[#d8d8d2] bg-[#fafaf8] px-2 py-1 text-xs outline-none disabled:opacity-50"
                >
                  <option value="">Select Test</option>
                  {tests.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setShowHistory((v) => !v)}
                className="flex items-center gap-1 text-[11px] font-medium text-[#555]"
              >
                {showHistory ? "Hide Past Lab Results" : "Show Past Lab Results"}
                <ChevronDown size={10} className={showHistory ? "rotate-180" : ""} />
              </button>
            </div>
            {showHistory ? (
              !labTest ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="text-[12px] font-semibold text-[#444]">View Past Lab Results</div>
                  <div className="text-[10.5px] text-[#888]">Select a lab type and test above to view historical trends</div>
                </div>
              ) : (
                <div className="flex min-h-0 flex-1">
                  {/* Line chart */}
                  <div className="flex flex-1 flex-col border-r border-[#e8e8e4] p-3">
                    <div className="text-[11.5px] font-semibold text-[#333]">{labTest.replace(/ \(.*\)/, "")}</div>
                    <div className="mb-1 text-[10px] text-[#888]">Last Result: <span className="font-bold text-[#333]">{history[0]?.value}</span>{labTest.match(/\(([^)]+)\)/)?.[0] ?? ""}</div>
                    <svg viewBox="0 0 300 100" className="flex-1 w-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ad273a" stopOpacity="0.18" />
                          <stop offset="100%" stopColor="#ad273a" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      {history.length > 1 && (() => {
                        const pts = [...history].reverse();
                        const pad = 8; const w = 300; const h = 100;
                        const xs = pts.map((_, i) => pad + (i / (pts.length - 1)) * (w - pad * 2));
                        const range = maxHistoryValue - minHistoryValue || 1;
                        const ys = pts.map((p) => h - pad - ((p.value - minHistoryValue) / range) * (h - pad * 2));
                        const d = pts.map((_, i) => `${i === 0 ? "M" : "L"}${xs[i]},${ys[i]}`).join(" ");
                        const area = `${d} L${xs[xs.length - 1]},${h - pad} L${xs[0]},${h - pad} Z`;
                        return (<>
                          <path d={area} fill="url(#lineGrad)" />
                          <path d={d} fill="none" stroke="#ad273a" strokeWidth="1.5" />
                          {pts.map((p, i) => <circle key={p.date} cx={xs[i]} cy={ys[i]} r="2.5" fill="#ad273a" />)}
                        </>);
                      })()}
                    </svg>
                    <div className="flex justify-between text-[8.5px] text-[#aaa] px-1">
                      {[...history].reverse().filter((_, i, a) => i === 0 || i === Math.floor(a.length / 2) || i === a.length - 1).map((p) => <span key={p.date}>{p.date.slice(0, 5)}/{p.date.slice(-2)}</span>)}
                    </div>
                  </div>
                  {/* Table */}
                  <div className="flex flex-1 flex-col bg-white">
                    <div className="flex items-center justify-between border-b border-[#eee] px-3 py-2">
                      <div className="text-[11px] font-semibold text-[#333]">{labTest.replace(/ \(.*\)/, "")}</div>
                      <select value={historyRange} onChange={(e) => setHistoryRange(e.target.value)} className="rounded border border-[#d8d8d2] bg-[#fafaf8] px-1.5 py-0.5 text-[10.5px] outline-none">
                        <option value="3m">3 months</option>
                        <option value="6m">6 months</option>
                        <option value="1y">1 year</option>
                        <option value="all">All</option>
                      </select>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-[#fafaf8]">
                          <tr className="border-b border-[#eee] text-left text-[10px] text-[#888]">
                            <th className="px-3 py-1 font-medium">Date</th>
                            <th className="px-3 py-1 font-medium">Result</th>
                            <th className="px-3 py-1 font-medium">Flag</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((item) => (
                            <tr key={item.date} className="border-b border-[#f5f5f2] text-[11px] text-[#333]">
                              <td className="px-3 py-1.5 text-[10px]">{item.date}</td>
                              <td className="px-3 py-1.5 font-semibold">{item.value}</td>
                              <td className={join("px-3 py-1.5 font-semibold", !!item.flag && "text-[#d32f2f]")}>{item.flag || ""}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-3 py-2 text-[10px] text-[#999]">1–{history.length} of {allHistory.length}</div>
                    </div>
                  </div>
                </div>
              )
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
