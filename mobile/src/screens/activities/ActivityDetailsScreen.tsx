import React, {useCallback, useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowLeft,
  CalendarBlank,
  CalendarX,
  Check,
  Flag,
  Lock,
  PencilSimple,
  Prohibit,
  UserCheck,
  Users,
  X,
} from 'phosphor-react-native';
import MapView, {Marker} from 'react-native-maps';
import Toast from 'react-native-toast-message';
import {
  approveParticipant,
  checkInActivity,
  concludeActivity,
  deleteActivity,
  getActivity,
  getParticipants,
  subscribeToActivity,
  unsubscribeFromActivity,
} from '../../api/activities';
import {Avatar} from '../../components/ui/Avatar';
import {Button} from '../../components/ui/Button';
import {ConfirmDialog} from '../../components/ui/ConfirmDialog';
import {EmptyState} from '../../components/ui/EmptyState';
import {LoadingIndicator} from '../../components/ui/LoadingIndicator';
import {ScreenContainer} from '../../components/ui/ScreenContainer';
import {useSession} from '../../hooks/useSession';
import {colors} from '../../styles/colors';
import type {Activity, Participant, ParticipationStatus} from '../../types';
import {formatDateTime} from '../../utils/formatters';

type ActivityDetailsScreenProps = {
  navigation: any;
  route: any;
};

const CHECK_IN_WINDOW_MS = 30 * 60 * 1000;

function isCheckInWindowOpen(activity: Activity) {
  const ts = new Date(activity.scheduledDate).getTime();
  if (Number.isNaN(ts)) {
    return false;
  }
  return Date.now() >= ts - CHECK_IN_WINDOW_MS;
}

