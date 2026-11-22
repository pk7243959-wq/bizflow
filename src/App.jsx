import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import NotFound from './pages/NotFound.jsx';
import Customers from './pages/Customers.jsx';
import Invoices from './pages/Invoices.jsx';
import Payments from './pages/Payments.jsx';
import Expenses from './pages/Expenses.jsx';
import CashFlow from './pages/Cashflow.jsx';
import Reminders from './pages/Reminders.jsx';
import Settings from './pages/Settings.jsx';

const TempPage = ({ title }) => <div style={{ padding: '20px' }}><h1>{title}</h1><p>Under construction for Milestone 1.</p></div>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="customers" element={<Customers />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="payments" element={<Payments />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="cash-flow" element={<CashFlow />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="settings" element={<Settings/>} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}