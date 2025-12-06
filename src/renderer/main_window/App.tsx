import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

function App() {
    const [count, setCount] = useState(0)
    const { t } = useTranslation()

    return (
        <div className="bg-background min-h-screen p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('app.title')}</CardTitle>
                        <CardDescription>
                            {t('app.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-muted-foreground">
                                {t('app.welcome')}
                            </p>
                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={() =>
                                        setCount((count) => count + 1)
                                    }
                                >
                                    {t('app.count', { count })}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setCount(0)}
                                >
                                    {t('app.reset')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default App
