import React, {useCallback, useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ArrowLeft} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';
import {getActivityTypes} from '../../api/activities';
import {definePreferences, getPreferences} from '../../api/user';
import {Button} from '../../components/ui/Button';
import {CategoryCard} from '../../components/ui/CategoryCard';
import {LoadingIndicator} from '../../components/ui/LoadingIndicator';
import {ScreenContainer} from '../../components/ui/ScreenContainer';
import {colors} from '../../styles/colors';
import type {ActivityType} from '../../types';

type PreferencesScreenProps = {
  navigation: any;
  route: any;
};

function PreferencesScreen({navigation, route}: PreferencesScreenProps) {
  const fromEdit = route.params?.fromEdit ?? false;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [activityTypes, preferences] = await Promise.all([
        getActivityTypes(),
        getPreferences(),
      ]);
      setTypes(activityTypes);
      setSelected(new Set(preferences.map(p => p.typeId)));
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar as categorias.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData().catch(() => {});
  }, [loadData]);

  function toggleType(typeId: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(typeId)) {
        next.delete(typeId);
      } else {
        next.add(typeId);
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await definePreferences(Array.from(selected));
      Toast.show({
        type: 'success',
        text1: 'Preferências salvas!',
      });
      navigation.goBack();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar as preferências.';
      Toast.show({type: 'error', text1: 'Erro', text2: message});
    } finally {
      setSaving(false);
    }
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
        {fromEdit ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <ArrowLeft size={24} color={colors.title} />
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {fromEdit ? 'EDITAR PREFERÊNCIAS' : 'SELECIONE SUAS PREFERÊNCIAS'}
        </Text>
        <Text style={styles.subtitle}>
          Escolha os tipos de atividade que mais te interessam. Assim
          podemos te recomendar atividades relevantes.
        </Text>

        <View style={styles.grid}>
          {types.map(type => (
            <CategoryCard
              key={type.id}
              title={type.name}
              image={type.image}
              selected={selected.has(type.id)}
              onPress={() => toggleType(type.id)}
            />
          ))}
        </View>

        <Button
          title={saving ? 'Salvando...' : 'Salvar preferências'}
          onPress={handleSave}
          loading={saving}
          style={styles.saveButton}
        />

        {!fromEdit ? (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('Home', { skippedPreferences: true })}>
            <Text style={styles.skipText}>Pular por enquanto</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  content: {
    padding: 24,
    paddingTop: 0,
    gap: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    color: colors.title,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveButton: {
    width: '100%',
    marginTop: 16,
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    fontSize: 14,
    color: colors.text,
    textDecorationLine: 'underline',
  },
});

export {PreferencesScreen};
