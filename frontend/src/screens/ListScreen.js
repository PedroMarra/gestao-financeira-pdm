import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransactionContext } from '../context/TransactionContext';

export default function ListScreen() {
  const { transactions, addTransaction, deleteTransaction } = useContext(TransactionContext);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');

  const handleAddTransaction = () => {
    if (title.trim() === '' || amount.trim() === '') return;

    // Converte vírgula para ponto e garante que é um número
    const numericAmount = parseFloat(amount.replace(',', '.'));

    if (isNaN(numericAmount)) {
      Alert.alert('Erro', 'Por favor, insira um valor numérico válido.');
      return;
    }

    const newTransaction = {
      id: Math.random().toString(),
      title,
      type,
      amount: numericAmount,
      date: 'Hoje',
    };

    addTransaction(newTransaction);
    
    setTitle('');
    setAmount('');
    setModalVisible(false);
  };

  // Função que chama o alerta de confirmação antes de apagar
  const handleDelete = (id, transactionTitle) => {
    Alert.alert(
      "Excluir Movimentação",
      `Tem certeza que deseja apagar "${transactionTitle}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: () => deleteTransaction(id) 
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDate}>{item.date}</Text>
      </View>
      <View style={styles.rightSection}>
        <Text style={[styles.cardAmount, item.type === 'income' ? styles.income : styles.expense]}>
          {item.type === 'income' ? '+ R$' : '- R$'} {item.amount.toFixed(2).replace('.', ',')}
        </Text>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.title)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="#666666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Movimentações</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {transactions.length > 0 ? (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma movimentação registrada.</Text>
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Movimentação</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.typeSelector}>
              <TouchableOpacity 
                style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]}
                onPress={() => setType('expense')}
              >
                <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>Despesa</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
                onPress={() => setType('income')}
              >
                <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>Receita</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Ex: Tênis novo"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Valor (Ex: 150,00)"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleAddTransaction}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', paddingHorizontal: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: -1 },
  addButton: { backgroundColor: '#FFFFFF', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 24 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#666666', fontSize: 16 },
  card: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#222' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  cardDate: { fontSize: 14, color: '#666666' },
  rightSection: { flexDirection: 'row', alignItems: 'center' },
  cardAmount: { fontSize: 16, fontWeight: 'bold' },
  deleteButton: { marginLeft: 16, padding: 4 },
  income: { color: '#4CAF50' },
  expense: { color: '#E53935' },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, borderWidth: 1, borderColor: '#333' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  typeSelector: { flexDirection: 'row', marginBottom: 20, gap: 12 },
  typeButton: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  typeButtonActiveExpense: { backgroundColor: 'rgba(229, 57, 53, 0.1)', borderColor: '#E53935' },
  typeButtonActiveIncome: { backgroundColor: 'rgba(76, 175, 80, 0.1)', borderColor: '#4CAF50' },
  typeText: { color: '#888', fontWeight: '600' },
  typeTextActive: { color: '#FFF' },
  input: { backgroundColor: '#0A0A0A', color: '#FFFFFF', borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: '#333', marginBottom: 16 },
  saveButton: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' },
});