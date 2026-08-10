import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { VulnerabilityProvider } from './context/VulnerabilityContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Vulnerabilities } from './pages/Vulnerabilities';
import { PatchQueue } from './pages/PatchQueue';
import { Intelligence } from './pages/Intelligence';
import { AiModel } from './pages/AiModel';
import { About } from './pages/About';

export const App: React.FC = () => {
    return (
        <VulnerabilityProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="vulnerabilities" element={<Vulnerabilities />} />
                        <Route path="patch-queue" element={<PatchQueue />} />
                        <Route path="intelligence" element={<Intelligence />} />
                        <Route path="ai-model" element={<AiModel />} />
                        <Route path="about" element={<About />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </VulnerabilityProvider>
    );
};

export default App;
