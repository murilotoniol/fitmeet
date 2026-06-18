import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {getActivityTypes, getAllActivities} from '../../api/activities';
import {getPreferences} from '../../api/user';
import {ActivityCard} from '../../components/ui/ActivityCard';
import {CategoryCard} from '../../components/ui/CategoryCard';
import {EmptyState} from '../../components/ui/EmptyState';
import {Header} from '../../components/ui/Header';
import {LoadingIndicator} from '../../components/ui/LoadingIndicator';
import {ScreenContainer} from '../../components/ui/ScreenContainer';
import {useSession} from '../../hooks/useSession';
import {colors} from '../../styles/colors';
import type {Activity, ActivityType, Preference} from '../../types';
import {filterVisibleActivities} from '../../utils/activity-filters';

type HomeScreenProps = {
  navigation: any;
  route: any;
};

function shuffleArray<T>(arr: T[]): T[] {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function HomeScreen({navigation, route}: HomeScreenProps) {
  const {user} = useSession();
  const [loading, setLoading] = useState(true);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [needsPreferences, setNeedsPreferences] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [types, allActivities, prefs] = await Promise.all([
        getActivityTypes(),
        getAllActivities(),
        getPreferences(),
      ]);

      setActivityTypes(types);
      setActivities(filterVisibleActivities(allActivities));
      setPreferences(prefs);

      if (prefs.length === 0) {
        setNeedsPreferences(true);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar a home.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData().catch(() => {});
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData().catch(() => {});
    });
    return unsubscribe;
  }, [navigation, loadData]);

  useEffect(() => {
    const skipped = route.params?.skippedPreferences;
    if (needsPreferences && !loading && !skipped) {
      setNeedsPreferences(false);
      navigation.navigate('Preferences');
    }
  }, [needsPreferences, loading, navigation, route.params?.skippedPreferences]);

  const recommended = useMemo(() => {
    const prefTypeIds = new Set(preferences.map(p => p.typeId));
    const typeIdByName = new Map(activityTypes.map(t => [t.name, t.id]));

    const filtered =
      prefTypeIds.size > 0
        ? activities.filter(a =>
            prefTypeIds.has(typeIdByName.get(a.type) ?? ''),
          )
        : shuffleArray(activities);

    return filtered.slice(0, 8);
  }, [activities, activityTypes, preferences]);

  const initialCategoryId = useMemo(() => {
    if (preferences.length > 0) {
      return preferences[0].typeId;
    }
    return activityTypes[0]?.id ?? '';
  }, [preferences, activityTypes]);

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingIndicator />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header
        userName={user?.name ?? ''}
        avatarUri={user?.avatar}
        onAvatarPress={() => navigation.navigate('Profile')}
        onAddPress={() => navigation.navigate('NewActivity')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Categorias */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitlePadding]}>CATEGORIAS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}>
            {activityTypes.map(type => (
              <CategoryCard
                key={type.id}
                title={type.name}
                image={type.image}
                onPress={() =>
                  navigation.navigate('ActivityByCategory', {
                    typeId: type.id,
                  })
                }
              />
            ))}
          </ScrollView>
        </View>

        {/* Recomendações */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECOMENDAÇÕES</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ActivityByCategory', {
                  typeId: initialCategoryId,
                })
              }>
              <Text style={styles.seeMore}>Ver Mais</Text>
            </TouchableOpacity>
          </View>

          {recommended.length === 0 ? (
            <EmptyState
              title="Nenhuma atividade encontrada"
              description="Quando houver atividades, elas aparecerão aqui."
            />
          ) : (
            <FlatList
              data={recommended}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.activitiesRow}
              renderItem={({item}) => (
                <ActivityCard
                  title={item.title}
                  image={item.image}
                  scheduledDate={item.scheduledDate}
                  participantCount={item.participantCount}
                  onPress={() =>
                    navigation.navigate('ActivityDetails', {
                      activityId: item.id,
                    })
                  }
                />
              )}
            />
          )}
        </View>

        {/* Seções por tipo */}
        {activityTypes
          .map(type => ({
            type,
            items: activities.filter(a => a.type === type.name),
          }))
          .filter(s => s.items.length > 0)
          .slice(0, 4)
          .map(section => (
            <View key={section.type.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {section.type.name.toUpperCase()}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('ActivityByCategory', {
                      typeId: section.type.id,
                    })
                  }>
                  <Text style={styles.seeMore}>Ver Mais</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={section.items.slice(0, 6)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.activitiesRow}
                renderItem={({item}) => (
                  <ActivityCard
                    title={item.title}
                    image={item.image}
                    scheduledDate={item.scheduledDate}
                    participantCount={item.participantCount}
                    onPress={() =>
                      navigation.navigate('ActivityDetails', {
                        activityId: item.id,
                      })
                    }
                  />
                )}
              />
            </View>
          ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  scrollContent: {paddingBottom: 24},
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.title,
    letterSpacing: 0.5,
  },
  sectionTitlePadding: {
    paddingHorizontal: 20,
  },
  seeMore: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary500,
  },
  categoriesRow: {
    paddingHorizontal: 16,
    gap: 4,
  },
  activitiesRow: {
    paddingHorizontal: 20,
    gap: 12,
  },
  errorBox: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
  },
});

export {HomeScreen};
