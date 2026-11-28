import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { cores } from './components/cores';
import MeusJogosScreen from './screens/MeusJogosScreen';
import PesquisaScreen from './screens/PesquisaScreen';

const Tab = createBottomTabNavigator();

const tema = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: cores.primary,
    background: cores.background,
    card: cores.card,
    text: cores.text,
    border: cores.border,
  },
};

const icones = {
  Pesquisa: ['search', 'search-outline'],
  MeusJogos: ['game-controller', 'game-controller-outline'],
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={tema}>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: cores.primary,
            tabBarInactiveTintColor: cores.muted,
            tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
            tabBarStyle: {
              backgroundColor: cores.card,
              borderTopColor: cores.border,
              height: 64,
              paddingBottom: 8,
              paddingTop: 6,
            },
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={icones[route.name][focused ? 0 : 1]} size={size} color={color} />
            ),
            sceneStyle: { backgroundColor: cores.background },
          })}
        >
          <Tab.Screen name="Pesquisa" component={PesquisaScreen} />
          <Tab.Screen name="MeusJogos" component={MeusJogosScreen} options={{ title: 'Meus jogos' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
