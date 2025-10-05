import React from 'react';
import { PaperProvider, ActivityIndicator, MD2Colors } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SupabaseProvider, useSupabase } from './src/providers/SupabaseProvider';
import TodayScreen from './src/screens/TodayScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import { theme } from './src/theme';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

function AppContent() {
  const { user, initialized } = useSupabase();

  if (!initialized) {
    return (
      <PaperProvider theme={theme}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator animating={true} color={MD2Colors.blue500} />
        </View>
      </PaperProvider>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <Tab.Navigator>
          <Tab.Screen 
            name="Today" 
            component={TodayScreen} 
            options={{ title: 'Today\'s Medications' }} 
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ title: 'My Profile' }} 
          />
        </Tab.Navigator>
      ) : (
        <LoginScreen />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <SupabaseProvider>
          <AppContent />
        </SupabaseProvider>
      </QueryClientProvider>
    </PaperProvider>
  );
}