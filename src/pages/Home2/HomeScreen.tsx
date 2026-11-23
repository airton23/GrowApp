import React, { useRef, useState, useEffect } from 'react';
import { Animated, TouchableOpacity, Text, View, FlatList, Modal, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { Container, Header, Title, ContentCard } from './styled';
import MapComponent from './Components/MapView';
import { SpaceItem } from './Components/SpaceItem';
import mockData from './Components/data';
import { string } from '../../locales';

const TERMS_KEY = '@GrowApp:gpsTermsAccepted';

const HomeScreen = ({ navigation }: any) => {
  const savedSpaces = useSelector((state: any) => state.spaceState || []);
  const spacesList = savedSpaces.length > 0 ? savedSpaces : mockData;

  const opacityMap = useRef(new Animated.Value(0)).current;
  const translateMap = useRef(new Animated.Value(1000)).current; 
  const opacityList = useRef(new Animated.Value(1)).current;

  const [mapVisible, setMapVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(TERMS_KEY).then(val => {
      if (!val) {
        setTermsVisible(true);
      }
    });
  }, []);

  const acceptTerms = async () => {
    await AsyncStorage.setItem(TERMS_KEY, 'true');
    setTermsVisible(false);
  };

  const showMap = () => {
    setMapVisible(true);
    Animated.parallel([
      Animated.timing(opacityMap, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(translateMap, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(opacityList, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  };

  const hideMap = () => {
    Animated.parallel([
      Animated.timing(opacityMap, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(translateMap, { toValue: 1000, duration: 500, useNativeDriver: true }),
      Animated.timing(opacityList, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start(() => setMapVisible(false));
  };

  return (
    <Container>
      <MapComponent 
        navigation={navigation}
        onPressLocais={hideMap} 
        style={{ 
          opacity: opacityMap, 
          transform: [{ translateY: translateMap }] 
        }} 
      />

      <Animated.View style={{ flex: 1, opacity: opacityList }}>
        <Header>
          <Title style={{ textAlign: 'center',width: '100%' }}>GrowApp</Title>
        </Header>

        <ContentCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Locais</Text>
            <TouchableOpacity onPress={showMap} style={{ backgroundColor: '#f0f0f0', padding: 8, borderRadius: 15 }}>
              <Text style={{ color: '#44A266' }}>Ir mapa</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={spacesList}
            keyExtractor={(item, idx) => `${item.name}-${idx}`}
            renderItem={({ item }) => (
              <SpaceItem item={item} onPress={() => navigation.navigate('SpaceDetails', { item })} />
            )}
          />
        </ContentCard>
      </Animated.View>

      <Modal visible={termsVisible} transparent animationType="fade">
        <View style={styles.termsOverlay}>
          <View style={styles.termsBox}>
            <Text style={styles.termsTitle}>{string('term')}</Text>
            <ScrollView style={styles.termsScroll}>
              <Text style={styles.termsBody}>{string('termText')}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.termsBtn} onPress={acceptTerms}>
              <Text style={styles.termsBtnText}>{string('buttonAllow')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Container>
  );
};

const styles = StyleSheet.create({
  termsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  termsBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    maxHeight: '80%',
    width: '100%',
  },
  termsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  termsScroll: {
    marginBottom: 16,
  },
  termsBody: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  termsBtn: {
    backgroundColor: '#44A266',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  termsBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;