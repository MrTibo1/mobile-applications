import { useState } from 'react';
import { Link } from 'expo-router';
import { FeedbackMessage } from '../src/components/common/FeedbackMessage';
import { FormPanel } from '../src/components/common/FormPanel';
import { PageContainer } from '../src/components/common/PageContainer';
import { StyledButton } from '../src/components/common/StyledButton';
import { InputField } from '../src/components/primitives/InputField';
import { Text } from '../src/components/primitives/Text';
import { register } from '../src/services/authService';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    setMessage('');
    if (username.trim().length < 5) {
      setError('Username must be at least 5 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await register(email.trim(), password, username);
      setMessage('Check your E-mail for a confirmation message');
    } catch (registrationError) {
      setError(registrationError instanceof Error ? registrationError.message : 'Unable to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer centered>
      <FormPanel>
        <Text size="xl" weight="bold" align="center">Create your account</Text>
        <Text color="#52606D" align="center">Start organizing your household together.</Text>
        <FeedbackMessage message={error} />
        <FeedbackMessage message={message} tone="success" />
        <InputField
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="At least 5 characters"
          autoComplete="username"
        />
        <InputField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoComplete="email"
        />
        <InputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
          autoComplete="new-password"
        />
        <StyledButton label="Create account" onPress={handleRegister} isLoading={isLoading} />
        <Text align="center">
          Already registered? <Link href="/login"><Text weight="bold" color="#176B5B">Log in</Text></Link>
        </Text>
      </FormPanel>
    </PageContainer>
  );
}
