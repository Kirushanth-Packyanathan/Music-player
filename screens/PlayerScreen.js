import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';

const PlayerScreen = ({ route }) => {
  const { playlist } = route.params;
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchFirstTrack();
  }, []);

  const fetchFirstTrack = async () => {
    try {
      const token = await AsyncStorage.getItem('spotifyToken');
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.items.length > 0) {
        setCurrentTrack(data.items[0].track);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // Implement actual playback control using Spotify SDK
  };

  if (!currentTrack) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: currentTrack.album.images[0].url }}
        style={styles.albumArt}
      />
      <Text style={styles.trackName}>{currentTrack.name}</Text>
      <Text style={styles.artistName}>{currentTrack.artists[0].name}</Text>
      <View style={styles.controls}>
        <TouchableOpacity>
          <AntDesign name="stepbackward" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
          <AntDesign
            name={isPlaying ? 'pausecircle' : 'playcircle'}
            size={64}
            color="#1DB954"
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <AntDesign name="stepforward" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191414',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  albumArt: {
    width: 300,
    height: 300,
    marginBottom: 30,
    borderRadius: 10,
  },
  trackName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  artistName: {
    fontSize: 18,
    color: '#B3B3B3',
    marginBottom: 30,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '60%',
  },
  playButton: {
    marginHorizontal: 20,
  },
});

export default PlayerScreen;