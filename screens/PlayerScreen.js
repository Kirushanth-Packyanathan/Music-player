import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

const PlayerScreen = ({ route, navigation }) => {
  const { playlist } = route.params;
  const [currentTrack, setCurrentTrack] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  
  // Fetch tracks from playlist
  const fetchTracks = async () => {
    try {
      const token = await AsyncStorage.getItem('spotifyToken');
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.items) {
        setTracks(data.items);
        setCurrentTrack(data.items[0].track);
        setDuration(data.items[0].track.duration_ms);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch tracks');
    }
  };

  // Control playback state
  const handlePlayback = async () => {
    try {
      const token = await AsyncStorage.getItem('spotifyToken');
      const endpoint = `https://api.spotify.com/v1/me/player/${isPlaying ? 'pause' : 'play'}`;
      
      await fetch(endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: [currentTrack.uri]
        })
      });
      
      setIsPlaying(!isPlaying);
    } catch (error) {
      Alert.alert('Error', 'Failed to control playback');
    }
  };

  // Handle track changes
  const changeTrack = async (direction) => {
    let newIndex = direction === 'next' 
      ? (currentIndex + 1) % tracks.length 
      : (currentIndex - 1 + tracks.length) % tracks.length;
    
    if (shuffleMode) {
      newIndex = Math.floor(Math.random() * tracks.length);
    }

    setCurrentIndex(newIndex);
    setCurrentTrack(tracks[newIndex].track);
    setDuration(tracks[newIndex].track.duration_ms);
    setProgress(0);
    
    if (isPlaying) {
      await handlePlayback();
    }
  };

  // Update progress
  useEffect(() => {
    let progressInterval;
    if (isPlaying) {
      progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 1000;
          if (newProgress >= duration) {
            if (repeatMode === 'track') {
              return 0;
            } else if (repeatMode === 'off') {
              changeTrack('next');
            }
          }
          return newProgress;
        });
      }, 1000);
    }
    return () => clearInterval(progressInterval);
  }, [isPlaying, duration, repeatMode]);

  // Initial setup
  useEffect(() => {
    fetchTracks();
  }, []);

  // Format time
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle seek
  const handleSeek = async (value) => {
    try {
      const token = await AsyncStorage.getItem('spotifyToken');
      const position = Math.floor(value * duration);
      
      await fetch('https://api.spotify.com/v1/me/player/seek', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ position_ms: position })
      });
      
      setProgress(position);
    } catch (error) {
      Alert.alert('Error', 'Failed to seek');
    }
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="down" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <TouchableOpacity>
          <MaterialIcons name="playlist-play" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        <Image
          source={{ uri: currentTrack.album.images[0].url }}
          style={styles.artwork}
        />
      </View>

      {/* Track Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.trackTitle}>{currentTrack.name}</Text>
        <Text style={styles.artistName}>{currentTrack.artists[0].name}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.progressBar}
          value={progress / duration}
          onSlidingComplete={handleSeek}
          minimumValue={0}
          maximumValue={1}
          thumbTintColor="#1DB954"
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#555"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(progress)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.secondaryControl, shuffleMode && styles.activeControl]}
          onPress={() => setShuffleMode(!shuffleMode)}
        >
          <Ionicons name="shuffle" size={24} color={shuffleMode ? "#1DB954" : "#FFF"} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.mainControl}
          onPress={() => changeTrack('prev')}
        >
          <AntDesign name="stepbackward" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.playPauseButton}
          onPress={handlePlayback}
        >
          <AntDesign 
            name={isPlaying ? "pausecircleo" : "playcircleo"}
            size={64}
            color="#1DB954"
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.mainControl}
          onPress={() => changeTrack('next')}
        >
          <AntDesign name="stepforward" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.secondaryControl, repeatMode !== 'off' && styles.activeControl]}
          onPress={() => setRepeatMode(repeatMode === 'off' ? 'track' : repeatMode === 'track' ? 'context' : 'off')}
        >
          <Ionicons 
            name={repeatMode === 'track' ? "repeat-once" : "repeat"}
            size={24}
            color={repeatMode !== 'off' ? "#1DB954" : "#FFF"}
          />
        </TouchableOpacity>
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