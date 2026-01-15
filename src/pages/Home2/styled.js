import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { Animated } from 'react-native';

export const Container = styled(LinearGradient).attrs({
  colors: ["#44A266", "#C4D66A"],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
})`
  flex: 1;
`;

export const Header = styled.View`
  padding-horizontal: 20px;
  padding-top: 40px;
  padding-bottom: 20px;
  align-items: flex-start;
`;

export const Title = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0px 2px 4px rgba(0,0,0,0.2);
`;

export const ContentCard = styled.View`
  flex: 1;
  background-color: #fff;
  margin-horizontal: 15px;
  margin-bottom: 20px;
  border-radius: 30px;
  padding: 20px;
  elevation: 5; /* Sombra no Android */
  shadow-color: #000; /* Sombra no iOS */
  shadow-offset: 0px 4px;
  shadow-opacity: 0.2;
  shadow-radius: 5px;
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