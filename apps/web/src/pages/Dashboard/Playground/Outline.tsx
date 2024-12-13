import { memo, useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  cn
} from "@dumpanddone/ui";
import { OutlineSectionType } from "@dumpanddone/types";

interface OutlineProps {
  sections: OutlineSectionType[];
}

export const Outline: React.FC<OutlineProps> = ({ sections }) => {
  return (
    <div className="h-full overflow-y-auto">
    <Accordion type="single" collapsible className="w-full flex flex-col gap-4">
      {sections.map((section, index) => (
        <Section
          key={section.title + index}
          title={section.title}
          description={section.description}
          index={index}
        />
      ))}
    </Accordion>
  </div>
  );
};

interface SectionProps {
  title: string;
  description: string;
  index: number;
}

const Section = memo<SectionProps>(({ title, description, index }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100); // Stagger the animation

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <AccordionItem
      value={`section-${index}`}
      className={cn(
        "w-3/4 transition-all duration-300 ease-in-out py-1 bg-muted text-muted-foreground hover:no-underline rounded-lg px-1",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <AccordionTrigger className="text-lg font-medium hover:no-underline bg-blend-multiply text-neutral-700 px-2 rounded-md items-start">
        <div className="w-full flex items-start gap-2">
        <span className="bg-gradient-to-b from-[#1a1a1c] to-[#3d3e43] w-6 h-6 text-base flex items-center justify-center rounded-sm border text-neutral-400">{index}</span>       
        <h3 className="py-0 text-base text-start">{title}</h3>
        </div>
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground px-10">
        {description}
      </AccordionContent>
    </AccordionItem>
  );
});

Section.displayName = "Section";

