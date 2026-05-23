import { ChevronLeft, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { getActivityTypes } from "@/api/activities";
import {
  deactivateUser,
  definePreferences,
  getPreferences,
  updateAvatar,
  updateUser,
} from "@/api/user";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/ui/category-card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ProfileAvatarEditor } from "@/components/ui/profile-avatar-editor";
import { useSession } from "@/hooks/use-session";
import { AppShell } from "@/layouts/app-shell";
import type { ActivityType } from "@/types";
import { ACTIVITY_TYPE_IMAGE, AVATAR_PLACEHOLDER } from "@/utils/image-placeholders";
import { formatCpf, isValidEmail, isValidPassword } from "@/utils/validators";

type EditProfilePageProps = {
  showDeactivateDialog?: boolean;
};

function EditProfilePage({ showDeactivateDialog = false }: EditProfilePageProps) {
  const navigate = useNavigate();
  const { token, user, refreshUser, logout } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    let active = true;

    const loadEditProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const [loadedTypes, loadedPreferences] = await Promise.all([
          getActivityTypes(token),
          getPreferences(token),
        ]);

        if (!active) {
          return;
        }

        setActivityTypes(loadedTypes);
        setSelectedTypeIds(loadedPreferences.map((preference) => preference.typeId));
        setName(user.name);
        setEmail(user.email);
      } catch (fetchError) {
        if (active) {
          const message =
            fetchError instanceof Error
              ? fetchError.message
              : "Não foi possível carregar o formulário do perfil.";
          setError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadEditProfile();

    return () => {
      active = false;
    };
  }, [token, user]);

  const avatarPreview = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }

    return user?.avatar ?? AVATAR_PLACEHOLDER;
  }, [avatarFile, user?.avatar]);

  useEffect(() => {
    return () => {
      if (avatarFile) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarFile, avatarPreview]);

  function togglePreference(typeId: string) {
    setSelectedTypeIds((current) =>
      current.includes(typeId)
        ? current.filter((currentTypeId) => currentTypeId !== typeId)
        : [...current, typeId],
    );
  }

  async function handleSubmit() {
    if (!token || !user) {
      return;
    }

    if (!name.trim()) {
      setError("Informe seu nome.");
      return;
    }

    if (!email.trim() || !isValidEmail(email.trim())) {
      setError("Informe um e-mail válido.");
      return;
    }

    if (password.trim() && !isValidPassword(password.trim())) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (selectedTypeIds.length === 0) {
      setError("Selecione ao menos uma preferência.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await updateUser(token, {
        name: name.trim(),
        email: email.trim(),
        password: password.trim() || undefined,
      });

      await definePreferences(token, selectedTypeIds);

      if (avatarFile) {
        await updateAvatar(token, avatarFile);
      }

      await refreshUser();
      navigate("/perfil", { replace: true });
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Não foi possível atualizar seu perfil.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate() {
    if (!token) {
      return;
    }

    setDeactivating(true);
    setError(null);

    try {
      await deactivateUser(token);
      logout();
      navigate("/login", { replace: true });
    } catch (deactivateError) {
      const message =
        deactivateError instanceof Error
          ? deactivateError.message
          : "Não foi possível desativar sua conta.";
      setError(message);
    } finally {
      setDeactivating(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[410px] space-y-10">
        <button
          type="button"
          onClick={() => navigate("/perfil")}
          className="inline-flex items-center gap-3 text-label text-[var(--color-title)] transition-opacity hover:opacity-80"
        >
          <ChevronLeft size={24} />
          Voltar para o perfil
        </button>

        {error ? <Alert variant="error" description={error} /> : null}

        <div className="flex flex-col items-center gap-8">
          <ProfileAvatarEditor image={avatarPreview} onChange={setAvatarFile} />

          <div className="w-full space-y-4">
            <Input
              label="Nome completo"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={loading || submitting}
            />

            <Input
              label="CPF"
              required
              value={formatCpf(user?.cpf ?? "")}
              readOnly
              disabled
              className="disabled:bg-[#F7F7F7] disabled:text-[var(--color-title)]"
            />

            <Input
              label="E-mail"
              required
              value={email}
              error={email && !isValidEmail(email) ? "Informe um e-mail válido." : undefined}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading || submitting}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Ex.: joao123"
              helperText="Preencha apenas se quiser trocar a senha."
              error={
                password && !isValidPassword(password)
                  ? "A senha deve ter pelo menos 6 caracteres."
                  : undefined
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading || submitting}
            />

            <div className="space-y-2">
              <div className="text-label text-[var(--color-title)]">
                Preferências <span className="text-[var(--color-danger)]">*</span>
              </div>

              {activityTypes.length === 0 && !loading ? (
                <EmptyState
                  title="Nenhum tipo encontrado"
                  description="Assim que houver tipos de atividade cadastrados, você poderá definir suas preferências."
                  className="min-h-[160px]"
                />
              ) : (
                <div className="flex gap-6 overflow-x-auto pb-2">
                  {activityTypes.map((type) => (
                    <CategoryCard
                      key={type.id}
                      title={type.name}
                      image={ACTIVITY_TYPE_IMAGE}
                      selected={selectedTypeIds.includes(type.id)}
                      onClick={() => togglePreference(type.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={loading || submitting || activityTypes.length === 0}
                className="text-white"
              >
                {submitting ? "Salvando..." : "Editar"}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/perfil")}
                disabled={submitting || loading}
                className="border-[#171717] text-[#171717] hover:border-[#171717] hover:text-[#171717]"
              >
                Cancelar
              </Button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/perfil/editar/desativar")}
            className="inline-flex items-center gap-3 text-label text-[var(--color-danger)] transition-opacity hover:opacity-80"
          >
            <Trash2 size={24} />
            Desativar minha conta
          </button>
        </div>
      </div>

      <ConfirmationDialog
        open={showDeactivateDialog}
        title="TEM CERTEZA QUE DESEJA DESATIVAR SUA CONTA?"
        description={
          <>
            Ao desativar sua conta, todos os seus dados e histórico de atividades serão
            permanentemente removidos. <strong>Esta ação é irreversível e não poderá ser desfeita.</strong>
          </>
        }
        cancelLabel="Cancelar"
        confirmLabel="Desativar"
        destructive
        loading={deactivating}
        hideCloseButton
        className="w-full max-w-[min(572px,calc(100vw-1.5rem))] rounded-[8px] p-6 sm:h-[296px] sm:w-[572px] sm:p-[48px]"
        contentClassName="flex h-full min-w-0 flex-col sm:gap-[32px] space-y-0"
        textBoxClassName="flex min-w-0 flex-col sm:gap-[12px] space-y-0 sm:h-[120px] sm:w-[476px] mb-0 sm:mb-0"
        titleClassName="text-title leading-[var(--text-title-line)] sm:h-[36px] sm:w-[476px] mb-0 sm:mb-0"
        descriptionClassName="sm:h-[72px] sm:w-[476px]"
        actionsClassName="gap-[10px] sm:justify-end"
        cancelButtonClassName="h-12 gap-[6px] rounded-[4px] border border-[1px] px-[24px] sm:w-[119px]"
        confirmButtonClassName="h-12 gap-[6px] rounded-[4px] border border-[1px] px-[24px] sm:w-[119px]"
        onCancel={() => navigate("/perfil/editar")}
        onConfirm={handleDeactivate}
      />
    </AppShell>
  );
}

export { EditProfilePage };
