import React, {useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ArrowLeft} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';
import {Input} from '../../components/ui/Input';
import {PasswordInput} from '../../components/ui/PasswordInput';
import {Button} from '../../components/ui/Button';
import {ScreenContainer} from '../../components/ui/ScreenContainer';
import {useSession} from '../../hooks/useSession';
import {colors} from '../../styles/colors';
import {
  formatCpf,
  isValidCpf,
  isValidEmail,
  isValidPassword,
} from '../../utils/validators';

type RegisterScreenProps = {
  navigation: any;
};

function RegisterScreen({navigation}: RegisterScreenProps) {
  const {register} = useSession();
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const formattedCpf = useMemo(() => formatCpf(cpf), [cpf]);

  async function handleSubmit() {
    setError(null);

    if (
      !name.trim() ||
      !formattedCpf.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      setError('Informe os campos obrigatórios corretamente.');
      return;
    }

    if (!isValidCpf(formattedCpf)) {
      setError('O formato do CPF é inválido.');
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
      await register({
        name: name.trim(),
        cpf: formattedCpf,
        email: email.trim(),
        password,
      });
      Toast.show({
        type: 'success',
        text1: 'Cadastro realizado!',
        text2: 'Faça login para começar.',
      });
      navigation.navigate('Login');
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
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <ArrowLeft size={24} color={colors.title} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>FITMEET</Text>
            <Text style={styles.title}>CRIE SUA CONTA</Text>
            <Text style={styles.subtitle}>
              Cadastre-se para encontrar parceiros de treino e começar a se
              exercitar ao ar livre. Vamos juntos! 💪
            </Text>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Nome completo"
              required
              placeholder="Ex.: João Silva"
              value={name}
              onChangeText={setName}
              disabled={submitting}
            />

            <Input
              label="CPF"
              required
              placeholder="Ex.: 123.456.789-01"
              value={formattedCpf}
              onChangeText={setCpf}
              keyboardType="numeric"
              maxLength={14}
              disabled={submitting}
            />

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
              title={submitting ? 'Cadastrando...' : 'Cadastrar'}
              onPress={handleSubmit}
              loading={submitting}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Faça login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 0,
    gap: 24,
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
    maxWidth: 320,
  },
  form: {
    gap: 16,
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
    paddingBottom: 20,
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

export {RegisterScreen};
