// components/builder/ResumeBuilder.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconBriefcase,
  IconTrophy,
  IconCertificate,
  IconBook,
  IconCode,
  IconDeviceFloppy,
  IconEye,
  IconEdit,
  IconFolderCode,
  IconLayoutGrid,
  IconMinus,
  IconPlus,
  IconPrinter,
  IconRefresh,
  IconSchool,
  IconSparkles,
  IconUserCircle,
  IconWand,
  IconGripVertical,
  IconAlertCircle,
  IconX,
  IconInfoCircle,
} from "@tabler/icons-react";

import ResumeRenderer from "@/components/ResumeRenderer";
import {
  DEMO_RESUME,
  EMPTY_RESUME,
  TEMPLATE_DEFINITIONS,
  cloneResume,
} from "@/lib/resume-data";
import { stripTransientUploadReferences } from "@/components/utils/resumeHelpers.js";

import { useResizablePane } from "@/hooks/useResizablePane";
import BasicsTab from "./tabs/BasicsTab";
import ExperienceTab from "./tabs/ExperienceTab";
import EducationTab from "./tabs/EducationTab";
import SkillsTab from "./tabs/SkillsTab";
import ProjectsTab from "./tabs/ProjectsTab";
import MoreTab from "./tabs/MoreTab";
import AdditionalTab from "./tabs/AdditionalTab";
import CertificatesTab from "./tabs/CertificatesTab";
import PublicationsTab from "./tabs/PublicationsTab";
import AchievementsTab from "./tabs/AchievementsTab";
import { buildResumeMultipartFormData } from "../utils/resumeUploadHelper";
import signup from "@/helpers/signup";
import login from "@/helpers/login";
import PageLoader from "../utils/page-loader/PageLoader";
import addResumeId from "@/helpers/addResumeId";

const tabs = [
  ["Basics", IconUserCircle],
  ["Experience", IconBriefcase],
  ["Education", IconSchool],
  ["Skills", IconCode],
  ["Projects", IconFolderCode],
  ["Certificates", IconCertificate],
  ["Publications", IconBook],
  ["Achievements", IconTrophy],
  ["Additional", IconLayoutGrid],
  ["More", IconLayoutGrid],
];

const PRIORITY_TAB_CONFIG = {
  Experience: { root: "workExperience" },
  Education: { root: "educations" },
  Skills: { root: "skills" },
  Projects: { root: "projects" },
  Certificates: { root: "certifications" },
  Publications: { root: "publications" },
  Achievements: { root: "awardsAndAchievements" },
};

const PRIORITY_TAB_NAMES = Object.keys(PRIORITY_TAB_CONFIG);
const ACTIVE_TAB_STORAGE_KEY = "airesume-active-tab";

