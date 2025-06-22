import * as Location from 'expo-location';

// You'll need to get this from Google Cloud Console
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

export interface AddressComponents {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export const locationService = {
  // Request location permissions
  requestPermissions: async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  },

  // Get current location
  getCurrentLocation: async (): Promise<LocationCoordinates | null> => {
    try {
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Get current location error:', error);
      return null;
    }
  },

  // Convert coordinates to address using Google Maps Geocoding API
  reverseGeocode: async (latitude: number, longitude: number): Promise<AddressComponents | null> => {
    try {
      if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
        // Fallback to basic coordinates if no API key
        return {
          formattedAddress: `📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (Enable geocoding with Google Maps API key for full address)`,
        };
      }

      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const components = result.address_components;

        // Parse address components
        const addressParts: AddressComponents = {
          formattedAddress: result.formatted_address,
        };

        components.forEach((component: any) => {
          const types = component.types;
          
          if (types.includes('street_number') || types.includes('route')) {
            addressParts.street = (addressParts.street || '') + ' ' + component.long_name;
          } else if (types.includes('locality')) {
            addressParts.city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            addressParts.state = component.short_name;
          } else if (types.includes('country')) {
            addressParts.country = component.long_name;
          } else if (types.includes('postal_code')) {
            addressParts.postalCode = component.long_name;
          }
        });

        return addressParts;
      } else {
        throw new Error(`Geocoding failed: ${data.status}`);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback to coordinates
      return {
        formattedAddress: `📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (Address lookup failed)`,
      };
    }
  },

  // Format coordinates for display
  formatCoordinates: (latitude: number, longitude: number): string => {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  },

  // Calculate distance between two points (in km)
  calculateDistance: (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}; 