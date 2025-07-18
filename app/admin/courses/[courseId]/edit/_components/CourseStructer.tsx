"use client";
import { AdminCourseSingularType } from "@/app/data/admin/admin-get-course";
import { Button } from "@/components/ui/button";
import { CardHeader, Card, CardTitle, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  DraggableSyntheticListeners,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  Delete,
  DeleteIcon,
  FileIcon,
  FileText,
  GripVertical,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import React, { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { reorderChapter, reOrderLessons } from "../actions";

type iAppProps = {
  data: AdminCourseSingularType;
};

type SortableItemProps = {
  id: string;
  children: (listeners: DraggableSyntheticListeners) => ReactNode;
  className?: string;
  data?: {
    type: "chapter" | "lesson";
    chapterId?: string; // only relevant for lesson
  };
};

export default function CourseStructre({ data }: iAppProps) {
  const initialItems =
    data.chapter.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.position,
      isOpen: true,
      lessons: chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.position,
      })),
    })) || [];
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setItems((prevItems) => {
      const updateItems =
        data.chapter.map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          order: chapter.position,
          isOpen:
            prevItems.find((item) => item.id === chapter.id)?.isOpen ?? true,
          lessons: chapter.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            order: lesson.position,
          })),
        })) || [];

      return updateItems;
    });
  }, [data]);

  function SortableItem({ id, data, className, children }: SortableItemProps) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: id, data: data });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn("touch-none", className, isDragging ? "z-10" : "")}
      >
        {children(listeners)}
      </div>
    );
  }

  function toggleChapter(chapterId: string) {
    setItems(
      items.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, isOpen: !chapter.isOpen }
          : chapter
      )
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id;
    const overId = over.id;
    const activeType = active.data.current?.type as "chapter" | "lesson";
    const overType = over.data.current?.type as "chapter" | "lesson";
    const courseId = data.id;

    if (activeType === "chapter") {
      let targetChapterId = null;

      if (overType === "chapter") {
        targetChapterId = overId;
      } else if (overType === "lesson") {
        targetChapterId = over.data.current?.chapterId ?? null;
      }

      if (!targetChapterId) {
        toast.error("Could not determine the chapter for reordering");
        return;
      }

      const oldIndex = items.findIndex((items) => items.id === activeId);
      const newIndex = items.findIndex((items) => items.id === targetChapterId);

      if (oldIndex === -1 || newIndex === -1) {
        toast.error("Could not find chapter old/new index for reordering");
        return;
      }

      const reorderdLoaclChapter = arrayMove(items, oldIndex, newIndex);
      const updatedChapterForState = reorderdLoaclChapter.map(
        (chapter, index) => ({
          ...chapter,
          order: index + 1,
        })
      );

      const previousItems = [...items];
      setItems(updatedChapterForState);

      if (courseId) {
        const chaptersToUpdate = updatedChapterForState.map((chapter) => ({
          id: chapter.id,
          position: chapter.order,
        }));

        const rorderPromise = () => reorderChapter(courseId, chaptersToUpdate);
        toast.promise(rorderPromise(), {
          loading: "Reordering chapters...",
          success: (result) => {
            if (result.status === "success") return result.message;
            throw new Error(result.message);
          },
          error: () => {
            setItems(previousItems);
            return "Failed to reorder chapters";
          },
        });
      }

      return;
    }

    if (activeType === "lesson" && overType === "lesson") {
      const chapterId = active.data.current?.chapterId;
      const overChapterId = active.data.current?.chapterId;
      console.log(chapterId, overChapterId);

      if (!chapterId || chapterId !== overChapterId) {
        toast.error(
          "Lesson move between different chapters or invalid chapter ID is not allwoed"
        );
        return;
      }

      const chapterIndex = items.findIndex(
        (chapter) => chapter.id === chapterId
      );

      if (chapterIndex === -1) {
        toast.error("Could not find chapter for lesson");
        return;
      }

      const chapterToUpdated = items[chapterIndex];
      const oldLessonIndex = chapterToUpdated.lessons.findIndex(
        (lesson) => lesson.id === activeId
      );
      const newLessonIndex = chapterToUpdated.lessons.findIndex(
        (lesson) => lesson.id === overId
      );

      if (oldLessonIndex === -1 || newLessonIndex === -1) {
        toast.error("Could not find lesson for reordering");
        return;
      }

      const reorderLessons = arrayMove(
        chapterToUpdated.lessons,
        oldLessonIndex,
        newLessonIndex
      );

      const updatedLessonForState = reorderLessons.map((lesson, index) => ({
        ...lesson,
        order: index + 1,
      }));
      const newItems = [...items];
      newItems[chapterIndex] = {
        ...chapterToUpdated,
        lessons: updatedLessonForState,
      };
      const previousItems = [...items];
      setItems(newItems);

      if (courseId) {
        const lessonToUpdate = updatedLessonForState.map((lesson) => ({
          id: lesson.id,
          position: lesson.order,
        }));

        const reorderLessonsPromise = () =>
          reOrderLessons(chapterId, lessonToUpdate, courseId);

        toast.promise(reorderLessonsPromise(), {
          loading: "Reordering Lessons...",
          success: (result) => {
            if (result.status === "success") return result.message;
            throw new Error(result.message);
          },
          error: () => {
            setItems(previousItems);
            return "Failed to reorder lessons";
          },
        });
      }
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      collisionDetection={rectIntersection}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle>Chapters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableItem
                id={item.id}
                data={{ type: "chapter" }}
                key={item.id}
              >
                {(listeners) => (
                  <Card>
                    <Collapsible
                      open={item.isOpen}
                      onOpenChange={() => toggleChapter(item.id)}
                    >
                      <div className="flex items-center  justify-between p-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" {...listeners}>
                            <GripVertical className="size-4" />
                          </Button>
                          <CollapsibleTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="flex items-center "
                            >
                              {item.isOpen ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <p className="cursor-pointer hover:text-primary pl-2">
                            {item.title}
                          </p>
                        </div>
                        <Button size="icon" variant="outline">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      <CollapsibleContent>
                        <div className="p-1">
                          <SortableContext
                            items={item.lessons.map((lesson) => lesson.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {item.lessons.map((lesson) => (
                              <SortableItem
                                key={lesson.id}
                                id={lesson.id}
                                data={{ type: "lesson", chapterId: item.id }}
                              >
                                {(lessonListeners) => (
                                  <div className="flex items-center justify-between p-2 hover:bg-accent rounded-sm">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        value="ghost"
                                        size="icon"
                                        {...lessonListeners}
                                      >
                                        <GripVertical className="size-4" />
                                      </Button>
                                      <FileText className="size-4" />
                                      <Link
                                        href={`/admin/course/${data.id}/${item.id}/${lesson.id}`}
                                      >
                                        {lesson.title}
                                      </Link>
                                    </div>

                                    <Button variant={"outline"} size="icon">
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </div>
                                )}
                              </SortableItem>
                            ))}
                          </SortableContext>
                          <div className="p-2">
                            <Button className="w-full" variant="outline">
                              Create New Lesson
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )}
              </SortableItem>
            ))}
          </SortableContext>
        </CardContent>
      </Card>
    </DndContext>
  );
}
