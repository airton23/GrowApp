import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Image,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { Container, Header, Title, ContentCard } from '../Home2/styled';
import siaApi from '../../services/siaApi';
import i18n, { string } from '../../locales';
import localKcs from '../../assets/kcs.json';

export interface CultureItem {
  _id: string;
  displayName: string;
  displayClass?: string;
  icon: string;
  iniStagekc: number;
  midStagekc: number;
  endStagekc: number;
  raw?: any;
}

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

type SortOrder = 'alphabetical' | 'reverse-alphabetical' | 'recent' | 'oldest';

const CultureListScreen = ({ navigation }: any) => {
  const [cultures, setCultures] = useState<CultureItem[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('alphabetical');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  const loadCultures = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await siaApi.kc();
      if (Array.isArray(data) && data.length > 0) {
        setCultures(normalizeSiaKcs(data));
      } else {
        setCultures(normalizeLocalKcs());
      }
    } catch {
      setCultures(normalizeLocalKcs());
      ToastAndroid.show(
        'SIA offline: exibindo catálogo local de culturas',
        ToastAndroid.SHORT,
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCultures();
  }, [loadCultures]);

  const displayedCultures = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? cultures.filter(item =>
          item.displayName.toLowerCase().includes(query),
        )
      : cultures;

    switch (sortOrder) {
      case 'alphabetical':
        return [...filtered].sort((a, b) =>
          a.displayName.localeCompare(b.displayName),
        );
      case 'reverse-alphabetical':
        return [...filtered].sort((a, b) =>
          b.displayName.localeCompare(a.displayName),
        );
      case 'oldest':
        return [...filtered].reverse();
      case 'recent':
      default:
        return filtered;
    }
  }, [cultures, search, sortOrder]);

  return (
    <Container>
      <Header>
        <Title style={{ textAlign: 'center', width: '100%' }}>
          {string('HOME_CULTURE')}
        </Title>
      </Header>

      <ContentCard style={{ paddingHorizontal: 14, paddingTop: 18 }}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Icon name="search" type="feather" size={18} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder={string('HOME_copilot_search')}
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Icon name="x" type="feather" size={18} color="#888" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setFilterModalVisible(true)}
            style={styles.filterButton}
          >
            <Icon name="filter" type="font-awesome" size={20} color="#44A266" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={displayedCultures}
          keyExtractor={item => item._id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadCultures}
              colors={['#44A266']}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('CultureDetails', { item })}
            >
              <View style={styles.imageWrapper}>
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
                    size={26}
                    color="#44A266"
                  />
                )}
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.displayName}
              </Text>
              <Text style={styles.cardSub}>
                Kc: {String(item.midStagekc).replace('.', ',')}
              </Text>
            </TouchableOpacity>
          )}
        />
      </ContentCard>

      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{string('SORT_BY')}</Text>
            <View style={styles.divider} />
            {(
              [
                ['alphabetical', string('BOTTOM_AZ')],
                ['reverse-alphabetical', string('BOTTOM_ZA')],
                ['recent', string('BOTTOM_RECENT')],
                ['oldest', string('BOTTOM_OLDEST')],
              ] as [SortOrder, string][]
            ).map(([value, label]) => (
              <TouchableOpacity
                key={value}
                style={styles.modalOptionBtn}
                onPress={() => {
                  setSortOrder(value);
                  setFilterModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOption,
                    sortOrder === value && styles.modalOptionActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>{string('BOTTOM_CLOSE')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Container>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F3',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#333',
    fontSize: 15,
  },
  filterButton: {
    marginLeft: 10,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    margin: 6,
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  imageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#EAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  image: {
    width: 60,
    height: 60,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  cardSub: {
    fontSize: 12,
    color: '#44A266',
    marginTop: 4,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: 260,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  modalOptionBtn: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalOption: {
    fontSize: 16,
    color: '#444',
  },
  modalOptionActive: {
    color: '#44A266',
    fontWeight: 'bold',
  },
  modalCloseBtn: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  modalCloseText: {
    fontSize: 15,
    color: '#444',
    fontWeight: '600',
  },
});

export default CultureListScreen;

