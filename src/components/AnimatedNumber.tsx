import React, { useEffect, useState } from 'react';

interface Props {
    value: number;
    duration?: number;
}

export const AnimatedNumber: React.FC<Props> = ({ value, duration = 1000 }) => {
    const [displayVal, setDisplayVal] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const start = 0;
        const end = value;
        if (start === end) {
            setDisplayVal(end);
            return;
        }

        const startTime = performance.now();

        const updateNumber = (now: number) => {
            if (!isMounted) return;
            const progress = Math.min((now - startTime) / duration, 1);
            // Ease-out quad formula
            const ease = progress * (2 - progress);
            const current = Math.floor(ease * (end - start) + start);
            setDisplayVal(current);

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                setDisplayVal(end);
            }
        };

        requestAnimationFrame(updateNumber);
        return () => {
            isMounted = false;
        };
    }, [value, duration]);

    // Return the formatted number
    return <span>{displayVal.toLocaleString()}</span>;
};

export default AnimatedNumber;
