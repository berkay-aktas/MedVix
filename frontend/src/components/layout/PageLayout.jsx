import Navbar from './Navbar';
import Stepper from './Stepper';
import DomainPillBar from './DomainPillBar';
import FooterNav from './FooterNav';

export default function PageLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <Stepper />
      <DomainPillBar />

      {/* Main content area */}
      <main className="flex-1 px-4 sm:px-8 pb-6">
        <div className="max-w-[1400px] mx-auto">{children}</div>
      </main>

      <FooterNav />
    </div>
  );
}
