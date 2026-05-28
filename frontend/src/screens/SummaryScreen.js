import React, { useContext } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { TransactionContext } from '../context/TransactionContext';
import { AuthContext } from '../context/AuthContext'; // <-- Importamos o cérebro do login

const screenWidth = Dimensions.get('window').width;

export default function SummaryScreen() {
  const { transactions } = useContext(TransactionContext);
  const { user } = useContext(AuthContext); // <-- Puxamos o seu nome logado

  const balance = transactions.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const expenses = transactions.filter(t => t.type === 'expense');
  
  const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
  const chartData = expenses.map((expense, index) => ({
    name: expense.title,
    amount: expense.amount,
    color: colors[index % colors.length],
    legendFontColor: '#CCCCCC',
    legendFontSize: 12,
  }));

  const chartWidth = screenWidth - 48;
  const pieCentering = (chartWidth - 200) / 2;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Aqui entra a saudação personalizada */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user} 👋</Text>
        <Text style={styles.title}>Visão Geral</Text>
      </View>
      
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo Disponível</Text>
        <Text style={[styles.balanceValue, balance < 0 && styles.negativeBalance]}>
          R$ {balance.toFixed(2).replace('.', ',')}
        </Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Composição de Despesas</Text>
        
        {chartData.length > 0 ? (
          <>
            <PieChart
              data={chartData}
              width={chartWidth}
              height={200}
              chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
              accessor={"amount"}
              backgroundColor={"transparent"}
              paddingLeft={"0"}
              center={[pieCentering, 0]}
              absolute
              hasLegend={false}
            />
            
            <View style={styles.customLegendContainer}>
              {chartData.map((item, index) => (
                <View key={index} style={styles.legendRow}>
                  <View style={styles.legendNameContainer}>
                    <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                    <Text style={styles.legendName} numberOfLines={1}>{item.name}</Text>
                  </View>
                  <Text style={styles.legendAmount}>
                    R$ {item.amount.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>Nenhuma despesa registrada.</Text>
        )}
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0A0A0A', 
    paddingHorizontal: 24, 
    paddingTop: 60 
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 18,
    color: '#888888',
    marginBottom: 4,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    letterSpacing: -1, 
  },
  balanceCard: { 
    backgroundColor: '#1A1A1A', 
    padding: 24, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#222', 
    marginBottom: 32 
  },
  balanceLabel: { 
    fontSize: 16, 
    color: '#888888', 
    marginBottom: 8 
  },
  balanceValue: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    color: '#4CAF50', 
    letterSpacing: -1 
  },
  negativeBalance: { 
    color: '#E53935' 
  },
  chartContainer: { 
    backgroundColor: '#1A1A1A', 
    paddingVertical: 24, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#222', 
    minHeight: 300 
  },
  chartTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#FFFFFF', 
    marginBottom: 16, 
    paddingHorizontal: 24 
  },
  emptyText: { 
    color: '#666', 
    marginTop: 40, 
    alignSelf: 'center' 
  },
  customLegendContainer: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  legendNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendName: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  legendAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});