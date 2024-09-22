import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { parseUnits } from 'ethers'; 

const Buy = ({ provider, price, crowdsale, setIsLoading, isWhitelisted, saleState, minTokens, maxTokens }) => {
    const [amount, setAmount] = useState('0');
    const [isWaiting, setIsWaiting] = useState(false);

    const buyHandler = async (e) => {
        e.preventDefault();
        setIsWaiting(true);

        const numericAmount = parseFloat(amount); 

        if (numericAmount < parseFloat(minTokens) || numericAmount > parseFloat(maxTokens)) {
            window.alert(`Amount must be between ${minTokens} and ${maxTokens} tokens.`);
            setIsWaiting(false);
            return;
        }

        try {
            const signer = await provider.getSigner();
            const value = parseUnits((numericAmount * price).toString(), 'ether');
            const formattedAmount = parseUnits(numericAmount.toString(), 'ether');

            const transaction = await crowdsale.connect(signer).buyTokens(formattedAmount, { value });
            await transaction.wait();
        } catch (error) {
            console.error('Transaction error:', error);
            window.alert('User rejected or transaction reverted');
        }

        setIsLoading(true);
        setIsWaiting(false);
    };

    return (
        <Form onSubmit={buyHandler} style={{ maxWidth: '800px', margin: '50px auto' }}>
            <Form.Group as={Row}>
                <Col>
                    <Form.Control
                        type="number"
                        placeholder="Enter amount"
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </Col>
                <Col className="text-center">
                    {isWaiting ? (
                        <Spinner animation="border" />
                    ) : isWhitelisted ? (
                        saleState === 'Open' ? (
                            <Button variant="primary" type="submit" style={{ width: '100%' }}>
                                Buy Tokens
                            </Button>
                        ) : (
                            <p className="text-center text-warning">The sale is currently closed.</p>
                        )
                    ) : (
                        <p className="text-center text-danger">You are not whitelisted to buy tokens.</p>
                    )}
                </Col>
            </Form.Group>
        </Form>
    );
};

export default Buy;
