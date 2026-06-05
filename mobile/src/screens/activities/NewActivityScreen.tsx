import React, {useEffect, useMemo, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ArrowLeft, Camera} from 'phosphor-react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, {Marker} from 'react-native-maps';
import Toast from 'react-native-toast-message';
import {createActivity, getActivityTypes} from '../../api/activities';
import {Button} from '../../components/ui/Button';
import {CategoryCard} from '../../components/ui/CategoryCard';
import {Input} from '../../components/ui/Input';
import {LoadingIndicator} from '../../components/ui/LoadingIndicator';
import {ScreenContainer} from '../../components/ui/ScreenContainer';
import {colors} from '../../styles/colors';
import type {ActivityType, ImageAsset} from '../../types';

type NewActivityScreenProps = {
  navigation: any;
};

function NewActivityScreen({navigation}: NewActivityScreenProps) {
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [image, setImage] = useState<ImageAsset | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [marker, setMarker] = useState({
    latitude: -23.588197,
    longitude: -46.657634,
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const loaded = await getActivityTypes();
        if (active) {
          setTypes(loaded);
          setSelectedTypeId(loaded[0]?.id ?? '');
        }
      } catch {
        // silencioso
      } finally {
        if (active) {
          setLoadingTypes(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  async function handlePickImage() {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImagePreview(asset.uri ?? null);
      setImage({
        uri: asset.uri!,
        type: asset.type ?? 'image/jpeg',
        fileName: asset.fileName ?? 'activity.jpg',
      });
    }
  }

  const formattedDate = useMemo(() => {
    if (!scheduledDate) {
      return '';
    }
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(scheduledDate);
  }, [scheduledDate]);

  async function handleSubmit() {
    setError(null);

    if (!image) {
      setError('Selecione uma imagem para a atividade.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError('Preencha título e descrição da atividade.');
      return;
    }
    if (!selectedTypeId) {
      setError('Selecione um tipo de atividade.');
      return;
    }
    if (!scheduledDate) {
      setError('Informe a data da atividade.');
      return;
    }
    if (scheduledDate.getTime() <= Date.now()) {
      setError('Escolha uma data futura para a atividade.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createActivity({
        title: title.trim(),
        description: description.trim(),
        typeId: selectedTypeId,
        image,
        scheduledDate: scheduledDate.toISOString(),
        isPrivate,
        address: {
          latitude: marker.latitude,
          longitude: marker.longitude,
        },
      });

      Toast.show({type: 'success', text1: 'Atividade criada!'});
      navigation.replace('ActivityDetails', {activityId: created.id});
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível criar a atividade.';
      setError(message);
      Toast.show({type: 'error', text1: 'Erro', text2: message});
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <ArrowLeft size={24} color={colors.title} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>NOVA ATIVIDADE</Text>
          <View style={{width: 24}} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Imagem */}
          <TouchableOpacity
            style={styles.imageBox}
            onPress={handlePickImage}
            activeOpacity={0.7}>
            {imagePreview ? (
              <Image
                source={{uri: imagePreview}}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera size={32} color={colors.placeholder} />
                <Text style={styles.imagePlaceholderText}>
                  Selecionar imagem
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Título e Descrição */}
          <Input
            label="Título"
            required
            placeholder="Ex.: Aula de Ioga"
            value={title}
            onChangeText={setTitle}
          />
          <Input
            label="Descrição"
            required
            placeholder="Como será a atividade?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          {/* Data */}
          <View>
            <Text style={styles.fieldLabel}>Data *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}>
              <Text
                style={[
                  styles.dateText,
                  !formattedDate && styles.dateTextPlaceholder,
                ]}>
                {formattedDate || 'Selecionar data e hora'}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={scheduledDate ?? new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={(_, selected) => {
                setShowDatePicker(false);
                if (selected) {
                  setScheduledDate(prev => {
                    const d = new Date(selected);
                    if (prev) {
                      d.setHours(prev.getHours(), prev.getMinutes());
                    }
                    return d;
                  });
                  setShowTimePicker(true);
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={scheduledDate ?? new Date()}
              mode="time"
              is24Hour
              onChange={(_, selected) => {
                setShowTimePicker(false);
                if (selected) {
                  setScheduledDate(prev => {
                    const d = new Date(prev ?? new Date());
                    d.setHours(selected.getHours(), selected.getMinutes());
                    return d;
                  });
                }
              }}
            />
          )}

          {/* Tipo */}
          <View>
            <Text style={styles.fieldLabel}>Tipo da atividade *</Text>
            {loadingTypes ? (
              <LoadingIndicator message="Carregando tipos..." />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typesRow}>
                {types.map(type => (
                  <CategoryCard
                    key={type.id}
                    title={type.name}
                    image={type.image}
                    selected={selectedTypeId === type.id}
                    onPress={() => setSelectedTypeId(type.id)}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          {/* Mapa */}
          <View>
            <Text style={styles.fieldLabel}>Ponto de encontro *</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onPress={e =>
                  setMarker(e.nativeEvent.coordinate)
                }>
                <Marker coordinate={marker} />
              </MapView>
            </View>
          </View>

          {/* Aprovação */}
          <View>
            <Text style={styles.fieldLabel}>
              Requer aprovação para participar?
            </Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  isPrivate && styles.toggleOptionActive,
                ]}
                onPress={() => setIsPrivate(true)}>
                <Text
                  style={[
                    styles.toggleText,
                    isPrivate && styles.toggleTextActive,
                  ]}>
                  Sim
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  !isPrivate && styles.toggleOptionActive,
                ]}
                onPress={() => setIsPrivate(false)}>
                <Text
                  style={[
                    styles.toggleText,
                    !isPrivate && styles.toggleTextActive,
                  ]}>
                  Não
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button
            title={submitting ? 'Criando...' : 'Criar'}
            onPress={handleSubmit}
            loading={submitting}
            disabled={loadingTypes}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
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
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {fontSize: 13, color: colors.danger},
  imageBox: {
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  imagePreview: {width: '100%', height: '100%'},
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: colors.placeholder,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.title,
    marginBottom: 6,
  },
  dateButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  dateText: {fontSize: 16, color: colors.title},
  dateTextPlaceholder: {color: colors.placeholder},
  typesRow: {gap: 4, paddingVertical: 4},
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {flex: 1},
  toggleRow: {
    flexDirection: 'row',
    gap: 0,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleOption: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  toggleOptionActive: {
    backgroundColor: colors.primary500,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  toggleTextActive: {
    color: colors.white,
  },
});

export {NewActivityScreen};
