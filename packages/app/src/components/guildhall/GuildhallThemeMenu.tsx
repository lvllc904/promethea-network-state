'use client';

import { BookOpen, Gamepad2, Monitor, Palette, TerminalSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@promethea/ui';
import { useMesh } from '@/components/providers/mesh-provider';
import { useHUD } from '@/lib/hud-store';
import type { ThemeKey } from '@/lib/guildhall-types';
import { AdaptiveThemeController } from '@/components/ui/AdaptiveThemeController';

const themes: Array<{ key: ThemeKey; label: string; description: string; icon: typeof Monitor }> = [
  { key: 'dark', label: 'Citadel', description: 'Institutional dark command surface', icon: Monitor },
  { key: 'theme-latex', label: 'LaTeX', description: 'Warm scholarly document surface', icon: BookOpen },
  { key: 'theme-16bit', label: '16-Bit', description: 'Retro visual substrate', icon: Gamepad2 },
  { key: 'theme-phosphor', label: 'Phosphor', description: 'Monochrome terminal substrate', icon: TerminalSquare },
];

export function GuildhallThemeMenu({ className = '' }: { className?: string }) {
  const { doc, themeState } = useMesh();
  const { activateFocusPanel } = useHUD();
  const currentTheme = (themeState?.theme || 'dark') as ThemeKey;

  const changeTheme = (value: string) => {
    if (!doc) return;
    const theme = value as ThemeKey;
    const ymap = doc.getMap('ui-theme');
    ymap.set('theme', theme);
    ymap.set('isAdaptive', false);
    activateFocusPanel(theme === 'theme-phosphor' ? 'PHOSPHOR' : theme === 'theme-16bit' ? '16BIT' : null);
  };

  const current = themes.find((theme) => theme.key === currentTheme) ?? themes[0];
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`guildhall-control inline-flex items-center gap-2 ${className}`}
          aria-label={`Theme: ${current.label}`}
        >
          <Palette className="h-4 w-4 text-guildhall-identity" aria-hidden="true" />
          <span>{current.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 border-guildhall-line bg-guildhall-panel p-2 text-guildhall-text shadow-2xl">
        <DropdownMenuLabel className="px-2 py-2 text-xs font-medium text-guildhall-muted">Interface surface</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={currentTheme} onValueChange={changeTheme}>
          {themes.map((theme) => {
            const Icon = theme.icon;
            return (
              <DropdownMenuRadioItem key={theme.key} value={theme.key} className="gap-3 py-3 focus:bg-guildhall-panel-raised">
                <Icon className="h-4 w-4 text-guildhall-muted" aria-hidden="true" />
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">{theme.label}</span>
                  <span className="text-xs text-guildhall-muted">{theme.description}</span>
                </span>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator className="bg-guildhall-line" />
        <div className="px-1 py-2">
          <AdaptiveThemeController />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
