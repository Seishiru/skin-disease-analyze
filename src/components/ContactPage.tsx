import { Construction } from 'lucide-react';
import { Card } from './ui/card';

export function ContactPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <Card className="max-w-2xl w-full p-8 sm:p-12 text-center">
        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
          <Construction className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-4">
          Under Maintenance
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-6">
          This page is currently under construction. We're working hard to bring you something amazing!
        </p>
        <p className="text-muted-foreground">
          Please check back soon or visit our Analysis page to start analyzing skin conditions.
        </p>
      </Card>
    </div>
  );
}
