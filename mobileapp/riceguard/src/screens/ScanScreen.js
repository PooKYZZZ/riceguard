import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert, ImageBackground } from 'react-native';
import { fonts } from '../theme/typography';
import * as ImagePicker from 'expo-image-picker';
import Button from '../components/Button';
import { uploadImageAsync } from '../api';

export default function ScanScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!(perm?.granted || perm?.status === 'granted')) {
        Alert.alert('Permission required', 'Please allow photo library access in settings to pick an image.');
        return null;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        return res.assets[0].uri;
      }
      return null;
    } catch (e) {
      Alert.alert('Image picker error', String(e?.message || e));
      return null;
    }
  };

  const onPickPress = async () => {
    const uri = await pickImage();
    if (uri) {
      setImageUri(uri);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    let uri = imageUri;
    if (!uri) {
      // If no image yet, open the picker first
      uri = await pickImage();
      if (!uri) return; // user cancelled or error
      setImageUri(uri);
    }
    try {
      setLoading(true);
      setResult(null);
      const data = await uploadImageAsync(uri);
      if (data.prediction) {
        setResult({ disease: data.prediction, confidence: data.confidence, recommendation: data.recommendation, timestamp: data.timestamp });
      } else {
        Alert.alert('Error', data.error || 'Unknown error from server');
      }
    } catch (e) {
      Alert.alert('Upload failed', 'Failed to connect to backend. Ensure the Flask server is reachable from your device.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require('../../assets/bg.png')} resizeMode="cover" style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} style={styles.headerLogo} />
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => navigation.replace('Login')}><Text style={styles.navLink}>Log Out</Text></TouchableOpacity>
          <Text style={[styles.navLink, styles.navActive]}>Scan</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}><Text style={styles.navLink}>History</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.uploadBox} onPress={onPickPress}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <Text style={{ color: '#6b7280' }}>Tap to select image</Text>
          )}
        </TouchableOpacity>

        <Button onPress={handleUpload} style={{ marginTop: 32 }} disabled={loading || !imageUri}>
          {loading ? 'Analyzing...' : 'SCAN IMAGE'}
        </Button>

        {loading && <ActivityIndicator style={{ marginTop: 8 }} />}

        {result && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Result</Text>
            <Text><Text style={styles.bold}>Disease:</Text> {result.disease}</Text>
            <Text><Text style={styles.bold}>Confidence:</Text> {result.confidence}%</Text>
            <Text><Text style={styles.bold}>Recommendation:</Text> {result.recommendation}</Text>
            <Text><Text style={styles.bold}>Analyzed On:</Text> {result.timestamp}</Text>
          </View>
        )}

        <View style={styles.instructions}>
          <Text style={{ textAlign: 'center', color: '#ffffffff', fontSize:17}}>
            To begin analysis, upload your rice leaf image and ensure the photo is clear and well-lit for accurate detection.
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 54, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
  headerLogo: { width: 70, height: 70},
  navRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  navLink: { marginLeft: 16, color: '#dbcacaff' },
  greenButton: { backgroundColor: '#109724ff', borderRadius:100 ,height:65,width:150},
  greenButton2: { backgroundColor: '#109724ff',borderRadius:100},
  navActive: { color: '#fff', fontFamily: fonts.bold},
  content: { flex: 1, padding: 16, alignItems: 'center' },
  uploadBox: { width: '100%', maxWidth: 480, height: 340, borderWidth: 2, borderStyle: 'dashed', borderColor: '#cbd5e1', borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
  preview: { width: '100%', height: '100%', borderRadius: 10 },
  resultBox: { width: '100%', maxWidth: 480, marginTop: 16, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
  resultTitle: { fontSize: 18, fontFamily: fonts.bold, marginBottom: 4 },
  bold: { fontFamily: fonts.bold },
  instructions: { marginTop: 16, padding: 12 },
});
