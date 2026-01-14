import React, { useState } from 'react';
import { FlatList } from 'react-native';
// Importa os estilos da mesma pasta
import { Container, Header, Title, ContentCard, ListHeader, SectionTitle } from './styled';
// Importa o componente da subpasta 'Components'
import { SpaceItem } from './Components/SpaceItem';
// Importa os dados da subpasta 'Components'
import mockData from './Components/data';

const HomeScreen = ({ navigation }) => {
  const handleOpenDetails = (item) => {
    navigation.navigate('SpaceDetails', { item });
  };

  return (
    <Container>
      <Header>
        <Title>GrowApp</Title>
      </Header>

      <ContentCard>
        <ListHeader>
          <SectionTitle>Locais</SectionTitle>
        </ListHeader>

        <FlatList
          data={mockData}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <SpaceItem item={item} onPress={() => handleOpenDetails(item)} />
          )}
          showsVerticalScrollIndicator={false}
        />
      </ContentCard>
    </Container>
  );
};

export default HomeScreen;