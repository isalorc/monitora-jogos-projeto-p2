import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { cores } from './components/cores';
import MeusJogosScreen from './screens/MeusJogosScreen';
import PesquisaScreen from './screens/PesquisaScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: cores.primary,
            tabBarInactiveTintColor: cores.muted,
            tabBarStyle: {
              backgroundColor: cores.card,
              borderTopColor: cores.border,
              height: 62,
              paddingBottom: 8,
              paddingTop: 6,
            },
            sceneStyle: { backgroundColor: cores.background },
          }}
        >
          <Tab.Screen name="Pesquisa" component={PesquisaScreen} />
          <Tab.Screen name="MeusJogos" component={MeusJogosScreen} options={{ title: 'Meus jogos' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
