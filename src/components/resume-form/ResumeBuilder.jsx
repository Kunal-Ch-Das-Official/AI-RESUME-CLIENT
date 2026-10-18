// components/builder/ResumeBuilder.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  IconBriefcase,
  IconTrophy,
  IconCertificate,
  IconBook,
  IconCode,
  IconDeviceFloppy,
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
  IconEye,
  IconFileText,
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
import PageLoader from "../utils/page-loader/PageLoader";
import { savePendingResumeDraft } from "@/components/utils/resumeDraftStorage";

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

/**
 * Sortable Tab Item for Reorderable Priority Sections
 */
function SortableTabItem({ name, Icon, isActive, priority, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: name });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 30 : "auto",
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={onClick}
      title={`Priority ${priority} · Hold & drag to reorder this section`}
      className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors select-none cursor-grab active:cursor-grabbing ${
        isActive
          ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      } ${
        isDragging
          ? "opacity-90 shadow-md ring-2 ring-indigo-400 bg-white scale-105"
          : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <IconGripVertical
        size={13}
        className={`shrink-0 transition-opacity ${
          isDragging ? "opacity-100 text-indigo-600" : "opacity-50"
        }`}
      />
      <Icon size={14} />
      {name}
    </button>
  );
}

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

  const resumeRef = useRef(resume);
  useEffect(() => {
    resumeRef.current = resume;
  }, [resume]);

  const [activeTab, setActiveTab] = useState("Basics");
  const [activeTabHydrated, setActiveTabHydrated] = useState(false);
  const [saved, setSaved] = useState(false);
  const [zoom, setZoom] = useState(60);
  const [mobileZoom, setMobileZoom] = useState(45);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [pendingFiles, setPendingFiles] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingRedirectUrl, setPendingRedirectUrl] = useState("");
  const [isProceeding, setIsProceeding] = useState(false);

  // Exit & Draft Confirmation Modal State
  const [showExitModal, setShowExitModal] = useState(false);
  const isNavigatingAwayRef = useRef(false);

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

  // Configure @dnd-kit sensors for Mouse, Touch (with 200ms hold delay), and Keyboard
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Intercept Browser Reload / Tab Close (`beforeunload`)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isNavigatingAwayRef.current) return;
      // Auto-persist latest data to localStorage so nothing is lost
      try {
        const draft = stripTransientUploadReferences(resumeRef.current);
        window.localStorage.setItem("airesume-draft", JSON.stringify(draft));
      } catch (err) {
        console.warn("Could not auto-save on unload:", err);
      }
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Intercept Browser Back Button (`popstate`)
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.history.pushState({ builderGuard: true }, "", window.location.href);

    const handlePopState = () => {
      if (isNavigatingAwayRef.current) return;
      // Push state back so page doesn't instantly leave
      window.history.pushState(
        { builderGuard: true },
        "",
        window.location.href,
      );
      setShowExitModal(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleModalSaveAndExit = () => {
    try {
      const draft = stripTransientUploadReferences(resumeRef.current);
      window.localStorage.setItem("airesume-draft", JSON.stringify(draft));
    } catch (err) {
      console.warn("Could not save draft:", err);
    }
    setShowExitModal(false);
    isNavigatingAwayRef.current = true;
    window.history.back();
  };

  const handleModalDiscardAndExit = () => {
    setShowExitModal(false);
    isNavigatingAwayRef.current = true;
    window.history.back();
  };

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

  // Adjust default mobile zoom according to client screen width
  useEffect(() => {
    if (typeof window !== "undefined") {
      const screenW = window.innerWidth;
      if (screenW < 768) {
        const calculated = Math.min(
          60,
          Math.max(32, Math.floor((screenW - 32) / 7.94)),
        );
        setMobileZoom(calculated);
      }
    }
  }, []);

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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentOrder = orderedPriorityTabs.map(([name]) => name);
    const oldIndex = currentOrder.indexOf(active.id);
    const newIndex = currentOrder.indexOf(over.id);

    if (oldIndex < 0 || newIndex < 0) return;

    const nextOrder = arrayMove(currentOrder, oldIndex, newIndex);

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

  const renderStaticTab = ([name, Icon]) => (
    <button
      key={name}
      type="button"
      onClick={() => setActiveTab(name)}
      className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
        activeTab === name
          ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon size={14} />
      {name}
    </button>
  );

  const renderTabs = (contextId) => {
    const basicsTab = tabs.find(([name]) => name === "Basics");
    const additionalTab = tabs.find(([name]) => name === "Additional");
    const moreTab = tabs.find(([name]) => name === "More");
    const priorityIds = orderedPriorityTabs.map(([name]) => name);

    return (
      <DndContext
        id={contextId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {basicsTab && renderStaticTab(basicsTab)}

        <SortableContext
          items={priorityIds}
          strategy={horizontalListSortingStrategy}
        >
          {orderedPriorityTabs.map(([name, Icon]) => {
            const priority = getSectionPriority(
              name,
              PRIORITY_TAB_NAMES.indexOf(name),
            );
            return (
              <SortableTabItem
                key={name}
                name={name}
                Icon={Icon}
                isActive={activeTab === name}
                priority={priority}
                onClick={() => setActiveTab(name)}
              />
            );
          })}
        </SortableContext>

        {additionalTab && renderStaticTab(additionalTab)}
        {moreTab && renderStaticTab(moreTab)}
      </DndContext>
    );
  };

  const renderTabContent = () => (
    <>
      {activeTab === "Basics" && (
        <BasicsTab
          resume={resume}
          update={update}
          setPendingFiles={setPendingFiles}
        />
      )}
      {activeTab === "Experience" && (
        <ExperienceTab resume={resume} setResume={setResume} update={update} />
      )}
      {activeTab === "Education" && (
        <EducationTab resume={resume} setResume={setResume} />
      )}
      {activeTab === "Skills" && (
        <SkillsTab resume={resume} setResume={setResume} update={update} />
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
        <AdditionalTab resume={resume} setResume={setResume} update={update} />
      )}
      {activeTab === "More" && (
        <MoreTab resume={resume} update={update} setResume={setResume} />
      )}
    </>
  );

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

  const handlePreProcessingResume = async () => {
    try {
      setIsProceeding(true);
      isNavigatingAwayRef.current = true;

      const targetTemplate = TEMPLATE_DEFINITIONS.some(
        (item) => item.id === resume?.templateName,
      )
        ? resume.templateName
        : validInitial;
      const targetUrl = `/print-resume/draft?template=${encodeURIComponent(targetTemplate)}`;

      await savePendingResumeDraft({
        resume: { ...resume, templateName: targetTemplate },
        pendingFiles,
        templateName: targetTemplate,
        createdAt: new Date().toISOString(),
        savedResumeId: null,
      });

      window.location.href = targetUrl;
    } catch (error) {
      isNavigatingAwayRef.current = false;
      console.error("Resume draft staging error:", error);
      showAlert(
        "Unable to Continue",
        error?.message || "Unable to prepare your resume preview.",
        "Your resume was not uploaded. Please try again.",
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
      <div className="no-print min-h-screen bg-slate-100/60 pb-16 lg:pb-0">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-35 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
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

              {/* Mobile-Only Live Resume Preview Button in Navigation Header */}
              <button
                type="button"
                onClick={() => setShowMobilePreview(true)}
                className="inline-flex lg:hidden items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm active:scale-95"
              >
                <IconEye size={14} className="text-indigo-600" />
                <span>Preview</span>
              </button>

              <button
                type="button"
                onClick={handlePreProcessingResume}
                className="inline-flex items-center gap-1 rounded-lg
                bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5
                text-xs font-semibold text-white shadow-md shadow-indigo-500/20 active:scale-95"
              >
                <IconPrinter size={14} />
                <span className="hidden sm:inline">Proceed</span>
              </button>
            </div>
          </div>
        </header>

        {/* MOBILE VIEWPORT */}
        <main className="block lg:hidden w-full">
          <div className="sticky top-[53px] z-20 flex gap-1 overflow-x-auto border-b border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur scroll-slim shadow-sm">
            {renderTabs("resume-tabs-mobile")}
          </div>

          <div className="p-0 lg:p-3 pb-28">
            <div className="mx-auto max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200/80 p-0 lg:p-3 sm:p-5">
              {renderTabContent()}
            </div>
          </div>
        </main>

        {/* DESKTOP & IPAD VIEWPORT */}
        <div
          ref={editorRef}
          className="hidden lg:flex w-full min-w-0 overflow-hidden"
          style={{ height: "calc(100vh - 54px)" }}
        >
          <aside
            className="border-r border-slate-200 bg-white shrink-0 overflow-hidden flex flex-col"
            style={{ width: `min(${formWidth}px, 52vw)`, minWidth: "180px" }}
          >
            <div className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur scroll-slim">
              {renderTabs("resume-tabs-desktop")}
            </div>

            <div
              className="scroll-slim overflow-y-auto flex-1 p-2"
              style={{ maxHeight: "calc(100vh - 54px - 49px)" }}
            >
              {renderTabContent()}
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
              cursor: isDragging ? "col-resize" : "col-resize",
              touchAction: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
            onPointerDown={startDragging}
            role="separator"
            aria-label="Resize form and resume preview panels"
            aria-orientation="vertical"
            tabIndex={0}
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

          {/* Desktop Preview Panel */}
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
              className="scroll-slim overflow-auto bg-gradient-to-br from-slate-100 to-slate-200/50 p-2 sm:p-4 lg:p-6 flex-1"
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

      {/* MOBILE LIVE PREVIEW MODAL */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-sm lg:hidden">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="min-w-0 pr-2">
              <h3 className="truncate text-sm font-bold text-slate-900">
                {currentTemplate.name}
              </h3>
              <p className="text-[11px] text-slate-500">Live Mobile Preview</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded text-slate-700 hover:bg-slate-200"
                  onClick={() => setMobileZoom((z) => Math.max(30, z - 5))}
                >
                  <IconMinus size={13} />
                </button>
                <span className="min-w-[32px] text-center text-[11px] font-semibold text-slate-700">
                  {mobileZoom}%
                </span>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded text-slate-700 hover:bg-slate-200"
                  onClick={() => setMobileZoom((z) => Math.min(80, z + 5))}
                >
                  <IconPlus size={13} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowMobilePreview(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95"
              >
                <IconX size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-slate-200/80 p-3 flex justify-center items-start">
            <div
              style={{
                width: `${794 * (mobileZoom / 100)}px`,
              }}
              className="transition-all duration-150"
            >
              <div
                style={{
                  transform: `scale(${mobileZoom / 100})`,
                  transformOrigin: "top left",
                  width: "794px",
                }}
                className="shadow-2xl rounded"
              >
                <ResumeRenderer resumeData={resume} />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white p-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowMobilePreview(false)}
              className="flex-1 rounded-xl border border-slate-300 py-2.5 text-center text-xs font-semibold text-slate-700 active:bg-slate-50"
            >
              Back to Editing Form
            </button>
            <button
              type="button"
              onClick={handlePreProcessingResume}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-center text-xs font-semibold text-white shadow-md active:scale-95"
            >
              Proceed to Export
            </button>
          </div>
        </div>
      )}

      {/* Hidden Print Target */}
      <div id="resume-print-area" className="hidden print:block">
        <ResumeRenderer resumeData={resume} />
      </div>

      {/* Custom Exit & Draft Confirmation Modal */}
      {showExitModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(5px)",
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
              onClick={() => setShowExitModal(false)}
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
              style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}
            >
              <div
                style={{
                  display: "flex",
                  height: "44px",
                  width: "44px",
                  flexShrink: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  backgroundColor: "#eff6ff",
                  color: "#3b82f6",
                }}
              >
                <IconDeviceFloppy size={24} />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#0f172a",
                  }}
                >
                  Save resume draft?
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    lineHeight: "1.5",
                    color: "#475569",
                  }}
                >
                  You are about to navigate away. Would you like to save your
                  current form entries so you can continue editing later?
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
                onClick={handleModalDiscardAndExit}
                style={{
                  borderRadius: "10px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  color: "#64748b",
                  padding: "9px 15px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
              >
                Leave without Saving
              </button>

              <button
                type="button"
                onClick={handleModalSaveAndExit}
                style={{
                  borderRadius: "10px",
                  backgroundColor: "#4f46e5",
                  border: "none",
                  color: "#ffffff",
                  padding: "9px 18px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                }}
              >
                Save Draft &amp; Exit
              </button>
            </div>
          </div>
        </div>
      )}

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
                  Please log in to continue. Your resume draft has been saved
                  temporarily and will not be uploaded until you choose Print /
                  PDF.
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
                    window.sessionStorage.setItem(
                      "airesume-auth-return-to",
                      pendingRedirectUrl,
                    );
                  }
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
