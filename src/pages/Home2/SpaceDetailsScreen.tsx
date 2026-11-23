import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from 'react-native-elements';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Container, Header, Title, ContentCard } from './styled';
import { Creators as SpaceActions } from '../../store/ducks/space';
import { string } from '../../locales';

const SpaceDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const routeItem = (route.params as any)?.item || {};
  const spaces = useSelector((state: any) => state.spaceState || []);

  const item =
    spaces.find((s: any) => s.name === routeItem.name) || routeItem;

  // Extract climatic / ETo data safely from SIA response or fallback
  const feature = Array.isArray(item.data) ? item.data[0] : item.data;
  const propsData = feature?.properties || feature || {};
  const daily = Array.isArray(propsData?.data)
    ? propsData.data[0]
    : Array.isArray(feature?.data)
      ? feature.data[0]
      : {};
  const params = propsData?.parameters || feature?.parameters || {};

  const etoVal = daily?.Eto ?? item.eto ?? 6.1;
  const city = params?.city || 'Ibimirim';
  const uf = params?.state || 'PE';
  const radQg = daily?.Rad_Qg ?? 29.89;
  const radQ0 = daily?.Rad_Q0 ?? 18.4;
  const tMax = daily?.Tmax ?? 29;
  const tMin = daily?.Tmin ?? 19;
  const hum = daily?.Hum ?? 25;
  const wind = daily?.Wind ?? 2.4;

  const totalTime = Number(item.time) > 0 ? Number(item.time) : 10;
  const currentTime =
    item.currentTime !== undefined ? Number(item.currentTime) : totalTime;
  const progress = Math.max(
    0,
    Math.min(100, ((totalTime - currentTime) / totalTime) * 100),
  );

  const handleTogglePlay = () => {
    dispatch(SpaceActions.togglePlay(item));
  };

  const handleResetTimer = () => {
    dispatch(SpaceActions.resetTimer(item));
  };

  const handleDelete = () => {
    Alert.alert(
      string('BOTTOM_DELETE'),
      `Deseja remover "${item.name}"?`,
      [
        { text: string('BOTTOM_CANCEL'), style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            dispatch(SpaceActions.deleteSpace(item));
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <Container style={{ backgroundColor: '#F5F5F5' }}>
      <Header style={{ height: 155, justifyContent: 'flex-start' }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backRow}
        >
          <Icon name="chevron-left" color="#fff" size={28} />
          <Text style={styles.backText}>{string('BOTTOM_GO_BACK')}</Text>
        </TouchableOpacity>
        <Title style={styles.headerTitle}>{item.name}</Title>
      </Header>

      <ContentCard>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.subHeader}>
            {item.culture ? `${item.culture} • ` : ''}
            {item.culturePhase || 'Fase ativa'}
            {item.kc ? ` • Kc ${String(item.kc).replace('.', ',')}` : ''}
          </Text>

          {/* Cronômetro de irrigação */}
          <View style={styles.timerCard}>
            <Text style={styles.sectionLabel}>{string('STOPWATCH')}</Text>
            <View style={styles.timerRow}>
              <AnimatedCircularProgress
                size={110}
                width={10}
                fill={progress}
                tintColor="#44A266"
                backgroundColor="#E6EFE9"
              >
                {() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.timerValue}>{currentTime}m</Text>
                    <Text style={styles.timerTotal}>de {totalTime}m</Text>
                  </View>
                )}
              </AnimatedCircularProgress>

              <View style={styles.timerActions}>
                <TouchableOpacity
                  style={[
                    styles.timerBtn,
                    { backgroundColor: item.play ? '#E67E22' : '#44A266' },
                  ]}
                  onPress={handleTogglePlay}
                >
                  <Icon
                    name={item.play ? 'pause' : 'play'}
                    type="feather"
                    color="#fff"
                    size={18}
                  />
                  <Text style={styles.timerBtnText}>
                    {item.play ? 'Pausar' : 'Iniciar'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={handleResetTimer}
                >
                  <Icon
                    name="rotate-ccw"
                    type="feather"
                    color="#44A266"
                    size={16}
                  />
                  <Text style={styles.resetBtnText}>
                    {string('BOTTOM_RESET')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ETo */}
          <View style={styles.bigValueContainer}>
            <Text style={styles.etoTitle}>{string('EVAPOTRANSPIRATION')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={styles.etoValue}>
                {Number(etoVal).toFixed(1).replace('.', ',')}
              </Text>
              <Text style={styles.etoUnit}>mm/d</Text>
            </View>
            <Text style={styles.stationText}>
              {string('STATION')}: {city} - {uf}
            </Text>
          </View>

          {/* Cards climáticos */}
          <View style={styles.infoRow}>
            <View style={styles.miniCard}>
              <Icon name="wb-sunny" type="material" color="#F39C12" size={20} />
              <Text style={styles.miniLabel}>{string('GLOBAL_RADIATION')}</Text>
              <Text style={styles.miniValue}>{radQg}</Text>
            </View>
            <View style={styles.miniCard}>
              <Icon name="wb-cloudy" type="material" color="#3498DB" size={20} />
              <Text style={styles.miniLabel}>{string('AIR_HUMIDITY')}</Text>
              <Text style={styles.miniValue}>{hum}%</Text>
            </View>
            <View style={styles.miniCard}>
              <Icon name="thermostat" type="material" color="#E74C3C" size={20} />
              <Text style={styles.miniLabel}>{string('MAX_TEMPERATURE')}</Text>
              <Text style={styles.miniValue}>{tMax}°C</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.miniCard}>
              <Icon name="sun" type="feather" color="#F1C40F" size={18} />
              <Text style={styles.miniLabel}>
                {string('SURFACE_RADIACTION')}
              </Text>
              <Text style={styles.miniValue}>{radQ0}</Text>
            </View>
            <View style={styles.miniCard}>
              <Icon name="wind" type="feather" color="#5DADE2" size={18} />
              <Text style={styles.miniLabel}>{string('WIND_SPEED')}</Text>
              <Text style={styles.miniValue}>{wind} m/s</Text>
            </View>
            <View style={styles.miniCard}>
              <Icon name="thermometer" type="feather" color="#2980B9" size={18} />
              <Text style={styles.miniLabel}>{string('MIN_TEMPERATURE')}</Text>
              <Text style={styles.miniValue}>{tMin}°C</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>{string('BOTTOM_DELETE')}</Text>
          </TouchableOpacity>
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
    marginTop: 5,
    width: '100%',
  },
  subHeader: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 16,
  },
  timerCard: {
    backgroundColor: '#F9FAF9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6ECE8',
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  timerValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  timerTotal: {
    fontSize: 11,
    color: '#888',
  },
  timerActions: {
    flex: 1,
    marginLeft: 18,
  },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  timerBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#EAF5EE',
  },
  resetBtnText: {
    color: '#44A266',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 6,
  },
  bigValueContainer: {
    alignItems: 'center',
    marginVertical: 14,
  },
  etoTitle: {
    color: '#44A266',
    fontSize: 17,
    fontWeight: 'bold',
  },
  etoValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#333',
  },
  etoUnit: {
    fontSize: 18,
    color: '#999',
    marginLeft: 5,
  },
  stationText: {
    color: '#888',
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  miniCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    margin: 4,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  miniLabel: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
  miniValue: {
    fontWeight: 'bold',
    color: '#222',
    marginTop: 2,
  },
  deleteBtn: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SpaceDetailsScreen;
