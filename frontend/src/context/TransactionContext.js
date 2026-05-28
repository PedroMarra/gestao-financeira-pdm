import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);

  // 1. CARREGA os dados apenas uma vez ao abrir o aplicativo
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const storedData = await AsyncStorage.getItem('@flux_transactions');
        if (storedData) {
          setTransactions(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadTransactions();
  }, []);

  // 2. ADICIONA na tela e já SALVA direto na memória do celular
  const addTransaction = async (transaction) => {
    try {
      const newTransactions = [transaction, ...transactions];
      setTransactions(newTransactions); // Atualiza a tela
      await AsyncStorage.setItem('@flux_transactions', JSON.stringify(newTransactions)); // Salva no aparelho
    } catch (error) {
      console.error('Erro ao salvar nova movimentação:', error);
    }
  };

  // 3. DELETA da tela e já ATUALIZA a memória do celular
  const deleteTransaction = async (id) => {
    try {
      const newTransactions = transactions.filter(t => t.id !== id);
      setTransactions(newTransactions); // Atualiza a tela
      await AsyncStorage.setItem('@flux_transactions', JSON.stringify(newTransactions)); // Salva no aparelho
    } catch (error) {
      console.error('Erro ao deletar movimentação:', error);
    }
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, deleteTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};