import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Alert, TouchableOpacity, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import api from '../api/axios';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  EventHistory: undefined;
};

type RegistrationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface RegistrationScreenProps {
  navigation: RegistrationScreenNavigationProp;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number.';
    }
    if (!/[^A-Za-z0-9]/.test(pwd)) {
      return 'Password must contain at least one special character.';
    }
    return null;
  };

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (passwordError) {
      Toast.show({ type: 'error', text1: passwordError });
      return;
    }

    if (!imageUri) {
      Toast.show({ type: 'error', text1: 'Please upload a photo.' });
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('user_id', userId);
    formData.append('password', password);
    
    // Assuming imageUri is a file URI, convert it to a blob or a file object
    // This part might need adjustment based on how your backend expects the image
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    const fileName = `photo.${fileType}`;

    // For React Native, you might need to send it as a blob or a specific format
    // For web, a simple fetch might work, but for native, it's more complex
    // This is a common way to send files in React Native
    formData.append('image', {
      uri: imageUri,
      name: fileName,
      type: `image/${fileType}`,
    } as any); // 'as any' to bypass TypeScript error for FormData.append file type

    try {
      await api.post('/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Toast.show({ type: 'success', text1: 'Registration successful! Please log in.' });
      navigation.navigate('Login');
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Registration failed.' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry
        autoCapitalize="none"
      />
      {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Upload Photo</Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={!!passwordError || !name || !userId || !password || !imageUri}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  linkText: {
    marginTop: 20,
    color: '#007bff',
  },
});

export default RegistrationScreen;
