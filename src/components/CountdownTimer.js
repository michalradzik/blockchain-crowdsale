import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const CountdownTimer = ({ saleEnd }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = saleEnd - new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft]);

    return (
        <div className="text-center">
            {Object.keys(timeLeft).length ? (
                <div>
                    <h2>Sale ends in:</h2>
                    <p>{`${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}</p>
                </div>
            ) : (
                <p>The sale has ended!</p>
            )}
        </div>
    );
};

export default CountdownTimer;
