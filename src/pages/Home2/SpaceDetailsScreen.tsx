import React from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';
import { Container, Header, Title, ContentCard } from './styled';

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`;

const MiniCard = styled.View`
  flex: 1;
  background-color: #fff;
  padding: 10px;
  margin: 5px;
  border-radius: 12px;
  align-items: center;
  elevation: 2;
  border-width: 1px;
  border-color: #eee;
`;

const BigValueContainer = styled.View`
  align-items: center;
  margin-vertical: 30px;
`;

const SpaceDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params as any;

  return (
    <Container style={{ backgroundColor: '#F5F5F5' }}>
      <Header style={{ height: 160, justifyContent: 'flex-start' }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
        >
          <Icon name="chevron-left" color="#fff" size={30} />
          <Text style={{ color: '#fff', fontSize: 16 }}>Voltar</Text>
        </TouchableOpacity>
        <Title style={{ textAlign: 'center', marginTop: 5 }}>{item.name}</Title>
      </Header>

      <ContentCard>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={{ fontSize: 14, color: '#999', textAlign: 'center' }}>
            {item.culturePhase} • Linked • Online
          </Text>

          <BigValueContainer>
            <Text style={{ color: '#44A266', fontSize: 18, fontWeight: 'bold' }}>Evapotranspiração</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 80, fontWeight: 'bold', color: '#333' }}>6,1</Text>
              <Text style={{ fontSize: 18, color: '#999', marginLeft: 5 }}>mm/d</Text>
            </View>
            <Text style={{ color: '#CCC' }}>Estação Ibimirim - PE</Text>
          </BigValueContainer>

          <InfoRow>
            <MiniCard>
              <Icon name="wb-sunny" type="material" color="#FFD700" size={20} />
              <Text style={{ fontSize: 10, color: '#999' }}>Radiação</Text>
              <Text style={{ fontWeight: 'bold' }}>29.89</Text>
            </MiniCard>
            <MiniCard>
              <Icon name="wb-cloudy" type="material" color="#87CEEB" size={20} />
              <Text style={{ fontSize: 10, color: '#999' }}>Umidade</Text>
              <Text style={{ fontWeight: 'bold' }}>25%</Text>
            </MiniCard>
            <MiniCard>
              <Icon name="thermostat" type="material" color="#FF4500" size={20} />
              <Text style={{ fontSize: 10, color: '#999' }}>Temp.</Text>
              <Text style={{ fontWeight: 'bold' }}>29°C</Text>
            </MiniCard>
          </InfoRow>

          <TouchableOpacity
            style={{
              backgroundColor: '#ff4444',
              padding: 15,
              borderRadius: 12,
              alignItems: 'center',
              marginTop: 30
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Excluir este local</Text>
          </TouchableOpacity>
        </ScrollView>
      </ContentCard>
    </Container>
  );
};

export default SpaceDetailsScreen;