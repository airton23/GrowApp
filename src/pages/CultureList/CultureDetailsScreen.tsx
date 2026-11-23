import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { Container, Header, Title, ContentCard } from '../Home2/styled';
import { string } from '../../locales';

const CultureDetailsScreen = ({ navigation, route }: any) => {
  const { item } = route.params || {};

  if (!item) {
    return null;
  }

  return (
    <Container>
      <Header style={{ height: 150, justifyContent: 'flex-start' }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backRow}
        >
          <Icon name="chevron-left" color="#fff" size={28} />
          <Text style={styles.backText}>{string('BOTTOM_GO_BACK')}</Text>
        </TouchableOpacity>
        <Title style={styles.headerTitle}>{string('HOME_DETAILS')}</Title>
      </Header>

      <ContentCard>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <View style={styles.imageCard}>
              {item.icon ? (
                <Image
                  source={{ uri: item.icon }}
                  resizeMode="cover"
                  style={styles.image}
                />
              ) : (
                <Icon
                  name="leaf"
                  type="font-awesome"
                  size={44}
                  color="#44A266"
                />
              )}
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{item.displayName}</Text>
              {!!item.displayClass && (
                <Text style={styles.category}>{item.displayClass}</Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {string('CULTURE_COEFFICIENTS')}
            </Text>

            <View style={styles.kcRow}>
              <Text style={styles.kcLabel}>
                {string('INITIAL_GROWTH_PHASE')}
              </Text>
              <Text style={styles.kcValue}>
                {String(item.iniStagekc ?? 0).replace('.', ',')}
              </Text>
            </View>

            <View style={styles.kcRow}>
              <Text style={styles.kcLabel}>
                {string('INTERMEDIATE_GROWTH_PHASE')}
              </Text>
              <Text style={styles.kcValue}>
                {String(item.midStagekc ?? 0).replace('.', ',')}
              </Text>
            </View>

            <View style={styles.kcRow}>
              <Text style={styles.kcLabel}>
                {string('FINAL_GROWTH_PHASE')}
              </Text>
              <Text style={styles.kcValue}>
                {String(item.endStagekc ?? 0).replace('.', ',')}
              </Text>
            </View>
          </View>
        </ScrollView>
      </ContentCard>
    </Container>
  );
};

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#fff',
    fontSize: 18,
  },
  headerTitle: {
    textAlign: 'center',
    width: '100%',
    marginTop: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  imageCard: {
    width: 110,
    height: 110,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    backgroundColor: '#EAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 110,
    height: 110,
  },
  nameContainer: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
  section: {
    backgroundColor: '#F9FAF9',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8ECE9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 14,
  },
  kcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  kcLabel: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    paddingRight: 10,
  },
  kcValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#44A266',
  },
});

export default CultureDetailsScreen;

