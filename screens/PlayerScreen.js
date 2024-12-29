import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

const PlayerScreen = ({ route, navigation }) => {
  const { playlist } = route.params;
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

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
  };

  if (!currentTrack) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="down" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <TouchableOpacity>
          <MaterialIcons name="playlist-play" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.artworkContainer}>
        <Image
          source={{ uri: currentTrack.album.images[0].url }}
          style={styles.artwork}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.trackTitle}>{currentTrack.name}</Text>
        <Text style={styles.artistName}>{currentTrack.artists[0].name}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Slider
          style={styles.progressBar}
          value={progress}
          minimumValue={0}
          maximumValue={1}
          thumbTintColor="#1DB954"
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#555"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>0:00</Text>
          <Text style={styles.timeText}>3:45</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.secondaryControl}>
          <Ionicons name="shuffle" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mainControl}>
          <AntDesign name="stepbackward" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayback}>
          <AntDesign name={isPlaying ? "pausecircle" : "playcircle"} size={64} color="#1DB954" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mainControl}>
          <AntDesign name="stepforward" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryControl}>
          <Ionicons name="repeat" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.volumeContainer}>
        <Ionicons name="volume-low" size={20} color="#FFF" />
        <Slider
          style={styles.volumeSlider}
          minimumValue={0}
          maximumValue={1}
          thumbTintColor="#1DB954"
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#555"
        />
        <Ionicons name="volume-high" size={20} color="#FFF" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  artworkContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  artwork: {
    width: width - 80,
    height: width - 80,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  infoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  trackTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  artistName: {
    color: '#B3B3B3',
    fontSize: 16,
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressBar: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  timeText: {
    color: '#B3B3B3',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  secondaryControl: {
    opacity: 0.7,
  },
  mainControl: {
    opacity: 0.9,
  },
  playPauseButton: {
    transform: [{ scale: 1.2 }],
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  volumeSlider: {
    flex: 1,
    marginHorizontal: 10,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  }
});

export default PlayerScreen;