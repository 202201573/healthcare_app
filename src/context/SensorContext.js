import React, { createContext, useState, useEffect } from 'react';

export const SensorContext = createContext();

export const SensorProvider = ({ children }) => {
  const [liveBpm, setLiveBpm] = useState(76);
  const [liveSpo2, setLiveSpo2] = useState(98);
  const [liveSys, setLiveSys] = useState(120);
  const [liveDia, setLiveDia] = useState(80);
  const [liveTemp, setLiveTemp] = useState(36.6);
  const [calories, setCalories] = useState(2104);
  const [steps, setSteps] = useState(8542);

  useEffect(() => {
    // Watch Sensor Simulation globally running every 2 seconds
    const liveInterval = setInterval(() => {
      setLiveBpm(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        const next = prev + change;
        if (next < 65) return 65;
        if (next > 115) return 115;
        return next;
      });
      setLiveSpo2(prev => {
        const change = Math.floor(Math.random() * 3) - 1;
        const next = prev + change;
        if (next < 95) return 95;
        if (next > 100) return 100;
        return next;
      });
      setLiveSys(prev => {
        const change = Math.floor(Math.random() * 3) - 1;
        const next = prev + change;
        if (next < 115) return 115;
        if (next > 125) return 125;
        return next;
      });
      setLiveDia(prev => {
        const change = Math.floor(Math.random() * 3) - 1;
        const next = prev + change;
        if (next < 75) return 75;
        if (next > 85) return 85;
        return next;
      });
      setLiveTemp(prev => {
        const change = (Math.random() * 0.2 - 0.1);
        const next = prev + change;
        if (next < 36.4) return 36.4;
        if (next > 37.2) return 37.2;
        return Number(next.toFixed(1));
      });
      setCalories(prev => prev + (Math.random() > 0.5 ? 1 : 0));
      setSteps(prev => prev + Math.floor(Math.random() * 4));
    }, 2000);

    return () => clearInterval(liveInterval);
  }, []);

  return (
    <SensorContext.Provider value={{ liveBpm, liveSpo2, liveSys, liveDia, liveTemp, calories, steps }}>
      {children}
    </SensorContext.Provider>
  );
};
