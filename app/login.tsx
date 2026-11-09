import { Link, router } from 'expo-router';
import { FeedbackMessage } from '../src/components/common/FeedbackMessage';
import { FormPanel } from '../src/components/common/FormPanel';
import { PageContainer } from '../src/components/common/PageContainer';
import { StyledButton } from '../src/components/common/StyledButton';
import { InputField } from '../src/components/primitives/InputField';
import { Text } from '../src/components/primitives/Text';
import { useAuthStore } from '../src/state/useAuthStore';
import { useState } from 'react';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading, authError } = useAuthStore();

  const handleLogin = async () => {
    setError('');
    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to log in.');
    }
  };

  return (
    <PageContainer centered>
      <FormPanel>
        <Text size="xl" weight="bold" align="center">Welcome back</Text>
        <Text color="#52606D" align="center">Log in to manage your household.</Text>
        <FeedbackMessage message={authError ?? error} />
        <InputField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoComplete="email"
          testID="email-input"
        />
        <InputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          autoComplete="current-password"
          testID="password-input"
        />
        <StyledButton label="Log in" onPress={handleLogin} isLoading={isLoading} testID="login-button" />
        <Text align="center">
          New here? <Link href="/register"><Text weight="bold" color="#176B5B">Create an account</Text></Link>
        </Text>
      </FormPanel>
    </PageContainer>
  );
}
