import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Avatar, Icon } from 'react-native-elements';
import styled from 'styled-components/native';

const CardContainer = styled.View`
  background-color: #fff;
  border-radius: 20px;
  padding: 15px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
  elevation: 3;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
`;

const InfoArea = styled.View`
  flex: 1;
  margin-left: 15px;
`;

const Name = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #444;
`;

const Subtitle = styled.Text`
  font-size: 12px;
  color: #999;
`;

export const SpaceItem = ({ item, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <CardContainer>
      <Avatar
        rounded
        size="medium"
        source={{ uri: item.cultureImageLink }}
      />
      <InfoArea>
        <Name>{item.name}</Name>
        <Subtitle>{item.culturePhase}</Subtitle>
        <Subtitle>Linked • Online • 0 min</Subtitle>
      </InfoArea>
      <Icon
        name="play-circle-outline"
        type="material"
        color="#44A266"
        size={35}
      />
    </CardContainer>
  </TouchableOpacity>
);