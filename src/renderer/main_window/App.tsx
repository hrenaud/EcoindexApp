import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>EcoindexApp</CardTitle>
            <CardDescription>
              An application to measures the ecological impact of a website with LightHouse and Ecoindex.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Welcome to EcoindexApp! This is a sample application built with Electron, React, Tailwind, and Shadcn.
              </p>
              <div className="flex items-center gap-4">
                <Button onClick={() => setCount((count) => count + 1)}>
                  Count is {count}
                </Button>
                <Button variant="outline" onClick={() => setCount(0)}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;

