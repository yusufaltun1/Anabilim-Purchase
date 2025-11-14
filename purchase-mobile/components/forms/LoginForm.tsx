import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState, useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// *** DÜZELTME BAŞLANGICI ***
// Endpoint'ler artık Tenant ID'nizi içeriyor
const tenantId = '3cad0dae-4bbe-4cbc-9abb-b2b3a8462fe1';
const discovery = {
  authorizationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
  tokenEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
  revocationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout`,
};
// *** DÜZELTME SONU ***

// Expo Auth Proxy kullanarak stabil bir redirect URI oluştur
const redirectUri = makeRedirectUri({
  useProxy: true,
});
console.log('Your new Redirect URI is: ', redirectUri);


interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { login, isLoading, loginWithMicrosoft } = useAuth();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: '0fdaa90a-9f9f-4a7f-a4f5-7e1a7dffa769',
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      redirectUri,
      responseType: 'token',
    },
    discovery
  );

  useEffect(() => {
    const handleAuth = async (response: any) => {
      if (response?.type === 'success') {
        const { access_token } = response.params;

        if (loginWithMicrosoft) {
          try {
            // 1. Microsoft'tan kullanıcı bilgilerini al
            const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
              headers: { Authorization: `Bearer ${access_token}` },
            });

            console.log(userInfoResponse);
            console.log(access_token);
            if (!userInfoResponse.ok) {
              throw new Error('Failed to fetch user info from Microsoft.');
            }
            
            const userInfo = await userInfoResponse.json();

            // 2. Backend'e verify-token isteği gönder
            await loginWithMicrosoft({
              accessToken: access_token,
              microsoftId: userInfo.id,
              email: userInfo.mail || userInfo.userPrincipalName,
              name: userInfo.displayName,
            });

            // 3. Başarılı olursa ana sayfaya yönlendir
            onLoginSuccess?.();

          } catch (error) {
            console.error('Microsoft login verification failed:', error);
            Alert.alert('Giriş Hatası', 'Microsoft ile giriş yapılırken bir sorun oluştu.');
          }
        }
      } else if (response?.type === 'error') {
        console.error('Microsoft Auth Error:', response.error);
        Alert.alert('Giriş Hatası', 'Microsoft ile giriş yapılamadı.');
      }
    };

    handleAuth(response);
  }, [response]);

  const handleMicrosoftLogin = () => {
    promptAsync();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.formCard}>
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
              {/* Logo placeholder - gerçek logo eklenebilir */}
            </View>
          </View>

          <Button
            title="Microsoft ile Giriş Yap"
            onPress={handleMicrosoftLogin}
            disabled={!request}
            variant="outline"
            style={styles.microsoftButton}
          />

          <View style={styles.footer}>
            <Button
              title="Şifremi Unuttum"
              onPress={() => {
                Alert.alert('Bilgi', 'Şifre sıfırlama özelliği yakında eklenecek');
              }}
              variant="outline"
              size="small"
            />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formCard: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 8,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  microsoftButton: {
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
  },
});
