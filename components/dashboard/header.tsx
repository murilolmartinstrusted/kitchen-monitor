"use client";

import { MobileNav } from "./mobile-nav";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <MobileNav />
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
        {description && (
          <p className="hidden text-sm text-muted-foreground md:block">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
