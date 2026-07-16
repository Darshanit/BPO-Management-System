import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { MdPeople, MdWork, MdPayments, MdChat } from 'react-icons/md';

const FEATURES = [
  { icon: MdPeople, title: 'Employee Management', desc: 'Onboarding, profiles, documents, performance — all in one place.' },
  { icon: MdWork, title: 'Projects & Tasks', desc: 'Kanban boards, milestones, and deadlines your teams will actually use.' },
  { icon: MdPayments, title: 'Payroll & Attendance', desc: 'Clock in/out, leave balances, payslips generated automatically.' },
  { icon: MdChat, title: 'Real-time Chat', desc: 'Private and team chat with typing indicators and read receipts.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-brutal-white">
      <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b-brutal border-black">
        <h1 className="font-display font-bold text-2xl">
          BPO<span className="text-brutal-pink">.</span>Manager
        </h1>
        <div className="flex gap-3">
          <Link to="/login">
            <Button variant="white" size="sm">Log In</Button>
          </Link>
          <Link to="/register">
            <Button variant="yellow" size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <section className="px-6 md:px-12 py-20 text-center max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="font-display font-bold text-4xl md:text-6xl leading-tight mb-6"
        >
          Run your BPO like it's <span className="bg-brutal-yellow px-2 border-brutal border-black rounded-brutal-sm">2026</span>
        </motion.h2>
        <p className="text-lg text-black/70 font-semibold mb-8">
          Employees, attendance, payroll, projects, clients, and chat — one bold, no-nonsense platform.
        </p>
        <Link to="/register">
          <Button variant="pink" className="text-white">Start Free</Button>
        </Link>
      </section>

      <section className="px-6 md:px-12 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <Card key={title} interactive>
            <div className="bg-brutal-green border-brutal border-black rounded-brutal-sm p-3 w-fit mb-4">
              <Icon size={24} />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
            <p className="text-sm text-black/60">{desc}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
