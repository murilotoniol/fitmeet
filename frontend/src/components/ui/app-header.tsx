import { CirclePlus, LogOut, UserRound } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";
import { AVATAR_PLACEHOLDER } from "@/utils/image-placeholders";

import { Button } from "./button";
import { ImageWithFallback } from "./image-with-fallback";
import { BrandLogo } from "./logo";

type AppHeaderProps = {
  className?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  onProfileClick?: () => void;
  onLogoutClick?: () => void;
  actionIcon?: ReactNode;
  profileImage?: string;
  profileName?: string;
  hideAction?: boolean;
  homeTo?: string;
};

function AppHeader({
  className,
  actionLabel = "Criar atividade",
  onActionClick,
  onProfileClick,
  onLogoutClick,
  actionIcon,
  profileImage,
  profileName = "Usuario",
  hideAction = false,
  homeTo = "/home",
}: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function handleProfileClick() {
    setMenuOpen(false);
    onProfileClick?.();
  }

  function handleLogoutClick() {
    setMenuOpen(false);
    onLogoutClick?.();
  }

  return (
    <header className={cn("h-[52px] w-full min-w-0 max-w-[1220px]", className)}>
      <div
        className={cn(
          "flex h-[52px] w-full min-w-0 max-w-[1220px] items-center justify-between gap-4 bg-white sm:gap-5",
        )}
      >
        <Link
          to={homeTo}
          className={cn(
            "inline-flex h-10 min-w-[119px] shrink-0 items-center rounded-lg no-underline outline-none transition-opacity hover:opacity-90",
            "focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2",
          )}
          aria-label="Ir para a pagina inicial"
        >
          <BrandLogo />
        </Link>

        <div
          className={cn(
            "flex h-[52px] shrink-0 items-center justify-end gap-5",
            hideAction ? "w-[52px]" : "w-[222px]",
          )}
        >
          {!hideAction ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onActionClick}
              className={cn(
                "h-10 w-[150px] shrink-0 gap-1 rounded-[4px] px-3 text-sm font-semibold shadow-none sm:text-label",
                "!text-white [&_svg]:!text-white",
              )}
            >
              {actionIcon ?? <CirclePlus size={16} strokeWidth={2} aria-hidden />}
              <span>{actionLabel}</span>
            </Button>
          ) : null}

          <div ref={menuRef} className="relative h-[52px] w-[52px] shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full border-2 border-[var(--color-primary-500)] bg-white transition-opacity hover:opacity-90"
              aria-label="Abrir menu do usuário"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <ImageWithFallback
                src={profileImage}
                fallbackSrc={AVATAR_PLACEHOLDER}
                alt={profileName}
                className="h-full w-full object-cover"
              />
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] z-40 min-w-[132px] rounded-[10px] border border-[var(--color-border)] bg-white p-1.5 shadow-[0_12px_32px_rgb(23_23_23_/_0.12)]"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleProfileClick}
                  className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-sm font-semibold text-[var(--color-title)] transition-colors hover:bg-[#fafafa]"
                >
                  <UserRound size={16} aria-hidden />
                  Perfil
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogoutClick}
                  className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-sm font-semibold text-[var(--color-danger)] transition-colors hover:bg-[#fafafa]"
                >
                  <LogOut size={16} aria-hidden />
                  Sair
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export { AppHeader };
