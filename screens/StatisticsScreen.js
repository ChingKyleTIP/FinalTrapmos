import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { LineChart } from 'react-native-chart-kit';
import { db } from '../config/firebaseConfig';

export default function StatisticsScreen() {
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    today: 0,
    lastDetected: null,
  });
  const [monthlyTrend, setMonthlyTrend] = useState(Array(12).fill(0));

  const fetchStatistics = async () => {
    try {
      const alertsRef = collection(db, 'Uploads');
      const snapshot = await getDocs(alertsRef);

      let total = 0;
      let today = 0;
      let thisWeek = 0;
      let latestDetection = null;
      const monthly = Array(12).fill(0);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart);
      weekStart.setDate(todayStart.getDate() - todayStart.getDay());

      const alerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      alerts.forEach(alert => {
        let ts = null;

        try {
          if (alert.timestamp?.toDate) {
            ts = alert.timestamp.toDate();
          } else if (alert.timestamp instanceof Date) {
            ts = alert.timestamp;
          } else if (typeof alert.timestamp === 'string' || typeof alert.timestamp === 'number') {
            ts = new Date(alert.timestamp);
          }
        } catch (e) {
          console.warn('Invalid timestamp format:', alert.timestamp);
        }

        if (ts && !isNaN(ts.getTime())) {
          const month = ts.getMonth();
          monthly[month]++;

          if (ts >= todayStart) today++;
          if (ts >= weekStart) thisWeek++;
          if (!latestDetection || ts > latestDetection) {
            latestDetection = ts;
          }

          total++;
        }
      });

      setStats({ total, thisWeek, today, lastDetected: latestDetection });
      setMonthlyTrend(monthly);
    } catch (error) {
      console.error('🔥 Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const formatLastDetected = () => {
    if (!stats.lastDetected) return 'No data';

    const now = new Date();
    const diffMs = now - stats.lastDetected;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
  };

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Detections</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.thisWeek}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.today}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatLastDetected()}</Text>
          <Text style={styles.statLabel}>Last Detection</Text>
        </View>
      </View>

      {/* Chart */}
      <Text style={styles.chartTitle}>Detection Trend</Text>
      <View style={styles.chartBox}>
        <LineChart
          data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
              {
                data: monthlyTrend,
                strokeWidth: 2,
                color: (opacity = 1) => `rgba(0, 128, 128, ${opacity})`,
              },
            ],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#f8f9fa',
            backgroundGradientFrom: '#f8f9fa',
            backgroundGradientTo: '#f8f9fa',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#3ca25f',
            },
          }}
          bezier
          style={{ borderRadius: 12 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f8fc',
    padding: 20,
    paddingTop: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#000',
  },
  chartBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
  },
});