function ActivityDetailsScreen({
  navigation,
  route,
}: ActivityDetailsScreenProps) {
  const {activityId} = route.params;
  const {user} = useSession();
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [checkInCode, setCheckInCode] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [activityCanceled, setActivityCanceled] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentActivity = await getActivity(activityId);

      let loadedParticipants: Participant[] = [];
      try {
        loadedParticipants = await getParticipants(activityId);
      } catch (pErr) {
        if (currentActivity.creator.id === user?.id) {
          throw pErr;
        }
      }

      setActivity(currentActivity);
      setParticipants(loadedParticipants);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar a atividade.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [activityId, user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      void loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const isCreator = Boolean(
    activity && user && activity.creator.id === user.id,
  );
  const status: ParticipationStatus | null =
    activity?.userSubscriptionStatus ?? null;

  async function reloadData() {
    const current = await getActivity(activityId);
    let parts: Participant[] = [];
    try {
      parts = await getParticipants(activityId);
    } catch {
      // ignore for non-creator
    }
    setActivity(current);
    setParticipants(parts);
  }

  async function runAction(callback: () => Promise<unknown>) {
    setActionLoading(true);
    setError(null);
    try {
      await callback();
      await reloadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível concluir a ação.';
      setError(message);
      Toast.show({type: 'error', text1: 'Erro', text2: message});
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckIn() {
    if (!activity || !checkInCode.trim()) {
      setError('Informe o código de confirmação.');
      return;
    }
    await runAction(() =>
      checkInActivity(activity.id, checkInCode.trim()),
    );
  }

  async function handleCancel() {
    if (!activity) {
      return;
    }
    setActionLoading(true);
    try {
      await deleteActivity(activity.id);
      setActivityCanceled(true);
      setCancelDialogOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao cancelar.';
      setError(message);
    } finally {
      setActionLoading(false);
    }
  }

  // ── Render ──

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingIndicator />
      </ScreenContainer>
    );
  }

  if (activityCanceled) {
    return (
      <ScreenContainer>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={colors.title} />
          </TouchableOpacity>
        </View>
        <EmptyState
          title="Atividade cancelada"
          description="A atividade foi removida e não aparecerá mais nas listagens."
        />
      </ScreenContainer>
    );
  }

  if (!activity) {
    return (
      <ScreenContainer>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={colors.title} />
          </TouchableOpacity>
        </View>
        <EmptyState
          title="Atividade não encontrada"
          description="Ela pode ter sido removida ou você não tem acesso."
        />
      </ScreenContainer>
    );
  }

  const isCanceled = Boolean(activity.deletedAt);
  const isCompleted = Boolean(activity.completedAt);
  const checkInOpen = isCheckInWindowOpen(activity);
  const displayedCode =
    status === 'CHECKED_IN'
      ? activity.confirmationCode ?? checkInCode
      : checkInCode;

  return (
    <ScreenContainer>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.title} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DETALHES</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Imagem */}
        <Image
          source={{uri: activity.image}}
          style={styles.activityImage}
          resizeMode="cover"
        />

        {/* Info */}
        <Text style={styles.activityTitle}>
          {activity.title.toUpperCase()}
        </Text>
        <Text style={styles.activityDescription}>
          {activity.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <CalendarBlank size={18} color={colors.text} />
            <Text style={styles.metaText}>
              {formatDateTime(activity.scheduledDate)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={18} color={colors.text} />
            <Text style={styles.metaText}>{activity.participantCount}</Text>
          </View>
          {activity.isPrivate ? (
            <View style={styles.metaItem}>
              <Lock size={18} color={colors.text} />
              <Text style={styles.metaText}>Privada</Text>
            </View>
          ) : null}
        </View>

        {/* ── Status badges ── */}
        {isCanceled ? (
          <View style={[styles.statusBadge, styles.statusDanger]}>
            <CalendarX size={20} color={colors.white} />
            <Text style={styles.statusText}>Atividade cancelada</Text>
          </View>
        ) : isCompleted ? (
          <View style={[styles.statusBadge, styles.statusMuted]}>
            <Text style={styles.statusTextDark}>Atividade encerrada</Text>
          </View>
        ) : null}

        {/* ── Ações do organizador ── */}
        {isCreator && !isCanceled && !isCompleted ? (
          <View style={styles.actionsSection}>
            {!checkInOpen ? (
              <Button
                title="Editar"
                variant="outline"
                icon={<PencilSimple size={18} color={colors.primary500} />}
                onPress={() =>
                  navigation.navigate('EditActivity', {activityId})
                }
                disabled={actionLoading}
              />
            ) : (
              <Button
                title={actionLoading ? 'Encerrando...' : 'Encerrar atividade'}
                icon={<Flag size={20} color={colors.white} />}
                onPress={() =>
                  runAction(() => concludeActivity(activity.id))
                }
                loading={actionLoading}
              />
            )}
          </View>
        ) : null}

        {/* ── Ações do participante ── */}
        {!isCreator && !isCanceled && !isCompleted ? (
          <View style={styles.actionsSection}>
            {!status && !checkInOpen ? (
              <Button
                title={actionLoading ? 'Participando...' : 'Participar'}
                onPress={() =>
                  runAction(() => subscribeToActivity(activity.id))
                }
                loading={actionLoading}
              />
            ) : !status && checkInOpen ? (
              <View style={[styles.statusBadge, styles.statusMuted]}>
                <Text style={styles.statusTextDark}>
                  Atividade em andamento
                </Text>
              </View>
            ) : status === 'PENDING' ? (
              <View style={[styles.statusBadge, styles.statusPending]}>
                <Text style={styles.statusText}>Aguardando aprovação</Text>
              </View>
            ) : status === 'REJECTED' ? (
              <View style={[styles.statusBadge, styles.statusDanger]}>
                <Prohibit size={18} color={colors.white} />
                <Text style={styles.statusText}>Inscrição negada</Text>
              </View>
            ) : (status === 'APPROVED' || status === 'CHECKED_IN') &&
              checkInOpen ? (
              /* Check-in section */
              <View style={styles.checkInSection}>
                <Text style={styles.checkInTitle}>FAÇA SEU CHECK-IN</Text>
                <View style={styles.checkInRow}>
                  <TextInput
                    style={styles.checkInInput}
                    placeholder="Código de confirmação"
                    placeholderTextColor={colors.placeholder}
                    value={displayedCode}
                    onChangeText={setCheckInCode}
                    editable={status !== 'CHECKED_IN' && !actionLoading}
                  />
                  {status === 'CHECKED_IN' ? (
                    <View style={styles.checkInDone}>
                      <Check size={24} color={colors.white} weight="bold" />
                    </View>
                  ) : (
                    <Button
                      title="Confirmar"
                      onPress={handleCheckIn}
                      loading={actionLoading}
                      style={styles.checkInButton}
                    />
                  )}
                </View>
              </View>
            ) : status === 'APPROVED' && !checkInOpen ? (
              <Button
                title={
                  actionLoading ? 'Desinscrevendo...' : 'Desinscrever-se'
                }
                variant="outline"
                onPress={() =>
                  runAction(() => unsubscribeFromActivity(activity.id))
                }
                loading={actionLoading}
                style={styles.unsubscribeButton}
              />
            ) : null}
          </View>
        ) : null}

        {/* ── Mapa ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PONTO DE ENCONTRO</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: activity.address.latitude,
                longitude: activity.address.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}>
              <Marker
                coordinate={{
                  latitude: activity.address.latitude,
                  longitude: activity.address.longitude,
                }}
              />
            </MapView>
          </View>
        </View>

        {/* ── Participantes ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PARTICIPANTES</Text>
          {participants.length === 0 ? (
            <View style={styles.participantRow}>
              <Avatar uri={activity.creator.avatar} size={40} />
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>
                  {activity.creator.name}
                </Text>
                <Text style={styles.participantRole}>Organizador</Text>
              </View>
            </View>
          ) : (
            participants.map(p => (
              <View key={p.id} style={styles.participantRow}>
                <Avatar uri={p.user.avatar} size={40} />
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{p.user.name}</Text>
                  {p.user.id === activity.creator.id ? (
                    <Text style={styles.participantRole}>Organizador</Text>
                  ) : null}
                </View>

                {/* Aprovar/rejeitar */}
                {isCreator &&
                !actionLoading &&
                activity.isPrivate &&
                !isCompleted &&
                !isCanceled &&
                !checkInOpen &&
                p.user.id !== activity.creator.id &&
                p.approved !== true ? (
                  <View style={styles.approveActions}>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() =>
                        runAction(() =>
                          approveParticipant(
                            activity.id,
                            String(p.id),
                            true,
                          ),
                        )
                      }>
                      <Check size={18} color={colors.primary500} weight="bold" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() =>
                        runAction(() =>
                          approveParticipant(
                            activity.id,
                            String(p.id),
                            false,
                          ),
                        )
                      }>
                      <X size={18} color={colors.danger} weight="bold" />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>

        {/* ── Código do organizador ── */}
        {isCreator && checkInOpen && activity.confirmationCode ? (
          <View style={styles.codeCard}>
            <View style={styles.codeHeader}>
              <UserCheck size={24} color={colors.primary500} />
              <Text style={styles.codeLabel}>Código de check-in</Text>
            </View>
            <Text style={styles.codeValue}>
              {activity.confirmationCode}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <ConfirmDialog
        visible={cancelDialogOpen}
        title="CANCELAR ATIVIDADE?"
        description="Ao cancelar, a atividade será removida das listagens."
        confirmLabel="Cancelar atividade"
        destructive
        loading={actionLoading}
        onConfirm={handleCancel}
        onCancel={() => setCancelDialogOpen(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.title,
    letterSpacing: 0.5,
  },
  content: {
    paddingBottom: 40,
  },
  errorBox: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {fontSize: 13, color: colors.danger},
  activityImage: {
    width: '100%',
    height: 220,
    backgroundColor: colors.border,
  },
  activityTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: colors.title,
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 4,
  },
  statusDanger: {backgroundColor: colors.danger},
  statusPending: {backgroundColor: colors.primary500},
  statusMuted: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.text,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  statusTextDark: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  unsubscribeButton: {
    borderColor: colors.danger,
  },
  checkInSection: {
    gap: 12,
  },
  checkInTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.title,
    letterSpacing: 0.5,
  },
  checkInRow: {
    flexDirection: 'row',
    gap: 8,
  },
  checkInInput: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.title,
    backgroundColor: colors.white,
  },
  checkInDone: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInButton: {
    width: 120,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.title,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {flex: 1},
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.title,
  },
  participantRole: {
    fontSize: 12,
    color: colors.text,
  },
  approveActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 188, 125, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(231, 0, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeCard: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 8,
    backgroundColor: colors.muted,
    gap: 8,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  codeValue: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.title,
  },
});

export {ActivityDetailsScreen};
