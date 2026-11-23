import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { Container, Header, Title, ContentCard } from '../Home2/styled';
import { DeviceApi, WifiApi } from '../../services';
import { string } from '../../locales';

const DeviceDetailsScreen = ({ navigation, route }: any) => {
  const { item, localType, ssidDevice, passDevice } = route.params || {};
  const deviceIp = item?.host || item?.ip || '192.168.4.1';

  const [refreshing, setRefreshing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [wifiInfo, setWifiInfo] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [ssidInput, setSsidInput] = useState('');
  const [passInput, setPassInput] = useState('');

  const loadDeviceInfo = useCallback(async () => {
    setRefreshing(true);
    try {
      const [cfg, wifi] = await Promise.allSettled([
        DeviceApi.getConfig(deviceIp),
        DeviceApi.getWifiInfo(deviceIp),
      ]);
      if (cfg.status === 'fulfilled') setConfig(cfg.value);
      if (wifi.status === 'fulfilled') setWifiInfo(wifi.value);
    } finally {
      setRefreshing(false);
    }
  }, [deviceIp]);

  useEffect(() => {
    const connectAndLoad = async () => {
      if (localType === false && ssidDevice) {
        setConnecting(true);
        try {
          await WifiApi.connectToProtectedSSID(
            ssidDevice,
            passDevice || '12345678',
          );
          setTimeout(() => {
            setConnecting(false);
            loadDeviceInfo();
          }, 1000);
        } catch {
          setConnecting(false);
          ToastAndroid.show(
            `Não foi possível conectar a ${ssidDevice}`,
            ToastAndroid.LONG,
          );
        }
      } else {
        loadDeviceInfo();
      }
    };
    connectAndLoad();

    return () => {
      if (localType === false) {
        WifiApi.removeCurrentWifi().catch(() => {});
      }
    };
  }, [localType, ssidDevice, passDevice, loadDeviceInfo]);

  const handleSendWifi = async () => {
    if (!ssidInput.trim()) {
      ToastAndroid.show('Informe o nome da rede Wi-Fi (SSID)', ToastAndroid.SHORT);
      return;
    }
    try {
      await DeviceApi.getWifiConnect(ssidInput.trim(), passInput, deviceIp);
      ToastAndroid.show('Credenciais Wi-Fi enviadas ao dispositivo!', ToastAndroid.LONG);
      loadDeviceInfo();
    } catch {
      ToastAndroid.show('Erro ao configurar Wi-Fi no dispositivo', ToastAndroid.SHORT);
    }
  };

  const handleDisconnectWifi = async () => {
    try {
      await DeviceApi.getWifiDisconnect(deviceIp);
      ToastAndroid.show('Dispositivo desconectado do Wi-Fi', ToastAndroid.SHORT);
      loadDeviceInfo();
    } catch {
      ToastAndroid.show('Erro ao desconectar dispositivo', ToastAndroid.SHORT);
    }
  };

  const deviceTitle = localType
    ? item?.host || 'Dispositivo na Rede'
    : ssidDevice || 'Dispositivo IoT';

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
        <Title style={styles.headerTitle}>{deviceTitle}</Title>
      </Header>

      <ContentCard>
        {connecting ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#44A266" />
            <Text style={styles.connectingText}>
              Conectando ao dispositivo...
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={loadDeviceInfo}
                colors={['#44A266']}
              />
            }
          >
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Informações do Dispositivo</Text>
              <Text style={styles.row}>IP: {deviceIp}</Text>
              {!!item?.mac && <Text style={styles.row}>MAC: {item.mac}</Text>}
              {!!item?.BSSID && (
                <Text style={styles.row}>BSSID: {item.BSSID}</Text>
              )}
              {!!wifiInfo?.ssid && (
                <Text style={styles.row}>Rede atual: {wifiInfo.ssid}</Text>
              )}
              {!!config?.spaces && (
                <Text style={styles.row}>
                  Espaços configurados: {config.spaces.length}
                </Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Configurar Wi-Fi do Dispositivo</Text>

              <Text style={styles.label}>Nome da rede (SSID)</Text>
              <TextInput
                style={styles.input}
                value={ssidInput}
                onChangeText={setSsidInput}
                placeholder="Ex: MinhaRedeWiFi"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Senha do Wi-Fi</Text>
              <TextInput
                style={styles.input}
                value={passInput}
                onChangeText={setPassInput}
                placeholder="Senha"
                placeholderTextColor="#999"
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSendWifi}
              >
                <Text style={styles.primaryBtnText}>Conectar Wi-Fi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={handleDisconnectWifi}
              >
                <Text style={styles.secondaryBtnText}>
                  Desconectar Wi-Fi atual
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
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
    fontSize: 22,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#F9FAF9',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6ECE8',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  row: {
    fontSize: 14,
    color: '#555',
    marginVertical: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#DDE3DF',
    color: '#222',
  },
  primaryBtn: {
    backgroundColor: '#44A266',
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    backgroundColor: '#FDECEA',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryBtnText: {
    color: '#D93025',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DeviceDetailsScreen;

