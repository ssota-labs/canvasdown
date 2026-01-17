'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EXAMPLES, type Example } from '@/lib/examples';

interface ExampleSelectorProps {
  onSelect: (example: Example) => void;
  currentExampleId?: string;
}

export function ExampleSelector({ onSelect }: ExampleSelectorProps) {
  const examplesByCategory = {
    basic: EXAMPLES.filter(ex => ex.category === 'basic'),
    advanced: EXAMPLES.filter(ex => ex.category === 'advanced'),
    workflow: EXAMPLES.filter(ex => ex.category === 'workflow'),
    custom: EXAMPLES.filter(ex => ex.category === 'custom'),
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Examples
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel>Select an Example</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {Object.entries(examplesByCategory).map(([category, examples]) => {
            if (examples.length === 0) return null;
            return (
              <div key={category}>
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
                  {category}
                </DropdownMenuLabel>
                {examples.map(example => (
                  <DropdownMenuItem
                    key={example.id}
                    onClick={() => onSelect(example)}
                    className="flex flex-col items-start gap-1 py-3"
                  >
                    <div className="font-medium">{example.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {example.description}
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </div>
            );
          })}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
