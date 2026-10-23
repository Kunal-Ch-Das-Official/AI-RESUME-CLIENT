import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/** Shares the same mouse/touch/keyboard sensor behavior as ResumeBuilder tabs. */
export function SortableList({ items, onReorder, children }) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const sourceIndex = items.indexOf(String(active.id));
    const targetIndex = items.indexOf(String(over.id));
    if (sourceIndex < 0 || targetIndex < 0) return;
    onReorder(sourceIndex, targetIndex);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

const INTERACTIVE_SELECTOR =
  'input, textarea, select, button, a, [contenteditable=""], [contenteditable="true"], .ql-editor, .ql-toolbar';

/**
 * dnd-kit's KeyboardSensor calls preventDefault() on Space/Enter from ANY child
 * (no activator node is set), which blocks typing spaces/new lines in inputs and
 * the Quill editor. Drop drag activation for events coming from interactive/editable
 * elements so they behave normally.
 */
function guardListeners(listeners = {}) {
  const guarded = {};
  Object.keys(listeners).forEach((eventName) => {
    const handler = listeners[eventName];
    guarded[eventName] = (event) => {
      const target = event?.target;
      if (
        target instanceof Element &&
        target.closest(INTERACTIVE_SELECTOR) &&
        target !== event.currentTarget
      ) {
        return;
      }
      handler?.(event);
    };
  });
  return guarded;
}

/** A sortable wrapper; dragging the entry card gives live transforms/feedback. */
export function SortableCard({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(id) });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: "relative",
        zIndex: isDragging ? 20 : "auto",
        opacity: isDragging ? 0.92 : 1,
        touchAction: "manipulation",
      }}
      {...attributes}
      {...guardListeners(listeners)}
    >
      {children}
    </div>
  );
}