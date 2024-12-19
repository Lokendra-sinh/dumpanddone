"use client"

import { memo, useEffect, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  cn,
  Button,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@dumpanddone/ui"
import { Trash2, Info } from 'lucide-react'
import { OutlineSectionType } from "@dumpanddone/types"

interface OutlineProps {
  sections: OutlineSectionType[]
  onDelete?: (index: number) => void
  onUpdate?: (index: number, updatedSection: OutlineSectionType) => void
  onInsert?: (index: number) => void
}

export const Outline: React.FC<OutlineProps> = ({ sections, onDelete, onUpdate, onInsert }) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-4 px-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to edit sections. Use the + button to add new sections.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-sm text-muted-foreground">Click to edit sections. Use + to add new ones.</span>
      </div>
      <Accordion type="single" collapsible className="w-full flex flex-col gap-4">
        {sections.map((section, index) => (
          <Section
            key={section.id + index}
            id={section.id}
            title={section.title}
            description={section.description}
            isEdited={section.isEdited}
            index={index}
            onDelete={() => onDelete?.(index)}
            onUpdate={(updatedSection) => onUpdate?.(index, updatedSection)}
            onInsert={() => onInsert?.(index)}
          />
        ))}
      </Accordion>
    </div>
  )
}

interface SectionProps {
  id: string;
  title: string;
  description: string;
  isEdited: boolean;
  index: number;
  onDelete?: () => void;
  onUpdate?: (updatedSection: OutlineSectionType) => void;
  onInsert?: () => void;
}

const Section = memo<SectionProps>(({ id, title, description, isEdited, index, onDelete, onUpdate, onInsert }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedTitle, setEditedTitle] = useState(title)
  const [editedDescription, setEditedDescription] = useState(description)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, index * 100)

    return () => clearTimeout(timer)
  }, [index])

  const handleSave = () => {
    const isContentChanged = editedTitle !== title || editedDescription !== description;
    onUpdate?.({
      id,
      title: editedTitle,
      description: editedDescription,
      isEdited: isEdited || isContentChanged,
    });
    setIsEditingTitle(false)
    setIsEditingDescription(false)
  }

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent accordion toggle
    setIsEditingTitle(true)
  }

  const handleDescriptionClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent accordion toggle
    setIsEditingDescription(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSave()
    }
    if (e.key === "Escape") {
      setIsEditingTitle(false)
      setIsEditingDescription(false)
      setEditedTitle(title)
      setEditedDescription(description)
    }
  }

  return (
    <div className="relative">
      <AccordionItem
        value={`section-${index}`}
        className={cn(
          "w-3/4 transition-all duration-300 ease-in-out py-3 px-4 bg-muted text-muted-foreground hover:no-underline rounded-lg",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div className="flex items-start justify-between gap-2 w-full">
          <div className="flex items-start gap-2 flex-1 min-w-0 pt-1">
            <span className="bg-gradient-to-b from-[#1a1a1c] to-[#3d3e43] w-6 h-6 text-base flex items-center justify-center rounded-sm border text-neutral-400">
              {index+1}
            </span>
            <div onClick={handleTitleClick} className="flex-1 min-w-0 text-lg font-medium text-neutral-700">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSave}
                  className="w-full bg-background px-2 py-1 rounded border"
                  style={{ minWidth: 0 }}
                  autoFocus
                />
              ) : (
                <h3 className="py-0 text-base text-start cursor-text">{title}</h3>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <AccordionTrigger className="!p-0 !m-0 hover:no-underline">
              <span className="sr-only">Toggle section</span>
            </AccordionTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation()
                onInsert?.()
              }}
            >
              <span className="text-lg">+</span>
              <span className="sr-only">Add new section</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.()
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete section</span>
            </Button>
          </div>
        </div>
        <AccordionContent className="text-muted-foreground px-8 py-2">
          <div onClick={handleDescriptionClick}>
            {isEditingDescription ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="w-full min-h-[100px] bg-background p-2 rounded border"
                autoFocus
              />
            ) : (
              <div className="cursor-text">{description}</div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  )
})

Section.displayName = "Section"

