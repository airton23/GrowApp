import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ToastAndroid,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { useDatabase } from '@nozbe/watermelondb/react';
import { Container, Header, Title, ContentCard } from '../Home2/styled';
import { Creators as SpaceActions } from '../../store/ducks/space';
import { FlowCalculator } from '../../common';
import siaApi from '../../services/siaApi';
import i18n, { string } from '../../locales';
import localKcs from '../../assets/kcs.json';
import { CultureItem } from '../CultureList/CultureListScreen';

const normalizeLocalKcs = (): CultureItem[] =>
  (localKcs as any[]).map((item, idx) => ({
    _id: `local-${idx}`,
    displayName: item.culture || 'Cultura',
    displayClass: item.class || '',
    icon: item.image_link || '',
    iniStagekc: item.ini ?? 0,
    midStagekc: item.mid ?? 0,
    endStagekc: item.end ?? 0,
    raw: item,
  }));

const normalizeSiaKcs = (data: any[]): CultureItem[] => {
  const isEn = i18n.locale?.startsWith('en');
  return data.map((item, idx) => ({
    _id: item._id || `sia-${idx}`,
    displayName:
      typeof item.name === 'object'
        ? isEn
          ? item.name.enUS
          : item.name.ptBR
        : item.name || item.culture || 'Cultura',
    displayClass:
      typeof item.class === 'object'
        ? isEn
          ? item.class.enUS
          : item.class.ptBR
        : item.class || '',
    icon: item.icon || item.image_link || '',
    iniStagekc: item.iniStagekc ?? item.ini ?? 0,
    midStagekc: item.midStagekc ?? item.mid ?? 0,
    endStagekc: item.endStagekc ?? item.end ?? 0,
    raw: item,
  }));
};

const STEPS = [
  'Cultura',
  'Fase',
  'Irrigação',
  'Vazão',
  'Nome',
  'Confirmar',
];

