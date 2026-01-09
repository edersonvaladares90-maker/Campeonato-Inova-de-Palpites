
import React, { useState, useEffect, useCallback } from 'react';
import { ClockIcon } from './icons';

interface CountdownTimerProps {
    deadline: number;
    onEnd: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ deadline, onEnd }) => {
    const calculateTimeLeft = useCallback(() => {
        const difference = deadline - Date.now();
        let timeLeft: { [key: string]: number } = {};

        if (difference > 0) {
            timeLeft = {
                dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
                horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutos: Math.floor((difference / 1000 / 60) % 60),
                segundos: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    }, [deadline]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        if (Object.keys(timeLeft).length === 0) {
            return; // Stop timer when time is up
        }

        const timer = setTimeout(() => {
            const newTimeLeft = calculateTimeLeft();
            if (Object.keys(newTimeLeft).length === 0) {
                // Call onEnd only when the timer expires
                onEnd();
            }
            setTimeLeft(newTimeLeft);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, calculateTimeLeft, onEnd]);

    // FIX: Removed explicit JSX.Element[] type to avoid namespace error.
    const timerComponents: React.ReactNode[] = [];

    Object.keys(timeLeft).forEach((interval) => {
        // FIX: Removed faulty check that hid values of 0.
        timerComponents.push(
            <div key={interval} className="flex flex-col items-center">
                <span className="text-xl md:text-2xl font-bold">{timeLeft[interval as keyof typeof timeLeft]}</span>
                <span className="text-xs uppercase">{interval}</span>
            </div>
        );
    });

    return (
        <div className="flex items-center justify-center space-x-4 p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-700 dark:text-blue-200">
            <ClockIcon className="w-8 h-8"/>
            {timerComponents.length ? (
                <div className="flex space-x-2 md:space-x-4">{timerComponents}</div>
            ) : (
                <span className="text-lg font-semibold">Tempo esgotado!</span>
            )}
        </div>
    );
};

export default CountdownTimer;
