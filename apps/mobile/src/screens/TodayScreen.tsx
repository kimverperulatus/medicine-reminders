import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { useQuery, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabase';
import { useSupabase } from '../providers/SupabaseProvider';
import { DoseStatus } from '@elder-med/shared';

type Dose = {
  id: string;
  schedule_id: string;
  medication_name: string;
  dosage: string;
  scheduled_time: string;
  status: DoseStatus;
};

const TodayScreen = () => {
  const { user } = useSupabase();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: doses = [], isLoading, refetch } = useQuery(
    ['today-doses', user?.id],
    async () => {
      if (!user) return [];

      // Get today's date range
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Get patient ID
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError) throw patientError;
      if (!patientData) return [];

      // Get today's schedules with prescription info
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          id,
          prescription_id,
          scheduled_time,
          status,
          prescriptions (
            medication_name,
            dosage
          )
        `)
        .eq('patient_id', patientData.id)
        .gte('scheduled_time', todayStart.toISOString())
        .lte('scheduled_time', todayEnd.toISOString())
        .order('scheduled_time', { ascending: true });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        schedule_id: item.id,
        medication_name: item.prescriptions?.medication_name || 'Unknown Medication',
        dosage: item.prescriptions?.dosage || 'Unknown Dosage',
        scheduled_time: item.scheduled_time,
        status: item.status as DoseStatus,
      }));
    },
    {
      enabled: !!user,
    }
  );

  const updateDoseStatus = async (scheduleId: string, status: DoseStatus) => {
    if (!user) return;

    setLoading(true);
    try {
      // Get patient ID
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError) throw patientError;
      if (!patientData) throw new Error('Patient not found');

      // Update schedule status
      const { error: scheduleError } = await supabase
        .from('schedules')
        .update({ status })
        .eq('id', scheduleId);

      if (scheduleError) throw scheduleError;

      // Create intake log
      const { error: logError } = await supabase
        .from('intake_logs')
        .insert({
          schedule_id: scheduleId,
          patient_id: patientData.id,
          status,
          taken_at: status === 'taken' ? new Date().toISOString() : null,
        });

      if (logError) throw logError;

      // Refresh the data
      refetch();
      queryClient.invalidateQueries(['today-doses', user.id]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update dose status');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderDose = ({ item }: { item: Dose }) => {
    const scheduledTime = new Date(item.scheduled_time);
    const timeString = scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>{item.medication_name}</Title>
          <Paragraph>{item.dosage}</Paragraph>
          <Paragraph style={styles.time}>{timeString}</Paragraph>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => updateDoseStatus(item.schedule_id, 'taken')}
              disabled={loading || item.status === 'taken'}
              style={[styles.button, styles.takenButton]}
            >
              Taken
            </Button>
            <Button
              mode="outlined"
              onPress={() => updateDoseStatus(item.schedule_id, 'snoozed')}
              disabled={loading || item.status === 'taken'}
              style={[styles.button, styles.snoozeButton]}
            >
              Snooze
            </Button>
            <Button
              mode="text"
              onPress={() => updateDoseStatus(item.schedule_id, 'skipped')}
              disabled={loading || item.status === 'taken'}
              style={[styles.button, styles.skipButton]}
            >
              Skip
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading today's medications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Medications</Text>
      {doses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No medications scheduled for today</Text>
        </View>
      ) : (
        <FlatList
          data={doses}
          renderItem={renderDose}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  takenButton: {
    backgroundColor: '#2ecc71',
  },
  snoozeButton: {
    borderColor: '#3498db',
  },
  skipButton: {
    borderColor: '#e74c3c',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
});

export default TodayScreen;