import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { useSupabase } from '../providers/SupabaseProvider';

const ProfileScreen = () => {
  const { user, signOut, loading } = useSupabase();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
      console.error(error);
    } finally {
      setSigningOut(false);
    }
  };

  if (loading || signingOut) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Profile</Title>
          {user ? (
            <>
              <Paragraph>Email: {user.email}</Paragraph>
              <Paragraph>User ID: {user.id}</Paragraph>
              <Button 
                mode="contained" 
                onPress={handleSignOut}
                style={styles.signOutButton}
                loading={signingOut}
                disabled={signingOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Paragraph>Not signed in</Paragraph>
          )}
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