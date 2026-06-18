import React, {useEffect, useState} from 'react';
import {
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
import Toast from 'react-native-toast-message';
import {updateAvatar, updateUser, deactivateUser, getPreferences} from '../../api/user';
import {Avatar} from '../../components/ui/Avatar';
import {Button} from '../../components/ui/Button';
import {ConfirmDialog} from '../../components/ui/ConfirmDialog';
import {Input} from '../../components/ui/Input';
import {PasswordInput} from '../../components/ui/PasswordInput';
import {ScreenContainer} from '../../components/ui/ScreenContainer';
import {useSession} from '../../hooks/useSession';
import {colors} from '../../styles/colors';
import type {ImageAsset, Preference} from '../../types';
import {isValidEmail, isValidPassword} from '../../utils/validators';

type EditProfileScreenProps = {
  navigation: any;
};

function EditProfileScreen({navigation}: EditProfileScreenProps) {
  const {user, refreshUser, logout} = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [newAvatar, setNewAvatar] = useState<ImageAsset | null>(null);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Preference[]>([]);

  useEffect(() => {
    let active = true;

    const loadPrefs = async () => {
      try {
        const prefs = await getPreferences();
        if (active) {
          setPreferences(prefs);
        }
      } catch {
        // silencioso
      }
    };

    loadPrefs();

    const unsubscribe = navigation.addListener('focus', () => {
      loadPrefs();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigation]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setCpf(user.cpf);
      setAvatarUri(user.avatar);
    }
  }, [user]);

  async function handlePickAvatar() {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setAvatarUri(asset.uri ?? null);
      setNewAvatar({
        uri: asset.uri!,
        type: asset.type ?? 'image/jpeg',
        fileName: asset.fileName ?? 'avatar.jpg',
      });
    }
  }

  async function handleSave() {
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError('Nome e e-mail são obrigatórios.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('O formato do e-mail é inválido.');
      return;
    }

    if (password && !isValidPassword(password)) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      if (name.trim() !== user?.name) {
        payload.name = name.trim();
      }
      if (email.trim() !== user?.email) {
        payload.email = email.trim();
      }
      if (password) {
        payload.password = password;
      }

      if (Object.keys(payload).length > 0) {
        await updateUser(payload);
      }

      if (newAvatar) {
        await updateAvatar(newAvatar);
      }

      await refreshUser();
      Toast.show({type: 'success', text1: 'Perfil atualizado!'});
      navigation.goBack();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível salvar.';
      setError(message);
      Toast.show({type: 'error', text1: 'Erro', text2: message});
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    setDeactivating(true);
    try {
      await deactivateUser();
      setShowDeactivateDialog(false);
      await logout();
      Toast.show({type: 'success', text1: 'Conta desativada.'});
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível desativar a conta.';
      Toast.show({type: 'error', text1: 'Erro', text2: message});
    } finally {
      setDeactivating(false);
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
          <Text style={styles.headerTitle}>EDITAR PERFIL</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Avatar */}
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickAvatar}
            activeOpacity={0.7}>
            <Avatar uri={avatarUri} size={100} />
            <View style={styles.cameraIcon}>
              <Camera size={18} color={colors.white} weight="fill" />
            </View>
          </TouchableOpacity>

          {/* Campos */}
          <View style={styles.form}>
            <Input
              label="Nome"
              required
              value={name}
              onChangeText={setName}
              disabled={saving}
            />
            <Input
              label="E-mail"
              required
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={saving}
            />
            <Input
              label="CPF"
              value={cpf}
              onChangeText={() => {}}
              editable={false}
            />
            <PasswordInput
              label="Nova senha"
              placeholder="Deixe vazio para manter a atual"
              value={password}
              onChangeText={setPassword}
              disabled={saving}
            />

            {/* Preferências */}
            <View>
              <Text style={styles.fieldLabel}>Preferências selecionadas</Text>
              {preferences.length > 0 ? (
                <View style={styles.preferencesList}>
                  {preferences.map(pref => (
                    <View key={pref.typeId} style={styles.preferenceTag}>
                      <Text style={styles.preferenceTagText}>{pref.typeName}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noPreferencesText}>
                  Nenhuma preferência selecionada
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.prefButton}
              onPress={() =>
                navigation.navigate('Preferences', {fromEdit: true})
              }>
              <Text style={styles.prefButtonText}>Editar preferências</Text>
            </TouchableOpacity>
          </View>

          {/* Ações */}
          <View style={styles.actions}>
            <Button
              title={saving ? 'Salvando...' : 'Salvar alterações'}
              onPress={handleSave}
              loading={saving}
            />
            <Button
              title="Cancelar"
              variant="outline"
              onPress={() => navigation.goBack()}
              disabled={saving}
            />
            <TouchableOpacity
              style={styles.deactivateButton}
              onPress={() => setShowDeactivateDialog(true)}>
              <Text style={styles.deactivateText}>Desativar conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={showDeactivateDialog}
        title="TEM CERTEZA QUE DESEJA DESATIVAR SUA CONTA?"
        description="Esta ação não pode ser desfeita. Todos os seus dados serão perdidos."
        confirmLabel="Desativar"
        destructive
        loading={deactivating}
        onConfirm={handleDeactivate}
        onCancel={() => setShowDeactivateDialog(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  spacer: {width: 24},
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
    padding: 24,
    gap: 24,
  },
  errorBox: {
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
  avatarContainer: {
    alignSelf: 'center',
    position: 'relative',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary500,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  form: {
    gap: 16,
  },
  prefButton: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary500,
    alignItems: 'center',
  },
  prefButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary500,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.title,
    marginBottom: 6,
  },
  preferencesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  preferenceTag: {
    backgroundColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  preferenceTagText: {
    fontSize: 12,
    color: colors.title,
    fontWeight: '500',
  },
  noPreferencesText: {
    fontSize: 14,
    color: colors.placeholder,
    fontStyle: 'italic',
    marginVertical: 8,
  },
  actions: {
    gap: 12,
  },
  deactivateButton: {
    padding: 12,
    alignItems: 'center',
  },
  deactivateText: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: '600',
  },
});

export {EditProfileScreen};
