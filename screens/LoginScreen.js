import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();


const spotifyConfig = {
  clientId: 'ce78ffe494f448dfb12a8f5e00dc53d7',
  scopes: [
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-read-playback-state',
    'user-top-read',
    'user-modify-playback-state',
    'streaming',
    'user-read-email',
    'user-read-private'
  ],
  redirectUri: AuthSession.makeRedirectUri({ scheme: 'myapp' })
};


const LoginScreen = ({ route }) => {
  const { setToken } = route.params;
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const discovery = {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
  };

  const useSpotifyAuth = () => {
    const [request, response, promptAsync] = AuthSession.useAuthRequest(
      {
        clientId: spotifyConfig.clientId,
        scopes: spotifyConfig.scopes,
        redirectUri: spotifyConfig.redirectUri,
        responseType: AuthSession.ResponseType.Token,
      },
      discovery
    );

    return {
      request,
      response,
      promptAsync,
    };
  };

  const { request, response, promptAsync } = useSpotifyAuth();

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      handleAuthSuccess(access_token);
    } else if (response?.type === 'error') {
      Alert.alert('Authentication Error', 'Failed to login with Spotify');
    }
  }, [response]);

  const handleAuthSuccess = async (token) => {
    try {
      await AsyncStorage.setItem('spotifyToken', token);
      setToken(token);
    } catch (error) {
      console.error('Error saving token:', error);
      Alert.alert('Error', 'Failed to save authentication data');
    }
  };

  const handleLogin = async () => {
    console.log("Redirect URI:", spotifyConfig.redirectUri);
    try {
      setIsAuthenticating(true);
      await promptAsync();
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to initiate login');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Music Player</Text>
      <TouchableOpacity
        style={[
          styles.loginButton,
          (isAuthenticating || !request) && styles.loginButtonDisabled
        ]}
        onPress={handleLogin}
        disabled={isAuthenticating || !request}
      >
        <Text style={styles.loginButtonText}>
          {isAuthenticating ? 'Logging in...' : 'Login with Spotify'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1DB954',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#191414',
    padding: 15,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;