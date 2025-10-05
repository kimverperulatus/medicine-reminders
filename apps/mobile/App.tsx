import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SupabaseProvider } from './src/providers/SupabaseProvider';
import TodayScreen from './src/screens/TodayScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { theme } from './src/theme';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <SupabaseProvider>
          <NavigationContainer>
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
          </NavigationContainer>
        </SupabaseProvider>
      </QueryClientProvider>
    </PaperProvider>
  );
}