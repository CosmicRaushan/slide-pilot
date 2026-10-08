"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  BellIcon,
  ChatCircleTextIcon,
  ChatTeardropTextIcon,
  GearIcon,
  ListIcon,
  LightbulbIcon,
  MagnifyingGlassIcon,
  SignOutIcon,
  WalletIcon,
  XIcon,
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
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const initials = user ? getInitials(user.name, user.email) : "U";
  const activeTab = pathname.split("/")[2];

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  }

  function navigateMobile(path: string) {
    setMobileMenuOpen(false);
    router.push(path);
  }

  return (
    <>
      <header
        className="
    fixed
    top-3 md:top-4
    left-1/2
    z-50
    w-[calc(100%-2rem)]
    max-w-[1400px]
    -translate-x-1/2
    rounded-2xl md:rounded-3xl
    border border-white/10
    bg-white/[0.02]
    backdrop-blur-3xl
    backdrop-saturate-200
    shadow-[0_8px_40px_rgba(0,0,0,0.35)]
   h-14 md:h-16 lg:h-[55px]
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
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-dashboard-menu"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-zinc-200 transition hover:bg-white/[0.1] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d09a82] md:hidden"
          >
            {mobileMenuOpen ? (
              <XIcon aria-hidden="true" className="size-5" />
            ) : (
              <ListIcon aria-hidden="true" className="size-5" />
            )}
          </button>
            <Button
                onClick={() => router.push("/dashboard")}
                className="hidden shrink-0 bg-transparent font-sans text-xl font-semibold tracking-[-0.04em] text-[#c98970] hover:bg-transparent md:inline-flex">
            SlidePilot
          </Button>
        </div>

        <div className="justify-self-center">
          <span className="font-sans text-lg font-semibold tracking-[-0.04em] text-[#c98970] md:hidden">
            SlidePilot
          </span>

          <div className="hidden md:block">
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
        </div>

        <div className="flex items-center justify-self-end">
          <div className="hidden items-center justify-end gap-3 md:flex">
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
          <button
            type="button"
            aria-label="Start a new chat"
            onClick={() => navigateMobile("/dashboard")}
            className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-zinc-200 transition hover:bg-white/[0.1] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d09a82] md:hidden"
          >
            <ChatCircleTextIcon
              aria-hidden="true"
              weight="regular"
              className="size-5"
            />
          </button>
        </div>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <nav
            id="mobile-dashboard-menu"
            aria-label="Dashboard navigation"
            className="fixed top-[4.5rem] bottom-4 left-4 z-50 flex w-[70vw] flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#171315]/95 p-3 text-zinc-100 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
          >
            <div className="flex min-w-0 items-center gap-3 border-b border-white/10 pb-4">
              <Avatar className="size-11 shrink-0 after:hidden">
                {user?.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : null}
                <AvatarFallback className="bg-[#d09a82] text-sm font-bold text-[#241817]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-zinc-400">{user?.email}</p>
              </div>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto py-3">
              {[
                {
                  label: "New chat",
                  href: "/dashboard",
                  icon: ChatTeardropTextIcon,
                  active: !activeTab || activeTab === "deck",
                },
                {
                  label: "Ideas",
                  href: "/dashboard/ideas",
                  icon: LightbulbIcon,
                  active: activeTab === "ideas",
                },
                {
                  label: "Wallet",
                  href: "/dashboard/wallet",
                  icon: WalletIcon,
                  active: activeTab === "wallet",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigateMobile(item.href)}
                    className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition ${
                      item.active
                        ? "border border-[#d09a82]/30 bg-[#d09a82]/15 text-[#e2b09b]"
                        : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-rose-200 transition hover:bg-rose-400/10"
              >
                <SignOutIcon aria-hidden="true" className="size-5" />
                Log out
              </button>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
