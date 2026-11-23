import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Header, Title, ContentCard } from '../Home2/styled';
import { Creators as ProfileActions } from '../../store/ducks/profile';
import siaApi from '../../services/siaApi';
import { string } from '../../locales';

const DEFAULT_REGION = {
  latitude: -8.907704242496505,
  longitude: -36.54231100132766,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const formatContact = (text: string) => {
  const digits = text.replace(/\D/g, '').slice(0, 11);
  return digits.replace(/(\d{2})(\d{1,5})?(\d{1,4})?/, (_, g1, g2, g3) => {
    if (g3) return `(${g1}) ${g2}-${g3}`;
    if (g2) return `(${g1}) ${g2}`;
    if (g1) return `(${g1}`;
    return '';
  });
};

const formatZip = (text: string) => {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/^(\d{5})(\d{1,3})/, '$1-$2');
};

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const savedProfiles = useSelector((state: any) => state.profileState || []);

  const [profileId, setProfileId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [property, setProperty] = useState('');
  const [adress, setAdress] = useState('');
  const [zip, setZip] = useState('');
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fillForm = (profile: any) => {
    setProfileId(profile.id || profile._id || 'local-profile');
    setName(profile.name || '');
    setContact(profile.contact || '');
    setProperty(profile.property || '');
    setAdress(profile.adress || '');
    setZip(profile.zip || '');
    if (profile.location) {
      try {
        const parsed =
          typeof profile.location === 'string'
            ? JSON.parse(profile.location)
            : profile.location;
        if (parsed?.latitude && parsed?.longitude) {
          setRegion({
            ...DEFAULT_REGION,
            ...parsed,
          });
        }
      } catch {
        // Keep default region
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const profiles = await siaApi.getProfile();
        if (mounted && Array.isArray(profiles) && profiles.length > 0) {
          fillForm(profiles[0]);
          return;
        }
      } catch {
        // SIA offline, fallback to Redux persisted profile
      }
      if (mounted && savedProfiles.length > 0) {
        fillForm(savedProfiles[0]);
      }
    };
    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = string('ERRORS.name');
    if (!contact.trim()) nextErrors.contact = string('ERRORS.contact');
    if (!property.trim()) nextErrors.property = string('ERRORS.property');
    if (!adress.trim()) nextErrors.adress = string('ERRORS.adress');
    if (!zip.trim()) nextErrors.zip = string('ERRORS.zip');

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const data = {
      name: name.trim(),
      contact: contact.trim(),
      property: property.trim(),
      location: JSON.stringify(region),
      adress: adress.trim(),
      zip: zip.trim(),
    };

    try {
      if (profileId && profileId !== 'local-profile') {
        await siaApi.putProfile(profileId, data);
        dispatch(ProfileActions.editProfile(profileId, data));
        ToastAndroid.show(string('PROPERTY_UPDATE'), ToastAndroid.LONG);
      } else {
        const created = await siaApi.postProfile(data);
        const createdId = created?.id || created?._id || 'local-profile';
        setProfileId(createdId);
        dispatch(ProfileActions.addProfile({ id: createdId, ...data }));
        ToastAndroid.show(string('PROPERTY_CREATE'), ToastAndroid.LONG);
      }
    } catch {
      // Save locally in Redux Persist even when SIA is offline
      if (profileId) {
        dispatch(ProfileActions.editProfile(profileId, data));
        ToastAndroid.show(
          'Perfil atualizado localmente (SIA offline)',
          ToastAndroid.LONG,
        );
      } else {
        setProfileId('local-profile');
        dispatch(ProfileActions.addProfile({ id: 'local-profile', ...data }));
        ToastAndroid.show(
          'Perfil salvo localmente (SIA offline)',
          ToastAndroid.LONG,
        );
      }
    }
  };

  return (
    <Container>
      <Header>
        <Title style={{ textAlign: 'center', width: '100%' }}>
          {string('HOME_PROPERTY')}
        </Title>
      </Header>

      <ContentCard>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>{string('TITLE_PROPERTY')}</Text>
          <View style={styles.greenDivider} />

          <View style={styles.field}>
            <Text style={styles.label}>{string('OWNER')}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={string('OWNER_NAME')}
              placeholderTextColor="#999"
            />
            {!!errors.name && <Text style={styles.error}>{errors.name}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{string('OWNER_CONTACT')}</Text>
            <TextInput
              style={styles.input}
              value={contact}
              onChangeText={t => setContact(formatContact(t))}
              placeholder="(XX) XXXXX-XXXX"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
            {!!errors.contact && (
              <Text style={styles.error}>{errors.contact}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{string('PROPERTY_NAME')}</Text>
            <TextInput
              style={styles.input}
              value={property}
              onChangeText={setProperty}
              placeholder={string('PROPERTY_NAME')}
              placeholderTextColor="#999"
            />
            {!!errors.property && (
              <Text style={styles.error}>{errors.property}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{string('PROPERTY_ADRESS')}</Text>
            <TextInput
              style={styles.input}
              value={adress}
              onChangeText={setAdress}
              placeholder={string('PROPERTY_ADRESS')}
              placeholderTextColor="#999"
            />
            {!!errors.adress && (
              <Text style={styles.error}>{errors.adress}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{string('PROPERTY_ZIP')}</Text>
            <TextInput
              style={styles.input}
              value={zip}
              onChangeText={t => setZip(formatZip(t))}
              placeholder="XXXXX-XXX"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            {!!errors.zip && <Text style={styles.error}>{errors.zip}</Text>}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
            {string('LOCATION')}
          </Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={region}
              region={region}
              onRegionChangeComplete={setRegion}
            >
              <Marker
                draggable
                coordinate={{
                  latitude: region.latitude,
                  longitude: region.longitude,
                }}
                onDragEnd={e =>
                  setRegion({
                    ...region,
                    ...e.nativeEvent.coordinate,
                  })
                }
              />
            </MapView>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
            <Text style={styles.saveButtonText}>
              {profileId ? string('BOTTOM_UPDATE') : string('BOTTOM_SAVE')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </ContentCard>
    </Container>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  greenDivider: {
    height: 2,
    backgroundColor: '#44A266',
    marginTop: 8,
    marginBottom: 18,
    borderRadius: 2,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
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
    marginTop: 4,
  },
  mapContainer: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#44A266',
    height: 180,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  saveButton: {
    backgroundColor: '#44A266',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 30,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;

