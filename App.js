import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider, Card, Text, Surface, Searchbar, IconButton, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState('İstanbul');
  const [location, setLocation] = useState(null);

  // Mock weather data (gerçek API kullanımında bu kısım değişecek)
  const mockWeatherData = {
    current: {
      temp: 23,
      condition: 'Güneşli',
      humidity: 65,
      windSpeed: 13,
      feelsLike: 25
    },
    hourly: [
      { time: '12:00', temp: 23, icon: 'weather-sunny' },
      { time: '13:00', temp: 24, icon: 'weather-partly-cloudy' },
      { time: '14:00', temp: 24, icon: 'weather-partly-cloudy' },
      { time: '15:00', temp: 22, icon: 'weather-cloudy' },
      { time: '16:00', temp: 21, icon: 'weather-cloudy' },
      { time: '17:00', temp: 20, icon: 'weather-rainy' },
    ],
    daily: [
      { day: 'Pazartesi', temp: 23, icon: 'weather-sunny', high: 26, low: 18 },
      { day: 'Salı', temp: 22, icon: 'weather-partly-cloudy', high: 25, low: 17 },
      { day: 'Çarşamba', temp: 21, icon: 'weather-cloudy', high: 24, low: 16 },
      { day: 'Perşembe', temp: 20, icon: 'weather-rainy', high: 23, low: 15 },
      { day: 'Cuma', temp: 19, icon: 'weather-pouring', high: 22, low: 14 },
    ]
  };

  useEffect(() => {
    setWeatherData(mockWeatherData);
  }, []);

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Konum izni verilmedi.');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      // Reverse geocoding ile şehir adını al
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const city = reverseGeocode[0].city || reverseGeocode[0].region || 'Bilinmeyen Konum';
        setCurrentCity(city);
        Alert.alert('Konum Bulundu', `${city} konumu kullanılıyor.`);
      }
    } catch (error) {
      Alert.alert('Hata', 'Konum alınamadı: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const searchCity = () => {
    if (searchQuery.trim()) {
      setCurrentCity(searchQuery.trim());
      setSearchQuery('');
      Alert.alert('Şehir Değiştirildi', `${searchQuery.trim()} için hava durumu gösteriliyor.`);
    }
  };

  const getWeatherIcon = (condition) => {
    const iconMap = {
      'Güneşli': 'weather-sunny',
      'Parçalı Bulutlu': 'weather-partly-cloudy',
      'Bulutlu': 'weather-cloudy',
      'Yağmurlu': 'weather-rainy',
      'Karlı': 'weather-snowy',
      'Sisli': 'weather-fog',
      'Rüzgarlı': 'weather-windy'
    };
    return iconMap[condition] || 'weather-partly-cloudy';
  };

  if (!weatherData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Hava durumu yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <SafeAreaView style={styles.container}>
          {/* Header with Search and Location */}
          <View style={styles.header}>
            <View style={styles.searchContainer}>
              <Searchbar
                placeholder="Şehir ara..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                iconColor="#4A90E2"
                onSubmitEditing={searchCity}
              />
            </View>
            <IconButton
              icon="crosshairs-gps"
              size={30}
              onPress={requestLocationPermission}
              style={styles.locationButton}
              iconColor="#4A90E2"
            />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Current Weather Card */}
            <Card style={styles.mainCard}>
              <Card.Content style={styles.mainCardContent}>
                <View style={styles.cityRow}>
                  <MaterialCommunityIcons name="map-marker" size={24} color="#4A90E2" />
                  <Text style={styles.cityName}>{currentCity}</Text>
                </View>
                <Text style={styles.temperature}>{weatherData.current.temp}°</Text>
                <Text style={styles.weatherDesc}>{weatherData.current.condition}</Text>
                <Text style={styles.feelsLike}>Hissedilen: {weatherData.current.feelsLike}°</Text>
                
                <View style={styles.weatherDetails}>
                  <View style={styles.weatherDetail}>
                    <MaterialCommunityIcons name="water-percent" size={24} color="#4A90E2" />
                    <Text style={styles.detailText}>{weatherData.current.humidity}%</Text>
                  </View>
                  <View style={styles.weatherDetail}>
                    <MaterialCommunityIcons name="weather-windy" size={24} color="#4A90E2" />
                    <Text style={styles.detailText}>{weatherData.current.windSpeed} km/s</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Hourly Forecast */}
            <Surface style={styles.forecastSection}>
              <Text style={styles.sectionTitle}>Saatlik Tahmin</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {weatherData.hourly.map((item, index) => (
                  <View key={index} style={styles.hourlyItem}>
                    <Text style={styles.timeText}>{item.time}</Text>
                    <MaterialCommunityIcons 
                      name={getWeatherIcon(item.condition || item.icon)} 
                      size={28} 
                      color="#4A90E2" 
                    />
                    <Text style={styles.tempText}>{item.temp}°</Text>
                  </View>
                ))}
              </ScrollView>
            </Surface>

            {/* Daily Forecast */}
            <Surface style={styles.forecastSection}>
              <Text style={styles.sectionTitle}>5 Günlük Tahmin</Text>
              {weatherData.daily.map((item, index) => (
                <View key={index} style={styles.dailyItem}>
                  <Text style={styles.dayText}>{item.day}</Text>
                  <View style={styles.dailyItemRight}>
                    <MaterialCommunityIcons 
                      name={getWeatherIcon(item.condition || item.icon)} 
                      size={24} 
                      color="#4A90E2" 
                    />
                    <View style={styles.tempRange}>
                      <Text style={styles.highTemp}>{item.high}°</Text>
                      <Text style={styles.lowTemp}>{item.low}°</Text>
                    </View>
                  </View>
                </View>
              ))}
            </Surface>

            {/* Additional Info Cards */}
            <View style={styles.infoGrid}>
              <Surface style={styles.infoCard}>
                <MaterialCommunityIcons name="thermometer" size={28} color="#4A90E2" />
                <Text style={styles.infoLabel}>UV İndeksi</Text>
                <Text style={styles.infoValue}>Yüksek</Text>
              </Surface>
              <Surface style={styles.infoCard}>
                <MaterialCommunityIcons name="eye" size={28} color="#4A90E2" />
                <Text style={styles.infoLabel}>Görüş</Text>
                <Text style={styles.infoValue}>10 km</Text>
              </Surface>
              <Surface style={styles.infoCard}>
                <MaterialCommunityIcons name="weather-sunset-up" size={28} color="#4A90E2" />
                <Text style={styles.infoLabel}>Gün Doğumu</Text>
                <Text style={styles.infoValue}>06:23</Text>
              </Surface>
              <Surface style={styles.infoCard}>
                <MaterialCommunityIcons name="weather-sunset-down" size={28} color="#4A90E2" />
                <Text style={styles.infoLabel}>Gün Batımı</Text>
                <Text style={styles.infoValue}>19:45</Text>
              </Surface>
            </View>
          </ScrollView>

          {loading && (
            <View style={styles.overlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.overlayText}>Konum alınıyor...</Text>
            </View>
          )}
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchContainer: {
    flex: 1,
    marginRight: 8,
  },
  searchBar: {
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  locationButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  scrollContent: {
    padding: 16,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    elevation: 4,
  },
  mainCardContent: {
    alignItems: 'center',
    padding: 24,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  temperature: {
    fontSize: 72,
    fontWeight: '200',
    color: '#4A90E2',
    marginVertical: 8,
  },
  weatherDesc: {
    fontSize: 20,
    color: '#666',
    marginBottom: 8,
  },
  feelsLike: {
    fontSize: 16,
    color: '#999',
    marginBottom: 16,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  weatherDetail: {
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#666',
  },
  forecastSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 24,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 16,
    minWidth: 80,
  },
  timeText: {
    color: '#666',
    marginBottom: 8,
    fontSize: 14,
  },
  tempText: {
    color: '#333',
    fontWeight: '600',
    marginTop: 8,
    fontSize: 16,
  },
  dailyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dailyItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  tempRange: {
    alignItems: 'flex-end',
  },
  highTemp: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },
  lowTemp: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  infoCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
