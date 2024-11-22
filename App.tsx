import { useState, useEffect } from 'react';
import {StyleSheet, Text, View, FlatList, Button, Image, ScrollView, TouchableOpacity, Alert, TextInput, Modal} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import DropDownPicker from 'react-native-dropdown-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';


type MenuItem = {
  id: string;
  name: string;
  description?: string;
  course?: string;
  price: number;
};

type RootStackParamList = {
  LogIn: undefined;
  HomeScreen: { newMenuItem?: MenuItem, selectedMenuItem?: MenuItem };
  AddMenuItemScreen: undefined;
  StartersScreen: undefined;
  MainCourseScreen: undefined;
  DessertScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="LogIn" component={MainScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="AddMenuItemScreen" component={AddMenuItemScreen} />
        <Stack.Screen name="StartersScreen" component={StartersScreen} />
        <Stack.Screen name="MainCourseScreen" component={MainCourseScreen} />
        <Stack.Screen name="DessertScreen" component={DessertScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'LogIn'>) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    console.log('Logged in with email:', email);
    navigation.navigate('HomeScreen');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image style={styles.logo} source={require('./images/plate_perfect.png')} />
      <Text style={styles.welcomeText}>Welcome to PlatePerfect</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />
    </ScrollView>
  );
}

function HomeScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'HomeScreen'>) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Starters', value: 'Starters' },
    { label: 'Main Course', value: 'Main Course' },
    { label: 'Desserts', value: 'Desserts' },
  ]);

  useEffect(() => {
    if (route.params?.newMenuItem) {
      setMenuItems(prevItems => [...prevItems, route.params.newMenuItem]);
    }

    if (route.params?.selectedMenuItem) {
      setMenuItems(prevItems => [...prevItems, route.params.selectedMenuItem]);
    }
  }, [route.params?.newMenuItem, route.params?.selectedMenuItem]);

  const handleCourseSelection = (course: string) => {
    setSelectedCourse(course);
    if (course === 'Starters') {
      navigation.navigate('StartersScreen');
    } else if (course === 'Main Course') {
      navigation.navigate('MainCourseScreen');
    } else if (course === 'Desserts') {
      navigation.navigate('DessertScreen');
    }
  };

  const renderItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItem}>
      <Text style={styles.menuItemText}>{item.name} - {item.course || ''} - R{item.price}</Text>
    </View>
  );

  const calculateAveragePrice = () => {
    if (menuItems.length === 0) return 0;
    const total = menuItems.reduce((sum, item) => sum + item.price, 0);
    return total / menuItems.length;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Main Menu</Text>
      <Text style={styles.menuCountText}>You have 6 courses to choose from. </Text>
      <Text style={styles.menuCountText}>Total Menu Items Selected: {menuItems.length}</Text>

      <Text style={styles.menuCountText}>Average Price: R{calculateAveragePrice().toFixed(2)}</Text>

      <DropDownPicker
        open={open}
        value={selectedCourse}
        items={items}
        setOpen={setOpen}
        setValue={setSelectedCourse}
        setItems={setItems}
        placeholder="Select Course"
        onChangeValue={handleCourseSelection}
        containerStyle={{ height: 90, width: '100%' }}
        style={{ borderColor: '#0F52BA' }}
      />

      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.menuList}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddMenuItemScreen', { menuItems, setMenuItems })}
      >
        <Text style={styles.addButtonText}>+ Add or Remove Menu Item</Text>
      </TouchableOpacity>
    </View>
  );
}

function AddMenuItemScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'AddMenuItemScreen'>) {
  const { menuItems, setMenuItems } = route.params || {};
  const [dishName, setDishName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [SelectedCourse, setCourse] = useState<string>('');
  const [price, setPrice] = useState<string>(''); // Store price as a string for input
  const [isCourseDropdownVisible, setCourseDropdownVisible] = useState(false);

  const courseOptions = ['Starter', 'Main Course', 'Dessert'];

  const handleSave = () => {
    const priceInt = parseInt(price); // Convert the price to an integer

    if (isNaN(priceInt)) {
      Alert.alert('Error', 'Please enter a valid price.');
      return;
    }

    const newMenuItem: MenuItem = {
      id: Math.random().toString(),
      course: SelectedCourse,
      name: dishName,
      description: description,
      price: priceInt, 
    };

    setMenuItems((prevItems: MenuItem[]) => [...prevItems, newMenuItem]);
    navigation.navigate('HomeScreen');
  };

  const handleRemoveItem = (id: string) => {
    setMenuItems((prevItems: MenuItem[]) => prevItems.filter(item => item.id !== id));
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItem}>
      <Text style={styles.menuItemText}>{item.name} - {item.course || ''} - R{item.price}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Text style={styles.deleteButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerText}>Add or Remove Menu Item</Text>

      <TextInput
        style={styles.input}
        placeholder="Dish Name"
        value={dishName}
        onChangeText={setDishName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Price (e.g., 150)"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <Button title="Save Menu Item" onPress={handleSave} />

      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={item => item.id}
        style={styles.menuList}
      />
    </ScrollView>
  );
}

function StartersScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'StartersScreen'>) {
  const starters: MenuItem[] = [
    { id: '1', name: 'Bruschetta', price: 50 },
    { id: '2', name: 'Stuffed Mushrooms', price: 70 },
  ];

  const handleSelectItem = (item: MenuItem) => {
    navigation.navigate('HomeScreen', { selectedMenuItem: item });
  };

  const renderItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity onPress={() => handleSelectItem(item)}>
      <Text style={styles.menuItemText}>{item.name} - {item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Starters</Text>
      <FlatList
        data={starters}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

function MainCourseScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'MainCourseScreen'>) {
  const mainCourses: MenuItem[] = [
    { id: '3', name: 'Grilled Salmon', price: 120 },
    { id: '4', name: 'Beef Wellington', price: 200 },
  ];

  const handleSelectItem = (item: MenuItem) => {
    navigation.navigate('HomeScreen', { selectedMenuItem: item });
  };

  const renderItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity onPress={() => handleSelectItem(item)}>
      <Text style={styles.menuItemText}>{item.name} - {item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Main Courses</Text>
      <FlatList
        data={mainCourses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

function DessertScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'DessertScreen'>) {
  const desserts: MenuItem[] = [
    { id: '5', name: 'Chocolate Fondant', price: 80 },
    { id: '6', name: 'Lemon Tart', price: 70 },
  ];

  const handleSelectItem = (item: MenuItem) => {
    navigation.navigate('HomeScreen', { selectedMenuItem: item });
  };

  const renderItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity onPress={() => handleSelectItem(item)}>
      <Text style={styles.menuItemText}>{item.name} - {item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Desserts</Text>
      <FlatList
        data={desserts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#89CFF0',
  },
  logo: {
    width: 300,
    height: 300,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  addButton: {
    backgroundColor: '#0F52BA',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  menuItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
  },
  menuItemText: {
    fontSize: 18,
    color: '#000',
  },
  menuCountText: {
    fontSize: 16,
    marginBottom: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#0F52BA',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#000',
  },
  icon: {
    marginLeft: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  optionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    fontSize: 18,
    color: '#000',
  },
  menuList: {
    width: '100%',
    marginTop: 10,
  },
  deleteButton: {
    fontSize: 16,
    color: '#000',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#000',
  }
});