import React, { useRef, useState } from 'react';
import { Animated, TouchableOpacity, Text, View, FlatList } from 'react-native';
import { Container, Header, Title, ContentCard } from './styled';
import MapComponent from './Components/MapView';
import { SpaceItem } from './Components/SpaceItem';
import mockData from './Components/data';

const HomeScreen = ({ navigation }: any) => {
  const opacityMap = useRef(new Animated.Value(0)).current;
  const translateMap = useRef(new Animated.Value(1000)).current; 
  const opacityList = useRef(new Animated.Value(1)).current;

  const [mapVisible, setMapVisible] = useState(false);

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
            data={mockData}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <SpaceItem item={item} onPress={() => navigation.navigate('SpaceDetails', { item })} />
            )}
          />
        </ContentCard>
      </Animated.View>
    </Container>
  );
};

export default HomeScreen;