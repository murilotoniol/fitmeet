import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ArrowLeft} from 'phosphor-react-native';
import {getActivities, getActivityTypes} from '../../api/activities';
import {ActivityListItem} from '../../components/ui/ActivityListItem';
import {EmptyState} from '../../components/ui/EmptyState';
import {LoadingIndicator} from '../../components/ui/LoadingIndicator';
import {ScreenContainer} from '../../components/ui/ScreenContainer';
import {colors} from '../../styles/colors';
import type {Activity, ActivityType} from '../../types';
import {filterVisibleActivities} from '../../utils/activity-filters';

type ActivityByCategoryScreenProps = {
  navigation: any;
  route: any;
};

function ActivityByCategoryScreen({
  navigation,
  route,
}: ActivityByCategoryScreenProps) {
  const initialTypeId = route.params?.typeId ?? '';
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState(initialTypeId);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const activityTypes = await getActivityTypes();
        if (active) {
          setTypes(activityTypes);
          if (!initialTypeId && activityTypes.length > 0) {
            setSelectedTypeId(activityTypes[0].id);
          }
        }
      } catch {
        // silencioso
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [initialTypeId]);

  const loadActivities = useCallback(
    async (typeId: string, pageNumber: number) => {
      setLoadingActivities(true);
      try {
        const data = await getActivities({
          typeId,
          page: pageNumber,
          pageSize: 10,
        });
        const visible = filterVisibleActivities(data.activities);

        if (pageNumber === 1) {
          setActivities(visible);
        } else {
          setActivities(prev => [...prev, ...visible]);
        }

        setHasMore(data.next !== null);
      } catch {
        // silencioso
      } finally {
        setLoadingActivities(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (selectedTypeId) {
      setPage(1);
      void loadActivities(selectedTypeId, 1);
    }
  }, [selectedTypeId, loadActivities]);

  function handleLoadMore() {
    if (!hasMore || loadingActivities) {
      return;
    }
    const nextPage = page + 1;
    setPage(nextPage);
    void loadActivities(selectedTypeId, nextPage);
  }

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingIndicator />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <ArrowLeft size={24} color={colors.title} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ATIVIDADES</Text>
        <View style={{width: 24}} />
      </View>

      {/* Categorias horizontais */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
        style={styles.categoriesScroll}>
        {types.map(type => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.categoryChip,
              selectedTypeId === type.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedTypeId(type.id)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.categoryChipText,
                selectedTypeId === type.id && styles.categoryChipTextActive,
              ]}>
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de atividades */}
      <FlatList
        data={activities}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <ActivityListItem
            title={item.title}
            image={item.image}
            scheduledDate={item.scheduledDate}
            participantCount={item.participantCount}
            isPrivate={item.isPrivate}
            onPress={() =>
              navigation.navigate('ActivityDetails', {activityId: item.id})
            }
          />
        )}
        ListEmptyComponent={
          loadingActivities ? (
            <LoadingIndicator />
          ) : (
            <EmptyState
              title="Nenhuma atividade encontrada"
              description="Não existem atividades nesta categoria ainda."
            />
          )
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingActivities && activities.length > 0 ? (
            <LoadingIndicator message="Carregando mais..." />
          ) : null
        }
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
  categoriesScroll: {
    maxHeight: 48,
  },
  categoriesRow: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  categoryChipActive: {
    backgroundColor: colors.primary500,
    borderColor: colors.primary500,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
});

export {ActivityByCategoryScreen};
