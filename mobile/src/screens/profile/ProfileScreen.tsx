import React, {useCallback, useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ArrowLeft, Medal, PencilSimple} from 'phosphor-react-native';
import {
  getCreatorActivities,
  getParticipantActivities,
} from '../../api/activities';
import {ActivityListItem} from '../../components/ui/ActivityListItem';
import {Avatar} from '../../components/ui/Avatar';
import {EmptyState} from '../../components/ui/EmptyState';
import {LoadingIndicator} from '../../components/ui/LoadingIndicator';
import {ScreenContainer} from '../../components/ui/ScreenContainer';
import {useSession} from '../../hooks/useSession';
import {colors} from '../../styles/colors';
import type {Activity} from '../../types';
import {filterVisibleActivities} from '../../utils/activity-filters';

type ProfileScreenProps = {
  navigation: any;
};

const BASE_XP = 100;
const MULTIPLIER = 1.08;

function getXpForNextLevel(level: number) {
  return Math.ceil(BASE_XP * MULTIPLIER ** Math.max(level - 1, 0));
}

function getLevelProgress(totalXp: number) {
  let level = 1;
  let xpInLevel = Math.max(totalXp, 0);
  let xpForNext = getXpForNextLevel(level);

  while (xpInLevel >= xpForNext) {
    xpInLevel -= xpForNext;
    level += 1;
    xpForNext = getXpForNextLevel(level);
  }

  return {
    xpInLevel,
    xpForNext,
    percentage: Math.min((xpInLevel / xpForNext) * 100, 100),
  };
}

function ProfileScreen({navigation}: ProfileScreenProps) {
  const {user, loading: sessionLoading} = useSession();
  const [loading, setLoading] = useState(true);
  const [createdActivities, setCreatedActivities] = useState<Activity[]>([]);
  const [participantActivities, setParticipantActivities] = useState<
    Activity[]
  >([]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [created, participant] = await Promise.all([
        getCreatorActivities({page: 1, pageSize: 10}),
        getParticipantActivities({page: 1, pageSize: 10}),
      ]);
      setCreatedActivities(filterVisibleActivities(created.activities));
      setParticipantActivities(
        filterVisibleActivities(participant.activities),
      );
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile().catch(() => {});
  }, [loadProfile]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile().catch(() => {});
    });
    return unsubscribe;
  }, [navigation, loadProfile]);

  if (sessionLoading || !user) {
    return (
      <ScreenContainer>
        <LoadingIndicator message="Carregando perfil..." />
      </ScreenContainer>
    );
  }

  const xpProgress = getLevelProgress(user.xp ?? 0);

  return (
    <ScreenContainer>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <ArrowLeft size={24} color={colors.title} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PERFIL</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditProfile')}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <PencilSimple size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Cabeçalho do perfil */}
        <View style={styles.profileHeader}>
          <Avatar uri={user.avatar} size={120} />
          <Text style={styles.userName}>{user.name.toUpperCase()}</Text>
        </View>

        {/* XP e Nível */}
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <View>
              <Text style={styles.xpLabel}>Seu nível é</Text>
              <Text style={styles.xpLevel}>{user.level ?? 1}</Text>
            </View>
          </View>
          <View style={styles.xpProgressSection}>
            <View style={styles.xpProgressHeader}>
              <Text style={styles.xpProgressLabel}>
                Pontos para o próximo nível
              </Text>
              <Text style={styles.xpProgressValue}>
                {xpProgress.xpInLevel}/{xpProgress.xpForNext} pts
              </Text>
            </View>
            <View style={styles.xpBar}>
              <View
                style={[
                  styles.xpBarFill,
                  {width: `${xpProgress.percentage}%`},
                ]}
              />
            </View>
          </View>
        </View>

        {/* Conquistas */}
        <View style={styles.achievementCard}>
          {user.achievements && user.achievements.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsRow}>
              {user.achievements.map(achievement => (
                <View key={achievement.id} style={styles.achievementItem}>
                  <View style={styles.medalCircle}>
                    <Medal size={28} color={colors.highlight} weight="fill" />
                  </View>
                  <Text style={styles.achievementName} numberOfLines={2}>
                    {achievement.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noAchievements}>
              <Medal size={32} color={colors.placeholder} weight="light" />
              <Text style={styles.noAchievementsText}>
                Nenhuma conquista ainda
              </Text>
            </View>
          )}
        </View>

        {/* Minhas Atividades */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MINHAS ATIVIDADES</Text>
          {loading ? (
            <LoadingIndicator />
          ) : createdActivities.length === 0 ? (
            <EmptyState
              title="Você ainda não criou atividades"
              description="Quando criar sua primeira atividade, ela vai aparecer aqui."
            />
          ) : (
            <View style={styles.activityList}>
              {createdActivities.map(activity => (
                <ActivityListItem
                  key={activity.id}
                  title={activity.title}
                  image={activity.image}
                  scheduledDate={activity.scheduledDate}
                  participantCount={activity.participantCount}
                  isPrivate={activity.isPrivate}
                  onPress={() =>
                    navigation.navigate('ActivityDetails', {
                      activityId: activity.id,
                    })
                  }
                />
              ))}
            </View>
          )}
        </View>

        {/* Histórico */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HISTÓRICO DE ATIVIDADES</Text>
          {loading ? (
            <LoadingIndicator />
          ) : participantActivities.length === 0 ? (
            <EmptyState
              title="Nenhuma atividade no histórico"
              description="Quando você participar de atividades, elas vão aparecer aqui."
            />
          ) : (
            <View style={styles.activityList}>
              {participantActivities.map(activity => (
                <ActivityListItem
                  key={activity.id}
                  title={activity.title}
                  image={activity.image}
                  scheduledDate={activity.scheduledDate}
                  participantCount={activity.participantCount}
                  isPrivate={activity.isPrivate}
                  onPress={() =>
                    navigation.navigate('ActivityDetails', {
                      activityId: activity.id,
                    })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
    backgroundColor: colors.muted,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: '400',
    color: colors.title,
    letterSpacing: 1,
  },
  xpCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  xpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.title,
  },
  xpLevel: {
    fontSize: 44,
    fontWeight: '700',
    color: colors.title,
    marginTop: 4,
  },
  xpProgressSection: {gap: 8},
  xpProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpProgressLabel: {
    fontSize: 14,
    color: colors.text,
  },
  xpProgressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.title,
  },
  xpBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.progressBg,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.primary500,
  },
  achievementCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  achievementsRow: {
    gap: 16,
  },
  achievementItem: {
    width: 80,
    alignItems: 'center',
    gap: 6,
  },
  medalCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementName: {
    fontSize: 11,
    color: colors.title,
    textAlign: 'center',
  },
  noAchievements: {
    alignItems: 'center',
    gap: 6,
    padding: 12,
  },
  noAchievementsText: {
    fontSize: 12,
    color: colors.text,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.title,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  activityList: {
    gap: 12,
  },
});

export {ProfileScreen};
