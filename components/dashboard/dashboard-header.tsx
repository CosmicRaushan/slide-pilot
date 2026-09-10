"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  BellIcon,
  GearIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { authClient } from "@/src/lib/auth.client";

type DashboardHeaderProps = {
  user?: {
    name: string;
    email: string;
    image?: string | null;
  };
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};

function getInitials(name: string, email: string) {
  const source = name.trim() || email;
  const initials = source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return initials || "U";
}

export function DashboardHeader({
  user,
  searchValue,
  onSearchChange,
}: DashboardHeaderProps) {
  const router = useRouter();
    const initials = user ? getInitials(user.name, user.email) : "U";
 


  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  }

  return (
    <header
      className="
    fixed
    top-4
    left-1/2
    z-50
    w-[calc(100%-2rem)]
    max-w-[1400px]
    -translate-x-1/2
    rounded-4xl
    border border-white/10
    bg-white/[0.02]
    backdrop-blur-3xl
    backdrop-saturate-200
    shadow-[0_8px_40px_rgba(0,0,0,0.35)]
   h-16 lg:h-[55px]
  "
    >
      <div
        className="
    mx-auto
    grid
    h-full
    w-full
    max-w-[1440px]
    grid-cols-[1fr_auto_1fr]
    items-center
    px-5
    sm:px-8
  "
      >
        <div className="flex items-center">
            <Button
                onClick={() => router.push("/dashboard")}
                className="shrink-0 font-sans text-xl font-semibold tracking-[-0.04em] text-[#c98970] bg-transparent hover:bg-tranparent">
            SlidePilot
          </Button>
        </div>

        <div className="hidden sm:block">
          <InputGroup
            className="
              h-9
              w-[420px]
              lg:w-[520px]
              rounded-4xl
              border
              border-white/10
              bg-white/[0.04]
              backdrop-blur-xl
              has-[[data-slot=input-group-control]:focus-visible]:border-[#f59e0b]/40
              has-[[data-slot=input-group-control]:focus-visible]:bg-white/[0.08]
              has-[[data-slot=input-group-control]:focus-visible]:ring-0
            "
          >
            <InputGroupAddon>
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="size-4 text-zinc-600"
              />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search pitchDeck....."
              aria-label="Search pitchDeck"
              value={searchValue}
              onChange={
                onSearchChange
                  ? (event) => onSearchChange(event.target.value)
                  : undefined
              }
              className="h-9 text-zinc-200 placeholder:text-zinc-500"
            />
          </InputGroup>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="
        size-9
        rounded-xl
        border
        border-white/10
        bg-white/[0.05]
        backdrop-blur-xl
        text-zinc-400
        hover:bg-white/[0.10]
        hover:text-white
        hover:scale-105
      "
          >
            <BellIcon aria-hidden="true" className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={
                user
                  ? `Open account menu for ${user.name}`
                  : "Open account menu"
              }
              className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/[0.08] font-sans text-sm font-semibold tracking-[0.04em] text-[#d09a82] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_25px_rgba(0,0,0,0.3)] transition-all hover:border-[#b97861]/70 hover:bg-[#b97861]/15 hover:text-[#e2b09b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b97861]"
            >
              <Avatar className="size-9 after:hidden">
                {user?.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : null}
                <AvatarFallback className="bg-transparent text-sm font-semibold text-[#d09a82]">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={14}
              className="w-72 min-w-72 rounded-2xl border border-white/20 bg-[#1a1a1d]/95 p-4 text-zinc-100 shadow-[0_24px_80px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.16)]"
            >
              <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#d09a82]/70 to-transparent" />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 text-zinc-100">
                  <div className="flex items-center gap-3 pb-4">
                    <Avatar className="size-11 after:hidden">
                      {user?.image ? (
                        <AvatarImage src={user.image} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="bg-[#d09a82] text-sm font-bold text-[#241817]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-sans text-sm font-semibold text-white">
                        {user?.name}
                      </p>
                      <p className="truncate font-sans text-xs text-zinc-400">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleSignOut}
                className="mt-4 min-h-0 justify-between rounded-xl border border-white/10 px-3 py-2.5 font-sans text-sm font-semibold text-zinc-300 focus:bg-rose-400/10 focus:text-rose-200"
              >
                Log out
                <DropdownMenuShortcut className="text-current">
                  <ArrowRightIcon aria-hidden="true" className="size-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem className="mt-2 min-h-0 gap-3 rounded-xl px-3 py-2.5 font-sans text-sm text-zinc-400 focus:bg-white/[0.06] focus:text-white">
                <GearIcon aria-hidden="true" className="size-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
