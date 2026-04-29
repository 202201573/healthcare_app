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
    let mode = 'normal'; 
    let modeTicks = 0;

    const liveInterval = setInterval(() => {
      if (modeTicks <= 0) {
          const r = Math.random();
          if (r < 0.15) { mode = 'critical'; modeTicks = 5; } // 10s of critical
          else if (r < 0.35) { mode = 'elevated'; modeTicks = 8; } // 16s of elevated
          else { mode = 'normal'; modeTicks = 15; } // 30s of normal
      }
      modeTicks--;

      setLiveBpm(prev => {
        let target = 75;
        if (mode === 'elevated') target = 105;
        if (mode === 'critical') target = 135;
        const change = (target - prev) * 0.3 + (Math.random() * 6 - 3);
        return Math.round(prev + change);
      });

      setLiveSpo2(prev => {
        let target = 98;
        if (mode === 'elevated') target = 93;
        if (mode === 'critical') target = 87;
        const change = (target - prev) * 0.3 + (Math.random() * 2 - 1);
        return Math.round(prev + change);
      });

      setLiveSys(prev => {
        let target = 120;
        if (mode === 'elevated') target = 135;
        if (mode === 'critical') target = 155;
        const change = (target - prev) * 0.3 + (Math.random() * 4 - 2);
        return Math.round(prev + change);
      });

      setLiveDia(prev => {
        let target = 80;
        if (mode === 'elevated') target = 90;
        if (mode === 'critical') target = 100;
        const change = (target - prev) * 0.3 + (Math.random() * 4 - 2);
        return Math.round(prev + change);
      });

      setLiveTemp(prev => {
        let target = 36.6;
        if (mode === 'elevated') target = 37.6;
        if (mode === 'critical') target = 38.8;
        const change = (target - prev) * 0.2 + (Math.random() * 0.2 - 0.1);
        return Number((prev + change).toFixed(1));
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
