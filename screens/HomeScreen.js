import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const token = await AsyncStorage.getItem('spotifyToken');
      const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPlaylists(data.items);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => navigation.navigate('Player', { playlist: item })}
    >
      <Text style={styles.playlistName}>{item.name}</Text>
      <Text style={styles.playlistTracks}>{item.tracks.total} tracks</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Playlists</Text>
      <FlatList
        data={playlists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191414',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    padding: 20,
  },
  list: {
    flex: 1,
  },
  playlistItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  playlistName: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  playlistTracks: {
    fontSize: 14,
    color: '#B3B3B3',
  },
});

export default HomeScreen;