export default function ResumeBuilder({
  initialTemplate = "clean-ats-optimizer",
  document_id = null,
}) {
  const validInitial = useMemo(() => {
    return TEMPLATE_DEFINITIONS.some((item) => item.id === initialTemplate)
      ? initialTemplate
      : "clean-ats-optimizer";
  }, [initialTemplate]);

  const [resume, setResume] = useState(() => ({
    ...cloneResume(DEMO_RESUME),
    templateName: validInitial,
  }));

  const [activeTab, setActiveTab] = useState("Basics");
  const [activeTabHydrated, setActiveTabHydrated] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mobileMode, setMobileMode] = useState("edit");
  const [zoom, setZoom] = useState(60);
  const [hydrated, setHydrated] = useState(false);
  const [pendingFiles, setPendingFiles] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingRedirectUrl, setPendingRedirectUrl] = useState("");
  const [isProceeding, setIsProceeding] = useState(false);
  const [userId, setUserId] = useState(null);
  const [resumeId, setResumeId] = useState(null);

  // Professional Alert Modal State
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    details: "",
  });

  const showAlert = (title, message, details) => {
    setAlertModal({ isOpen: true, title, message, details });
  };

  const { formWidth, isDragging, editorRef, startDragging, DIVIDER_HIT_WIDTH } =
    useResizablePane(650);

  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    if (!document_id) {
      setResumeData(null);
      return;
    }

    const fetchResume = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_RESUME_FETCH_URL}/${document_id}`,
          {
            method: "GET",
          },
        );

        if (!response.ok) {
          throw new Error("Response not coming.");
        } else {
          const data = await response.json();
          const resumeDocument = data?.resume ?? data;
          if (
            !resumeDocument ||
            typeof resumeDocument !== "object" ||
            !resumeDocument.basicInfo
          ) {
            throw new Error(
              "The resume API returned an unexpected data structure.",
            );
          }
          setResumeData({ ...data, resume: resumeDocument });
        }
      } catch (error) {
        console.error("Failed to fetch resume:", error);
        setResumeData(null);
      }
    };

    fetchResume();
  }, [document_id]);

  useEffect(() => {
    if (
      document_id != null &&
      resumeData != null &&
      resumeData.resume != null
    ) {
      const fetchedTemplate = resumeData.resume.templateName;
      const chosenTemplate = TEMPLATE_DEFINITIONS.some(
        (t) => t.id === initialTemplate,
      )
        ? initialTemplate
        : TEMPLATE_DEFINITIONS.some((t) => t.id === fetchedTemplate)
          ? fetchedTemplate
          : validInitial;

      setResume({
        ...cloneResume(resumeData.resume),
        templateName: chosenTemplate,
      });
      setPendingFiles({});
      setHydrated(true);
    } else if (document_id == null || resumeData == null) {
      try {
        const raw = window.localStorage.getItem("airesume-draft");
        if (raw && !document_id) {
          const parsed = JSON.parse(raw);
          const chosenTemplate =
            initialTemplate &&
            TEMPLATE_DEFINITIONS.some((t) => t.id === initialTemplate)
              ? initialTemplate
              : parsed.templateName || validInitial;

          setResume({
            ...stripTransientUploadReferences(parsed),
            templateName: chosenTemplate,
          });
        } else {
          setResume({
            ...cloneResume(DEMO_RESUME),
            templateName: validInitial,
          });
        }
      } catch {
        setResume({
          ...cloneResume(DEMO_RESUME),
          templateName: validInitial,
        });
      } finally {
        setHydrated(true);
      }
    }
  }, [document_id, resumeData, initialTemplate, validInitial]);

  useEffect(() => {
    try {
      const storedTab = window.sessionStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
      const validTab = tabs.some(([name]) => name === storedTab);

      if (validTab) {
        setActiveTab(storedTab);
      }
    } catch {
      // Ignore unavailable sessionStorage.
    } finally {
      setActiveTabHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!activeTabHydrated) return;

    try {
      window.sessionStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTab);
    } catch {
      // Ignore unavailable sessionStorage.
    }
  }, [activeTab, activeTabHydrated]);

  useEffect(() => {
    setResume((current) => {
      if (current.templateName !== validInitial && !resumeData?.resume) {
        return { ...current, templateName: validInitial };
      }
      return current;
    });
  }, [validInitial, resumeData]);

  const update = (path, value) => {
    setResume((current) => {
      const next = cloneResume(current);
      const keys = path.split(".");
      const last = keys.pop();
      let target = next;
      for (const key of keys) {
        target[key] = { ...(target[key] || {}) };
        target = target[key];
      }
      target[last] = value;
      return next;
    });
  };

  const getSectionPriority = (name, fallbackIndex) => {
    const root = PRIORITY_TAB_CONFIG[name]?.root;
    const priority = root ? Number(resume[root]?.priority) : NaN;
    return Number.isFinite(priority) && priority > 0
      ? priority
      : fallbackIndex + 1;
  };

  const orderedPriorityTabs = useMemo(() => {
    return PRIORITY_TAB_NAMES.map((name, index) => ({
      name,
      priority: getSectionPriority(name, index),
      index,
    }))
      .sort((a, b) => a.priority - b.priority || a.index - b.index)
      .map(({ name }) => tabs.find(([tabName]) => tabName === name));
  }, [resume]);

  const handleSectionTabDragStart = (event, name) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", name);
  };

  const handleSectionTabDrop = (event, targetName) => {
    event.preventDefault();

    const sourceName = event.dataTransfer.getData("text/plain");
    if (
      !sourceName ||
      sourceName === targetName ||
      !PRIORITY_TAB_CONFIG[sourceName] ||
      !PRIORITY_TAB_CONFIG[targetName]
    ) {
      return;
    }

    const currentOrder = orderedPriorityTabs.map(([name]) => name);
    const sourceIndex = currentOrder.indexOf(sourceName);
    const targetIndex = currentOrder.indexOf(targetName);

    if (sourceIndex < 0 || targetIndex < 0) return;

    const nextOrder = [...currentOrder];
    const [moved] = nextOrder.splice(sourceIndex, 1);
    nextOrder.splice(targetIndex, 0, moved);

    setResume((current) => {
      const next = cloneResume(current);

      nextOrder.forEach((name, index) => {
        const root = PRIORITY_TAB_CONFIG[name].root;
        next[root] = {
          ...(next[root] || {}),
          priority: index + 1,
        };
      });

      return next;
    });
  };

  const handleSectionTabDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const renderTabs = () => {
    const orderedTabs = [
      tabs.find(([name]) => name === "Basics"),
      ...orderedPriorityTabs,
      tabs.find(([name]) => name === "Additional"),
      tabs.find(([name]) => name === "More"),
    ].filter(Boolean);

    return orderedTabs.map(([name, Icon]) => {
      const isReorderable = Boolean(PRIORITY_TAB_CONFIG[name]);
      const priority = isReorderable
        ? getSectionPriority(name, PRIORITY_TAB_NAMES.indexOf(name))
        : null;

      return (
        <button
          key={name}
          type="button"
          draggable={isReorderable}
          onDragStart={
            isReorderable
              ? (event) => handleSectionTabDragStart(event, name)
              : undefined
          }
          onDrop={
            isReorderable
              ? (event) => handleSectionTabDrop(event, name)
              : undefined
          }
          onDragOver={isReorderable ? handleSectionTabDragOver : undefined}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === name
              ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          } ${isReorderable ? "cursor-grab active:cursor-grabbing" : ""}`}
          onClick={() => setActiveTab(name)}
          title={
            isReorderable
              ? `Priority ${priority} · Drag to reorder this resume section`
              : undefined
          }
        >
          {isReorderable && (
            <IconGripVertical size={13} className="shrink-0 opacity-50" />
          )}
          <Icon size={14} />
          {name}
        </button>
      );
    });
  };

  const saveDraft = () => {
    const draft = stripTransientUploadReferences(resume);
    window.localStorage.setItem("airesume-draft", JSON.stringify(draft));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => {
    setResume({ ...cloneResume(EMPTY_RESUME), templateName: validInitial });
    setPendingFiles({});
    window.localStorage.removeItem("airesume-draft");
  };

  const loadDemo = () => {
    setResume({ ...cloneResume(DEMO_RESUME), templateName: validInitial });
    setPendingFiles({});
  };


  //! ==================== Handle Pre Process  =======================
  const handlePreProcessingResume = async () => {
    try {
      setIsProceeding(true);
      const formData = buildResumeMultipartFormData(resume, pendingFiles);

      const response = await fetch(
        process.env.NEXT_PUBLIC_RESUME_DATA_UPLOAD_TO_DB_URL,
        {
          method: "POST",
          body: formData,
        },
      );

      const contentType = response.headers.get("content-type");
      let result = null;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const textError = await response.text();
        throw new Error(
          `Server Error (${response.status}): ${textError || response.statusText}`,
        );
      }

      if (!response.ok) {
        const validationMessage = Array.isArray(result?.details)
          ? result.details
              .map((detail) => {
                if (typeof detail === "string") return detail;
                const path = Array.isArray(detail?.path)
                  ? detail.path.join(".")
                  : detail?.path || "request";
                return `${path}: ${detail?.message || "Validation failed"}`;
              })
              .join("\n")
          : result?.details
            ? String(result.details)
            : null;

        throw new Error({
          message:
            result?.message ||
            result?.error ||
            validationMessage ||
            `Failed to upload resume (Status: ${response.status}).`,
          details: result?.details,
        });
      }

      const emailId = result.data?.contactInfo?.primaryEmail;
      const fullName = result.data?.basicInfo?.fullName;

      if (!emailId || typeof emailId !== "string" || !emailId.includes("@")) {
        throw new Error(
          "A valid primary email address is required in your resume contact details to proceed.",
        );
      }

      const safeFullName =
        typeof fullName === "string" && fullName.trim()
          ? fullName.trim()
          : "Candidate";
      const today = new Date();

      const document_id = result.data?._id || result.data?.id;

      if (!document_id) {
        throw new Error(
          "Resume was created, but document ID was not returned.",
        );
      }

      const targetUrl = `/print-resume/${document_id}?template=${validInitial}`;
      setResumeId(document_id);

      // ==========================================
      // AUTH CHECK & SESSION VALIDATION
      // ==========================================
      let currentUserId = null;

      try {
        const authRes = await fetch(process.env.NEXT_PUBLIC_LOGGEDIN_USER, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (authRes.ok) {
          const authData = await authRes.json();
          if (
            authData &&
            (authData.userName || authData.userEmail || authData.id)
          ) {
            currentUserId = authData.id;
            setUserId(currentUserId);
          }
        }
      } catch (err) {
        console.warn("Session check query skipped or failed:", err);
      }

      // If user is not logged in, attempt seamless automated signup
      if (!currentUserId) {
        try {
          const convenientSignup = await signup(emailId, safeFullName, today);

          if (convenientSignup) {
            const credentials =
              convenientSignup.data?.credentials || convenientSignup.credentials;
            if (credentials) {
              currentUserId = credentials.id;
              setUserId(currentUserId);
              await login(credentials.emailId, credentials.rawPassword);
            }
          }
        } catch (signupError) {
          const errMessage = (signupError.message || "").toLowerCase();
          if (
            errMessage.includes("already exists") ||
            errMessage.includes("unprocessable") ||
            errMessage.includes("duplicate")
          ) {
            setPendingRedirectUrl(targetUrl);
            setShowLoginModal(true);
            return;
          } else {
            throw signupError;
          }
        }
      }

      // ==========================================
      // ATTACH RESUME ID TO USER PROFILE
      // ==========================================
      if (currentUserId && document_id) {
        try {
          const addResumeRef = await addResumeId(document_id, currentUserId);

          if (addResumeRef && !addResumeRef.data && addResumeRef.message) {
            console.warn("Resume reference warning:", addResumeRef.message);
          }
        } catch (refError) {
          console.error("Failed to link resume ID to user profile:", refError);
        }
      }

      window.location.href = targetUrl;

    } catch (error) {
      console.error("Resume upload error:", error);
      showAlert(
        "Upload Error",
        error.message ||
          "An unexpected error occurred while processing your resume.",
        error.details ||
          "Please check the form and try again. There may be required field missing.",
      );
    } finally {
      setIsProceeding(false);
    }
  };
  const currentTemplate = useMemo(
    () =>
      TEMPLATE_DEFINITIONS.find((item) => item.id === resume.templateName) ||
      TEMPLATE_DEFINITIONS[0],
    [resume.templateName],
  );

  if (isProceeding) {
    return <PageLoader />;
  }
  return (
    <>
      <div className="no-print min-h-screen bg-slate-100/60 pb-12 lg:pb-0">
        <div className="sticky top-0 z-35 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 sm:px-6">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-600 sm:text-[11px]">
                <IconSparkles size={13} />
                Production Editor
              </div>
              <h1 className="truncate text-base font-extrabold text-slate-900 sm:text-xl">
                Build your resume
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm lg:hidden"
                onClick={() =>
                  setMobileMode((m) => (m === "edit" ? "preview" : "edit"))
                }
              >
                {mobileMode === "edit" ? (
                  <>
                    <IconEye size={14} /> Preview
                  </>
                ) : (
                  <>
                    <IconEdit size={14} /> Form
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={loadDemo}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <IconWand size={14} />
                <span className="hidden sm:inline">Sample</span>
              </button>

              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <IconRefresh size={14} />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                type="button"
                onClick={saveDraft}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <IconDeviceFloppy size={14} />
                <span>{saved ? "Saved" : "Save"}</span>
              </button>

              <button
                type="button"
                onClick={handlePreProcessingResume}
                className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 active:scale-95"
              >
                <IconPrinter size={14} />
                <span className="hidden sm:inline">Proceed </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="block lg:hidden w-full">
          {mobileMode === "edit" ? (
            <div className="bg-white p-3">
              <div className="sticky top-[53px] z-20 flex gap-1 overflow-x-auto border-b border-slate-200 bg-white py-2 scroll-slim">
                {renderTabs()}
              </div>

              <div className="mt-3">
                {activeTab === "Basics" && (
                  <BasicsTab
                    resume={resume}
                    update={update}
                    setPendingFiles={setPendingFiles}
                  />
                )}
                {activeTab === "Experience" && (
                  <ExperienceTab
                    resume={resume}
                    setResume={setResume}
                    update={update}
                  />
                )}
                {activeTab === "Education" && (
                  <EducationTab resume={resume} setResume={setResume} />
                )}
                {activeTab === "Skills" && (
                  <SkillsTab
                    resume={resume}
                    setResume={setResume}
                    update={update}
                  />
                )}
                {activeTab === "Projects" && (
                  <ProjectsTab resume={resume} setResume={setResume} />
                )}
                {activeTab === "Certificates" && (
                  <CertificatesTab
                    resume={resume}
                    setResume={setResume}
                    update={update}
                    setPendingFiles={setPendingFiles}
                  />
                )}
                {activeTab === "Publications" && (
                  <PublicationsTab
                    resume={resume}
                    setResume={setResume}
                    setPendingFiles={setPendingFiles}
                  />
                )}
                {activeTab === "Achievements" && (
                  <AchievementsTab
                    resume={resume}
                    setResume={setResume}
                    setPendingFiles={setPendingFiles}
                  />
                )}
                {activeTab === "Additional" && (
                  <AdditionalTab
                    resume={resume}
                    setResume={setResume}
                    update={update}
                  />
                )}
                {activeTab === "More" && (
                  <MoreTab
                    resume={resume}
                    update={update}
                    setResume={setResume}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-200 min-h-screen overflow-x-auto flex justify-center">
              <div className="min-w-[794px] bg-white shadow-xl origin-top transform scale-[0.45] sm:scale-[0.6]">
                <ResumeRenderer resumeData={resume} />
              </div>
            </div>
          )}
        </div>

        {/* Desktop Split Workspace */}
        <div
          ref={editorRef}
          className="hidden lg:flex w-full min-w-0 overflow-hidden"
          style={{ height: "calc(100vh - 54px)" }}
        >
          <aside
            className="border-r border-slate-200 bg-white shrink-0 overflow-hidden flex flex-col"
            style={{ width: `${formWidth}px` }}
          >
            <div className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur scroll-slim">
              {renderTabs()}
            </div>

            <div
              className="scroll-slim overflow-y-auto flex-1 p-2"
              style={{ maxHeight: "calc(100vh - 54px - 49px)" }}
            >
              {activeTab === "Basics" && (
                <BasicsTab
                  resume={resume}
                  update={update}
                  setPendingFiles={setPendingFiles}
                />
              )}
              {activeTab === "Experience" && (
                <ExperienceTab
                  resume={resume}
                  setResume={setResume}
                  update={update}
                />
              )}
              {activeTab === "Education" && (
                <EducationTab resume={resume} setResume={setResume} />
              )}
              {activeTab === "Skills" && (
                <SkillsTab
                  resume={resume}
                  setResume={setResume}
                  update={update}
                />
              )}
              {activeTab === "Projects" && (
                <ProjectsTab resume={resume} setResume={setResume} />
              )}
              {activeTab === "Certificates" && (
                <CertificatesTab
                  resume={resume}
                  setResume={setResume}
                  update={update}
                  setPendingFiles={setPendingFiles}
                />
              )}
              {activeTab === "Publications" && (
                <PublicationsTab
                  resume={resume}
                  setResume={setResume}
                  setPendingFiles={setPendingFiles}
                />
              )}

              {activeTab === "Achievements" && (
                <AchievementsTab
                  resume={resume}
                  setResume={setResume}
                  setPendingFiles={setPendingFiles}
                />
              )}
              {activeTab === "Additional" && (
                <AdditionalTab
                  resume={resume}
                  setResume={setResume}
                  update={update}
                />
              )}
              {activeTab === "More" && (
                <MoreTab
                  resume={resume}
                  update={update}
                  setResume={setResume}
                />
              )}
              <div className="h-16" />
            </div>
          </aside>

          {/* Draggable Divider */}
          <div
            className="relative z-[100] h-full shrink-0"
            style={{
              width: `${DIVIDER_HIT_WIDTH}px`,
              marginLeft: `-${DIVIDER_HIT_WIDTH / 2}px`,
              marginRight: `-${DIVIDER_HIT_WIDTH / 2}px`,
              cursor: "col-resize",
              touchAction: "none",
            }}
            onMouseDown={startDragging}
            role="separator"
          >
            <div
              className="absolute inset-0 z-[101]"
              style={{ cursor: "col-resize" }}
            />
            <div
              className={`pointer-events-none absolute inset-y-0 left-1/2 z-[102] w-px -translate-x-1/2 transition-colors ${
                isDragging ? "bg-indigo-500" : "bg-slate-300"
              }`}
            />
            <div
              className={`pointer-events-none absolute left-1/2 top-1/2 z-[103] h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity ${
                isDragging
                  ? "bg-indigo-500 opacity-100"
                  : "bg-slate-400 opacity-0"
              }`}
            />
          </div>

          <section className="min-w-0 min-h-0 flex-1 overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur">
              <div className="min-w-0">
                <strong className="block truncate text-xs font-semibold text-slate-900 sm:text-sm">
                  {currentTemplate.name}
                </strong>
                <span className="text-[11px] text-slate-500">
                  Live preview ·{" "}
                  {currentTemplate.hasAvatar
                    ? "ATS with Avatar"
                    : "100% Text ATS"}
                </span>
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded text-slate-700 hover:bg-slate-100"
                  onClick={() => setZoom((z) => Math.max(35, z - 5))}
                >
                  <IconMinus size={13} />
                </button>
                <span className="min-w-[36px] text-center text-xs font-semibold text-slate-700">
                  {zoom}%
                </span>
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded text-slate-700 hover:bg-slate-100"
                  onClick={() => setZoom((z) => Math.min(100, z + 5))}
                >
                  <IconPlus size={13} />
                </button>
              </div>
            </div>

            <div
              className="scroll-slim overflow-auto bg-gradient-to-br from-slate-100 to-slate-200/50 p-6 flex-1"
              style={{ height: "calc(100vh - 54px - 45px)" }}
            >
              <div
                style={{
                  width: `${794 * (zoom / 100)}px`,
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top left",
                    width: "794px",
                  }}
                >
                  <ResumeRenderer resumeData={resume} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div id="resume-print-area" className="hidden print:block">
        <ResumeRenderer resumeData={resume} />
      </div>

      {/* Professional Alert Modal */}
      {alertModal.isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            padding: "16px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "400px",
              borderRadius: "16px",
              backgroundColor: "#ffffff",
              padding: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setAlertModal({ isOpen: false, title: "", message: "" })
              }
              style={{
                position: "absolute",
                right: "16px",
                top: "16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconX size={20} />
            </button>

            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}
            >
              <div
                style={{
                  display: "flex",
                  height: "40px",
                  width: "40px",
                  flexShrink: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  backgroundColor: "#eff6ff",
                  color: "#3b82f6",
                }}
              >
                <IconInfoCircle size={22} />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#0f172a",
                  }}
                >
                  {alertModal.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    lineHeight: "1.5",
                    color: "#475569",
                  }}
                >
                  <span style={{ color: "red" }}> {alertModal.message}</span>{" "}
                  <br />
                  <span>{alertModal.details}</span>
                </p>
              </div>
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setAlertModal({ isOpen: false, title: "", message: "" })
                }
                style={{
                  borderRadius: "10px",
                  backgroundColor: "#4f46e5",
                  border: "none",
                  color: "#ffffff",
                  padding: "10px 20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                }}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing User Modal */}
      {showLoginModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            padding: "16px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "420px",
              borderRadius: "16px",
              backgroundColor: "#ffffff",
              padding: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              style={{
                position: "absolute",
                right: "16px",
                top: "16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconX size={20} />
            </button>

            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}
            >
              <div
                style={{
                  display: "flex",
                  height: "40px",
                  width: "40px",
                  flexShrink: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  backgroundColor: "#e0e7ff",
                  color: "#4f46e5",
                }}
              >
                <IconAlertCircle size={22} />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#0f172a",
                  }}
                >
                  User already exists!
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    lineHeight: "1.5",
                    color: "#475569",
                  }}
                >
                  Please login first, otherwise your data will be lost when you
                  proceed further.
                </p>
              </div>
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  if (pendingRedirectUrl) {
                    window.location.href = pendingRedirectUrl;
                  }
                }}
                style={{
                  borderRadius: "12px",
                  backgroundColor: "#f1f5f9",
                  border: "none",
                  color: "#475569",
                  padding: "10px 16px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Proceed Anyway
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  window.location.href = "/sign-in";
                }}
                style={{
                  borderRadius: "12px",
                  backgroundColor: "#4f46e5",
                  border: "none",
                  color: "#ffffff",
                  padding: "10px 18px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                }}
              >
                Log In Now
              </button>
            </div>
          </div>
        </div>
      )}

      {!hydrated && <div className="sr-only">Hydrating draft...</div>}
    </>
  );
}
