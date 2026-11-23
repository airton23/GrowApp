import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, StyleSheet, ToastAndroid } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import siaApi from '../../../services/siaApi';

interface MapProps {
  style?: any;
  onPressLocais: () => void;
  navigation: any;
}

const MapComponent: React.FC<MapProps> = ({ style, onPressLocais, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({
    latitude: -8.896182,
    longitude: -36.502563,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });

  useEffect(() => {
    Geolocation.getCurrentPosition(
      pos => {
        setPosition({
          ...position,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, []);

  const getDateOffset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = ('0' + (d.getMonth() + 1)).slice(-2);
    const dd = ('0' + d.getDate()).slice(-2);
    return `${yyyy}${mm}${dd}`;
  };

  const handleLongPress = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setLoading(true);
    const dateStr = getDateOffset(-8);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 4000),
      );
      const etoResponse: any = await Promise.race([
        siaApi.eto(coords.latitude, coords.longitude, dateStr, dateStr, 200),
        timeoutPromise,
      ]);
      setLoading(false);
      navigation.navigate('TakeStep', {
        coords,
        features: etoResponse?.features || [],
        etoResponse,
      });
      onPressLocais();
    } catch {
      setLoading(false);
      ToastAndroid.show(
        'SIA offline: continuando com coordenadas locais',
        ToastAndroid.SHORT,
      );
      navigation.navigate('TakeStep', { coords, features: [] });
      onPressLocais();
    }
  };

  return (
    <Animated.View style={[styles.mapWrapper, style]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={onPressLocais}>
          <Text style={styles.buttonText}>Locais</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loaderContainer}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#44A266" />
            <Text style={{ marginTop: 10 }}>Coletando dados...</Text>
          </View>
        </View>
      )}

      <MapView
        style={styles.map}
        region={position}
        onLongPress={handleLongPress}
        showsUserLocation={true}
      >
        <Marker coordinate={position} title="Sua Localização" />
      </MapView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  mapWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    zIndex: 15,
  },
  map: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 20,
    flexDirection: 'row',
  },
  backButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#44A266',
    fontWeight: 'bold',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 25,
  },
  loaderBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  }
});

export default MapComponent;