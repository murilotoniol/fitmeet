import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {Input} from '../../components/ui/Input';
import {PasswordInput} from '../../components/ui/PasswordInput';
import {Button} from '../../components/ui/Button';
import {ScreenContainer} from '../../components/ui/ScreenContainer';
import {useSession} from '../../hooks/useSession';
import {colors} from '../../styles/colors';
import {isValidEmail, isValidPassword} from '../../utils/validators';

type LoginScreenProps = {
  navigation: any;
};

function LoginScreen({navigation}: LoginScreenProps) {
  const {login} = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Informe os campos obrigatórios corretamente.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('O formato do e-mail é inválido.');
      return;
    }

    if (!isValidPassword(password)) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setSubmitting(true);
      await login({email: email.trim(), password});
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Erro inesperado.';
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>FITMEET</Text>
            <Text style={styles.title}>BEM-VINDO DE VOLTA!</Text>
            <Text style={styles.subtitle}>
              Encontre parceiros para treinar ao ar livre. Conecte-se e
              comece agora! 💪
            </Text>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="E-mail"
              required
              placeholder="Ex.: joao@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={submitting}
            />

            <PasswordInput
              label="Senha"
              required
              placeholder="Ex.: joao123"
              value={password}
              onChangeText={setPassword}
              disabled={submitting}
            />

            <Button
              title={submitting ? 'Entrando...' : 'Entrar'}
              onPress={handleSubmit}
              loading={submitting}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Ainda não tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 32,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 40,
    fontWeight: '400',
    color: colors.primary500,
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '400',
    color: colors.title,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  form: {
    gap: 20,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.text,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.title,
  },
});

export {LoginScreen};
