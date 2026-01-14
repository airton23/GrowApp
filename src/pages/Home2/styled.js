import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { Animated } from 'react-native';

export const Container = styled.View`
  flex: 1;
  background-color: #fff;
`;

export const Header = styled(LinearGradient).attrs({
  colors: ["#44A266", "#C4D66A", "#ffffff"],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
})`
  height: 280px;
  align-items: center;
  justify-content: center;
  padding-top: 40px;
`;

export const Title = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0px 2px 4px rgba(0,0,0,0.2);
`;

export const ContentCard = styled(Animated.View)`
  flex: 1;
  background-color: #f5f5f5;
  margin-top: -50px;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  padding: 20px;
  elevation: 10;
  shadow-color: #000;
  shadow-offset: 0px -5px;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
`;

export const ListHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-horizontal: 10px;
`;

export const SectionTitle = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #484d50;
`;