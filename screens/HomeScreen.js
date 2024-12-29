import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [playlists, setPlaylists] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('spotifyToken');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleApiError = (error) => {
    if (error.message.includes('403')) {
      Alert.alert(
        'Authentication Error',
        'Please log in again',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      setError('Failed to load content');
    }
    setLoading(false);
  };

  const searchPlaylists = async (query) => {
    if (!query.trim()) {
      setSearchResults(playlists);
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('spotifyToken');
      if (!token) throw new Error('No token found');

      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      
      const data = await response.json();
      if (data.playlists?.items) {
        setSearchResults(data.playlists.items);
        setError(null);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPlaylists = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('spotifyToken');
      if (!token) throw new Error('No token found');

      const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      const data = await response.json();
      if (data.items) {
        setPlaylists(data.items);
        setSearchResults(data.items);
        setError(null);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPlaylists();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    searchPlaylists(text);
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#B3B3B3" />
      <TextInput
        style={styles.searchInput}
        placeholder="Search playlists"
        placeholderTextColor="#B3B3B3"
        value={searchQuery}
        onChangeText={handleSearch}
        autoCapitalize="none"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity 
          onPress={() => {
            setSearchQuery('');
            setSearchResults(playlists);
          }}
        >
          <Ionicons name="close-circle" size={20} color="#B3B3B3" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderItem = ({ item }) => {
    if (!item) return null;
    
    return (
      <TouchableOpacity
        style={styles.playlistCard}
        onPress={() => navigation.navigate('Player', { playlist: item })}
      >
        <Image
          source={{ uri: item.images?.[0]?.url }}
          style={styles.playlistImage}
          defaultSource={require('../assets/icon.png')}
        />
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName}>{item.name}</Text>
          <View style={styles.playlistDetails}>
            <Text style={styles.playlistTracks}>
              {item.tracks?.total || 0} tracks
            </Text>
            <MaterialIcons 
              name="play-circle-filled" 
              size={32} 
              color="#1DB954" 
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={fetchUserPlaylists}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#121212', '#191414']}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Your Library</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchUserPlaylists}
          >
            <MaterialIcons name="refresh" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {renderSearchBar()}

      {loading ? (
        <ActivityIndicator 
          style={styles.loader} 
          size="large" 
          color="#1DB954" 
        />
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={item => item?.id || Math.random().toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No playlists found</Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
  },
  logoutButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
    padding: 8,
  },
  loader: {
    marginTop: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  playlistCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  playlistImage: {
    width: 80,
    height: 80,
  },
  playlistInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  playlistDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playlistTracks: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#B3B3B3',
    fontSize: 16,
  }
});

export default HomeScreen;