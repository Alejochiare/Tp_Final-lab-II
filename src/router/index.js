import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Wallet from '../components/Wallet.vue';
import History from '../components/History.vue';
import Analysis from '../components/Analysis.vue';
import TransactionHistory from '../components/TransactionHistory.vue';

const routes = [
  { path: '/', component: Login }, 
  { path: '/wallet', component: Wallet },
  { path: '/history', component: History },
  { path: '/analysis', component: Analysis },
  { path: '/transaction-history', component: TransactionHistory },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
