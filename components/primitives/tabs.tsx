"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils";

// Create a context to hold the variant
const TabsContext = React.createContext<{
  variant?: VariantProps<typeof tabsListVariants>["variant"];
}>({});

const tabsVariants = cva("flex flex-col gap-2", {
  variants: {
    variant: {
      default: "",
      underlined: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface TabsProps
  extends React.ComponentProps<typeof TabsPrimitive.Root>,
    VariantProps<typeof tabsVariants> {}

function Tabs({ className, variant, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ variant }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        className={cn(tabsVariants({ variant, className }))}
        {...props}
      />
    </TabsContext.Provider>
  );
}

const tabsListVariants = cva("inline-flex items-center justify-center", {
  variants: {
    variant: {
      default: "bg-muted text-muted-foreground h-9 w-fit rounded-lg p-[3px]",
      underlined: "bg-transparent p-0 border-b rounded-none",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface TabsListProps
  extends React.ComponentProps<typeof TabsPrimitive.List> {}
// Remove VariantProps<typeof tabsListVariants>

function TabsList({ className, ...props }: TabsListProps) {
  const { variant } = React.useContext(TabsContext); // Consume context
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant, className }))} // Use variant from context
      {...props}
    />
  );
}

const tabsTriggerVariants = cva(
  "  inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground h-[calc(100%-1px)] flex-1 gap-1.5 rounded-md border border-transparent px-2 py-1 data-[state=active]:shadow-sm",
        underlined:
          " rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface TabsTriggerProps
  extends React.ComponentProps<typeof TabsPrimitive.Trigger> {}
// Remove VariantProps<typeof tabsTriggerVariants>

function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  const { variant } = React.useContext(TabsContext); // Consume context
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant, className }))} // Use variant from context
      {...props}
    >
      <div className="flex-1 hover:bg-accent/60 px-4 py-4 rounded-md ">
        {props.children}
      </div>
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
