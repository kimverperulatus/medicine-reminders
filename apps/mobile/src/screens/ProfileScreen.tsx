import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { useSupabase } from '../providers/SupabaseProvider';

const ProfileScreen = () => {
  const { user, signOut } = useSupabase();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Profile</Title>
          {user ? (
            <>
              <Paragraph>Email: {user.email}</Paragraph>
              <Paragraph>User ID: {user.id}</Paragraph>
            </>
          ) : (
            <Paragraph>Not signed in</Paragraph>
          )}
          <Button 
            mode="contained" 
            onPress={handleSignOut}
            style={styles.signOutButton}
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginVertical: 16,
  },
  signOutButton: {
    marginTop: 16,
  },
});

export default ProfileScreen;