const TakeStepScreen = ({ navigation, route }: any) => {
  const dispatch = useDispatch();
  const database = useDatabase();
  const spaces = useSelector((state: any) => state.spaceState || []);
  const routeParams = route?.params || {};

  const [step, setStep] = useState(0);
  const [cultures, setCultures] = useState<CultureItem[]>([]);
  const [search, setSearch] = useState('');

  const [selectedCulture, setSelectedCulture] = useState<CultureItem | null>(
    null,
  );
  const [culturePhase, setCulturePhase] = useState('');
  const [kc, setKc] = useState<number>(0);
  const [typeIrrigation, setTypeIrrigation] = useState<'drip' | 'sprinkler'>(
    'drip',
  );
  const [dripMinute, setDripMinute] = useState('40');
  const [dripperSpacing, setDripperSpacing] = useState('120');
  const [rowWidth, setRowWidth] = useState('80');
  const [flowRate, setFlowRate] = useState<number>(0);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await siaApi.kc();
        if (Array.isArray(data) && data.length > 0) {
          setCultures(normalizeSiaKcs(data));
          return;
        }
      } catch {
        // fallback to local catalog
      }
      setCultures(normalizeLocalKcs());
    };
    load();
  }, []);

  const filteredCultures = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? cultures.filter(c => c.displayName.toLowerCase().includes(q))
      : cultures;
    return [...list].sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [cultures, search]);

  const validateName = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setNameError(string('NAME_REQUIRED'));
      return false;
    }
    if (spaces.some((s: any) => s.name === trimmed)) {
      setNameError(string('NAME_UNIQUE'));
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSelectCulture = (item: CultureItem) => {
    setSelectedCulture(item);
    setStep(1);
  };

  const handleSelectPhase = (phaseLabel: string, phaseKc: number) => {
    setCulturePhase(phaseLabel);
    setKc(phaseKc);
    setStep(2);
  };

  const handleSelectIrrigation = (type: 'drip' | 'sprinkler') => {
    setTypeIrrigation(type);
    setStep(3);
  };

  const handleNextFlow = () => {
    const result = FlowCalculator(
      parseFloat(dripMinute) || 0,
      parseFloat(dripperSpacing) || 0,
      parseFloat(rowWidth) || 0,
    );
    setFlowRate(Number.isFinite(result) ? result : 0);
    setStep(4);
  };

  const handleNextName = () => {
    if (validateName(name)) {
      setStep(5);
    }
  };

  const handleConfirm = async () => {
    if (!validateName(name) || !selectedCulture) {
      Alert.alert(string('ERROR'), nameError || string('NAME_REQUIRED'));
      return;
    }

    const timeCalc = Math.floor(Math.random() * 9) + 1;
    const newSpace = {
      name: name.trim(),
      cultureImageLink: selectedCulture.icon,
      culture: selectedCulture.displayName,
      cultureType: selectedCulture.displayClass || '',
      culturePhase,
      kc,
      flowRate,
      coords: routeParams.coords || null,
      data: routeParams.features || [],
      time: timeCalc,
      typeIrrigation,
      currentTime: timeCalc,
      play: false,
      irrigationTime: null,
    };

    dispatch(SpaceActions.addSpace(newSpace));

    try {
      await database.write(async () => {
        await database.collections
          .get('spaces_profile')
          .create((record: any) => {
            record.name = newSpace.name;
            record.cultureImageLink = newSpace.cultureImageLink;
            record.kc = newSpace.kc;
          });
      });
    } catch {
      // Redux Persist already saved the space
    }

    ToastAndroid.show('Cultivo adicionado com sucesso!', ToastAndroid.SHORT);
    navigation.navigate('Main', { screen: 'HomeTab' });
  };

  return (
    <Container>
      <Header style={{ height: 150, justifyContent: 'flex-start' }}>
        <TouchableOpacity
          onPress={() => (step === 0 ? navigation.goBack() : setStep(step - 1))}
          style={styles.backRow}
        >
          <Icon name="chevron-left" color="#fff" size={28} />
          <Text style={styles.backText}>{string('BOTTOM_GO_BACK')}</Text>
        </TouchableOpacity>
        <Title style={styles.headerTitle}>
          {string('ADD_NEW_CULTURE')} ({step + 1}/{STEPS.length})
        </Title>
      </Header>

      <ContentCard style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Step indicator */}
        <View style={styles.stepBar}>
          {STEPS.map((label, idx) => (
            <View
              key={label}
              style={[
                styles.stepDot,
                idx <= step && styles.stepDotActive,
              ]}
            />
          ))}
        </View>

        {/* STEP 0: Select Culture */}
        {step === 0 && (
          <View style={{ flex: 1 }}>
            <View style={styles.searchBox}>
              <Icon name="search" type="feather" size={18} color="#888" />
              <TextInput
                style={styles.searchInput}
                placeholder={string('HOME_copilot_search')}
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <FlatList
              data={filteredCultures}
              keyExtractor={item => item._id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cultureCard}
                  onPress={() => handleSelectCulture(item)}
                >
                  <View style={styles.imageWrapper}>
                    {item.icon ? (
                      <Image
                        source={{ uri: item.icon }}
                        style={styles.cultureImg}
                      />
                    ) : (
                      <Icon
                        name="leaf"
                        type="font-awesome"
                        size={24}
                        color="#44A266"
                      />
                    )}
                  </View>
                  <Text style={styles.cultureName} numberOfLines={2}>
                    {item.displayName}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* STEP 1: Phase selection */}
        {step === 1 && selectedCulture && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>{string('PHASE_QUESTION')}</Text>
            {(
              [
                [
                  `${string('PHASE_START')}Kc ${selectedCulture.iniStagekc}`,
                  'Inicial',
                  selectedCulture.iniStagekc,
                ],
                [
                  `${string('PHASE_MIDDLE')}Kc ${selectedCulture.midStagekc}`,
                  'Intermediária',
                  selectedCulture.midStagekc,
                ],
                [
                  `${string('PHASE_END')}Kc ${selectedCulture.endStagekc}`,
                  'Final',
                  selectedCulture.endStagekc,
                ],
              ] as [string, string, number][]
            ).map(([label, phase, val]) => (
              <TouchableOpacity
                key={phase}
                style={styles.optionCard}
                onPress={() => handleSelectPhase(phase, val)}
              >
                <Icon
                  name="sprout"
                  type="material-community"
                  size={26}
                  color="#44A266"
                />
                <Text style={styles.optionText}>{label}</Text>
                <Icon name="chevron-right" color="#999" size={24} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* STEP 2: Irrigation type */}
        {step === 2 && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>{string('IRRIGATION_TYPE')}</Text>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => handleSelectIrrigation('drip')}
            >
              <Image
                source={require('../../assets/drip-irrigation-icon.png')}
                style={styles.irrigIcon}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.optionText}>
                  {string('IRRIGATION_DRIP')}
                </Text>
              </View>
              <Icon name="chevron-right" color="#999" size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => handleSelectIrrigation('sprinkler')}
            >
              <Image
                source={require('../../assets/sprinkler-irrigation-icon.png')}
                style={styles.irrigIcon}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.optionText}>
                  {string('IRRIGATION_SPRINKLER')}
                </Text>
              </View>
              <Icon name="chevron-right" color="#999" size={24} />
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 3: Flow rate */}
        {step === 3 && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>{string('FLOW_RATE')}</Text>

            <Text style={styles.label}>{string('DRIP_MINUTE')}</Text>
            <TextInput
              style={styles.input}
              value={dripMinute}
              onChangeText={setDripMinute}
              keyboardType="numeric"
              placeholder={string('DRIP_MINUTE_PLACEHOLDER')}
            />

            <Text style={styles.label}>{string('DRIPPER_SPACING')}</Text>
            <TextInput
              style={styles.input}
              value={dripperSpacing}
              onChangeText={setDripperSpacing}
              keyboardType="numeric"
              placeholder={string('DRIPPER_SPACING_PLACEHOLDER')}
            />

            <Text style={styles.label}>{string('ROW_WIDTH')}</Text>
            <TextInput
              style={styles.input}
              value={rowWidth}
              onChangeText={setRowWidth}
              keyboardType="numeric"
              placeholder={string('ROW_WIDTH_PLACEHOLDER')}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleNextFlow}>
              <Text style={styles.primaryBtnText}>{string('BOTTOM_NEXT')}</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 4: Unique Name */}
        {step === 4 && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>{string('UNIQUE_NAME')}</Text>
            <Text style={styles.subtitle}>{string('UNIQUE_NAME_DESC')}</Text>

            <TextInput
              style={styles.input}
              value={name}
              onChangeText={v => {
                setName(v);
                validateName(v);
              }}
              placeholder={string('NAME_PLACEHOLDER')}
              maxLength={20}
            />
            {!!nameError && <Text style={styles.error}>{nameError}</Text>}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleNextName}>
              <Text style={styles.primaryBtnText}>{string('BOTTOM_NEXT')}</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 5: Confirm */}
        {step === 5 && selectedCulture && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>{string('CONFIRM')}</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryRow}>
                {string('NAME')}: <Text style={styles.bold}>{name}</Text>
              </Text>
              <Text style={styles.summaryRow}>
                {string('CULTURE')}:{' '}
                <Text style={styles.bold}>{selectedCulture.displayName}</Text>
              </Text>
              <Text style={styles.summaryRow}>
                {string('PHASE')}:{' '}
                <Text style={styles.bold}>
                  {culturePhase} (Kc {kc})
                </Text>
              </Text>
              <Text style={styles.summaryRow}>
                {string('IRRIGATION_TYPE')}:{' '}
                <Text style={styles.bold}>
                  {typeIrrigation === 'drip'
                    ? string('DRIP_IRRIGATION')
                    : string('SPRINKLER_IRRIGATION')}
                </Text>
              </Text>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirm}>
              <Text style={styles.primaryBtnText}>
                {string('BOTTOM_CONFIRM')}
              </Text>
            </TouchableOpacity>
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
  stepBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepDot: {
    width: 28,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: '#44A266',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F3',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#333',
  },
  cultureCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    margin: 5,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  imageWrapper: {
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#EAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  cultureImg: {
    width: 52,
    height: 52,
  },
  cultureName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAF9',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6ECE8',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginLeft: 12,
  },
  irrigIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 44,
    backgroundColor: '#F2F4F3',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#222',
    fontSize: 15,
  },
  error: {
    color: '#D93025',
    fontSize: 12,
    marginTop: 6,
  },
  primaryBtn: {
    backgroundColor: '#44A266',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: '#F9FAF9',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6ECE8',
  },
  summaryRow: {
    fontSize: 15,
    color: '#555',
    marginVertical: 6,
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
  },
});

export default TakeStepScreen;

